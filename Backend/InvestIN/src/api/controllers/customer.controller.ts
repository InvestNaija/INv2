import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPost, request, response, next } from 'inversify-express-utils';
import { inject } from 'inversify';
import { AssetSubscriptionService } from '../../business/services/subscription.service';
import { AssetService } from '../../business/services/asset.service';
import { Exception, handleError, INLogger, JoiMWDecorator, moment } from '@inv2/common';
import { CustomerValidation } from '../validations/customer.validation';
import { AssetSubscriptionDto, AssetRedemptionDto } from '../../_dtos/asset-subscription.dto';

/**
 * Customer Controller
 * Provides endpoints for customer operations like fund listings, subscriptions and redemptions.
 */
@controller('/customer')
export class CustomerController {
   constructor(
      @inject(AssetSubscriptionService)
      private readonly subscriptionService: AssetSubscriptionService,
      @inject(AssetService)
      private readonly assetService: AssetService,
   ) {}

   /**
    * List available funds (assets) for customers.
    */
   @httpGet('/assets')
   async listAssets(@request() req: Request, @response() res: Response, @next() next: NextFunction) {
      const profiler = INLogger.log.startTimer();
      try {
         const result = await this.assetService.getAllAssets();
         res.status(result.code).json(result);
         profiler.done({ service: 'InvestIN', message: 'Retrieved fund list for customer' });
      } catch (error: any) {
         next(new Exception(handleError(error)));
      }
   }

   /**
    * Create a new fund subscription request.
    * Validated via JoiMWDecorator.
    */
   @httpPost('/asset/subscribe')
   @JoiMWDecorator(CustomerValidation.subscribe)
   async subscribe(@request() req: Request, @response() res: Response, @next() next: NextFunction) {
      const profiler = INLogger.log.startTimer();
      try {
         const data: AssetSubscriptionDto = req.body;
         const result = await this.subscriptionService.createSubscription(req.currentUser!, data);
         res.status(result.code).json(result);
         profiler.done({ service: 'InvestIN', message: 'Initiated subscription' });
      } catch (error: any) {
         next(new Exception(handleError(error)));
      }
   }

   /**
    * Create a new fund redemption request.
    */
   @httpPost('/asset/redeem')
   @JoiMWDecorator(CustomerValidation.redeem)
   async redeem(@request() req: Request, @response() res: Response, @next() next: NextFunction) {
      const profiler = INLogger.log.startTimer();
      try {
         const data: AssetRedemptionDto = req.body;
         const result = await this.subscriptionService.createRedemption(req.currentUser!, data);
         res.status(result.code).json(result);
         profiler.done({ service: 'InvestIN', message: 'Initiated redemption' });
      } catch (error: any) {
         next(new Exception(handleError(error)));
      }
   }
}
