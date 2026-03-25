import { injectable, inject } from 'inversify';
import { IAssetRepository } from '../../domain/sequelize/repositories/asset.repository';
import { IAssetTransactionRepository } from '../../domain/sequelize/repositories/transaction.repository';
import { TYPES } from '../types';
import moment from 'moment';
import { ZanibalService } from './zanibal.service';
import { IResponse, Exception, handleError, INLogger, Helper, UserTenantRoleDto, DBEnums, HolidayService, RedisService } from '@inv2/common';
import { GrpcClient } from '../../grpc/client';
import { redisWrapper } from '../../redis.wrapper';
import {
   AssetSubscriptionDto,
   AssetRedemptionDto,
   PostTransactionDto,
} from '../../_dtos/asset-subscription.dto';

/**
 * Asset Subscription Service
 * Handles customer-facing operations for asset subscriptions and redemptions.
 */
@injectable()
export class AssetSubscriptionService {
   constructor(
      @inject(TYPES.AssetRepository) private readonly assetRepository: IAssetRepository,
      @inject(TYPES.AssetTransactionRepository) private readonly transactionRepository: IAssetTransactionRepository,
      @inject(ZanibalService) private readonly zanibalService: ZanibalService,
   ) {}

   /**
    * Initiates a fund subscription for a customer.
    */
   async createSubscription(currentUser: UserTenantRoleDto, data: AssetSubscriptionDto): Promise<IResponse> {
      try {
         const { assetCode, transAmount, portfolioId, currency, gateway, callbackParams } = data;

         const asset = await this.assetRepository.findByAssetCode(assetCode);
         if (!asset) throw new Exception({ code: 404, message: 'Asset not found' });

         // Use DBEnums to find codes to ensure consistency with the SMALLINT columns
         const pendingStatus = DBEnums.OrderStatus.find(g => g.name === 'pending')?.code || 100;

         const redisSvc = new RedisService(redisWrapper.client);
         const holidaySvc = new HolidayService(redisSvc);
         const nextBizDay = await holidaySvc.getNextBusinessDay(moment().format('YYYY-MM-DD'));

         const transaction = await this.transactionRepository.create({
            vendor: 'zanibal',
            module: 'fund',
            customerId: currentUser.user.id,
            assetId: asset.id,
            portfolioId,
            transactionType: 'subscription',
            amount: transAmount,
            currency: currency || asset.currency,
            status: pendingStatus as any,
            paymentStatus: pendingStatus as any,
            postdate: nextBizDay,
         });

         let authorizationUrl: string | undefined;
         let financeTxnId: string | undefined;
         const transactionReference = Helper.genRandomCode(20, { includeSpecialChars: false, includeLowerChars: false });

         try {
            const client = await GrpcClient.start();
            const paymentResponse = await GrpcClient.initializePayment(client, {
               amount: transAmount,
               currency: currency || asset.currency,
               description: `Payment for ${asset.name} subscription`,
               user_id: currentUser.user.id,
               module: 'InvestIN',
               module_id: transaction.id, 
               gateway: gateway,
               reference: transactionReference,
               callbackParams: callbackParams,
            } as any);

            if (paymentResponse.success && paymentResponse.data) {
               authorizationUrl = (paymentResponse.data as any).authorizationUrl;
               financeTxnId = (paymentResponse.data as any).id;
               
               await this.transactionRepository.update(transaction.id, {
                  transactionId: financeTxnId,
               });
            }
         } catch (grpcError: any) {
            INLogger.log.error(`Failed to initialize payment for InvestIN subscription: ${grpcError.message}`);
         }

         return {
            success: true,
            code: 201,
            message: 'Subscription initiated successfully. Please complete payment.',
            data: {
               transactionId: transaction.id,
               authorizationUrl,
               reference: transactionReference,
            },
         };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }

   /**
    * Initiates a fund redemption request for a customer.
    */
   async createRedemption(currentUser: UserTenantRoleDto, data: AssetRedemptionDto): Promise<IResponse> {
      try {
         const { assetCode, transAmount, portfolioId, currency } = data;

         const asset = await this.assetRepository.findByAssetCode(assetCode);
         if (!asset) throw new Exception({ code: 404, message: 'Asset not found' });

         const pendingStatus = DBEnums.OrderStatus.find(g => g.name === 'pending')?.code || 100;

         const transaction = await this.transactionRepository.create({
            vendor: 'zanibal',
            module: 'fund',
            customerId: currentUser.user.id,
            assetId: asset.id,
            portfolioId,
            transactionType: 'redemption',
            amount: transAmount,
            currency: currency || asset.currency,
            status: pendingStatus as any,
            paymentStatus: pendingStatus as any,
         });

         return {
            success: true,
            code: 201,
            message: 'Redemption request logged. Status will be updated upon admin approval.',
            data: { transactionId: transaction.id },
         };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }

   /**
    * Administrator-only: Finalizes/Posts a transaction to the vendor (T+1).
    */
   async postTransaction(txnId: string): Promise<IResponse> {
      try {
         const transaction = await this.transactionRepository.findById(txnId);
         if (!transaction) throw new Exception({ code: 404, message: 'Transaction record not found' });
         
         // Use DBEnums object returned by getter
         if (transaction.status?.name === 'success') {
            throw new Exception({ code: 400, message: 'Transaction already posted' });
         }

         const asset = await this.assetRepository.findById(transaction.assetId);
         if (!asset) throw new Exception({ code: 404, message: 'Asset not found for transaction' });

         const vendorRequest = {
            portfolioId: transaction.portfolioId,
            fundName: asset.externalIdentifier,
            transType: transaction.transactionType === 'subscription' ? 'SUBSCRIPTION' : 'REDEMPTION',
            transAmount: transaction.amount,
            currency: transaction.currency,
            transactionDate: moment().format('YYYY-MM-DD'),
            description: `Admin T+1 Post: ${asset.name} (${transaction.transactionType})`,
         };

         const initiateResponse = await this.zanibalService.createFundTransaction(vendorRequest);
         const vendorTxnId = initiateResponse.data?.id;

         if (!vendorTxnId) {
            throw new Exception({ code: 500, message: 'Failed to initiate transaction with vendor' });
         }

         const postResponse = await this.zanibalService.postFundTransaction(vendorTxnId);

         const successStatus = DBEnums.OrderStatus.find(g => g.name === 'success')?.code || 103;

         await this.transactionRepository.update(txnId, {
            moduleId: vendorTxnId,
            request: vendorRequest,
            response: postResponse.data,
            status: successStatus as any,
         });

         return {
            success: true,
            code: 200,
            message: 'Transaction posted to vendor successfully',
            data: postResponse.data,
         };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }

   /**
    * Lists pending transactions for administrative review/posting.
    */
   async listPendingTransactions(): Promise<IResponse> {
      try {
         const { getDbCxn } = require('../../domain');
         const { AssetTransaction } = require('../../domain/sequelize/models/transaction.model');
         const repo = getDbCxn().getRepository(AssetTransaction);
         
         const pendingStatusCode = DBEnums.OrderStatus.find(g => g.name === 'pending')?.code || 100;

         const transactions = await repo.findAll({
            where: { status: pendingStatusCode },
            order: [['created_at', 'DESC']],
         });

         return {
            success: true,
            code: 200,
            message: 'Pending transactions retrieved',
            data: transactions,
         };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }
}
