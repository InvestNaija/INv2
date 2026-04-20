import { Request, Response, NextFunction } from 'express';
import {
   controller,
   httpGet,
   httpPost,
   httpPut,
   httpDelete,
   request,
   response,
   next,
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { AssetService } from '../../business/services/asset.service';
import { AssetSubscriptionService } from '../../business/services/subscription.service';
import { Exception, handleError, INLogger, JoiMWDecorator } from '@inv2/common';
import { AdminValidation } from '../validations/admin.validation';

/**
 * Admin Controller
 * Provides endpoints for administrative tasks such as asset management
 * and transaction posting (T+1).
 */
@controller('/admin')
export class AdminController {
   constructor(
      @inject(AssetService) private readonly assetService: AssetService,
      @inject(AssetSubscriptionService) private readonly subscriptionService: AssetSubscriptionService,
   ) {}

   /**
    * Create a new investment asset.
    */
   @httpPost('/assets')
   @JoiMWDecorator(AdminValidation.createAsset)
   async createAsset(@request() req: Request, @response() res: Response, @next() next: NextFunction) {
      const profiler = INLogger.log.startTimer();
      try {
         const result = await this.assetService.createAsset(req.body);
         res.status(result.code).json(result);
         profiler.done({ service: 'InvestIN', message: 'Created new asset' });
      } catch (error: any) {
         next(new Exception(handleError(error)));
      }
   }

   /**
    * Get all registered assets.
    */
   @httpGet('/assets')
   async getAllAssets(@request() req: Request, @response() res: Response, @next() next: NextFunction) {
      const profiler = INLogger.log.startTimer();
      try {
         const result = await this.assetService.getAllAssets();
         res.status(result.code).json(result);
         profiler.done({ service: 'InvestIN', message: 'Retrieved all assets' });
      } catch (error: any) {
         next(new Exception(handleError(error)));
      }
   }

   /**
    * Get a single asset by ID.
    */
   @httpGet('/assets/:id')
   async getAssetById(@request() req: Request, @response() res: Response, @next() next: NextFunction) {
      try {
         const result = await this.assetService.getAssetById(req.params.id);
         res.status(result.code).json(result);
      } catch (error: any) {
         next(new Exception(handleError(error)));
      }
   }

   /**
    * Update an existing asset.
    */
   @httpPut('/assets/:id')
   async updateAsset(@request() req: Request, @response() res: Response, @next() next: NextFunction) {
      try {
         const result = await this.assetService.updateAsset(req.params.id, req.body);
         res.status(result.code).json(result);
      } catch (error: any) {
         next(new Exception(handleError(error)));
      }
   }

   /**
    * Delete an asset.
    */
   @httpDelete('/:id')
   async deleteAsset(@request() req: Request, @response() res: Response, @next() next: NextFunction) {
      try {
         const result = await this.assetService.deleteAsset(req.params.id);
         res.status(result.code).json(result);
      } catch (error: any) {
         next(new Exception(handleError(error)));
      }
   }

   /**
    * Lists all pending transactions for T+1 posting.
    */
   @httpGet('/transactions/pending')
   async getPendingTransactions(@request() req: Request, @response() res: Response, @next() next: NextFunction) {
      try {
         const result = await this.subscriptionService.listPendingTransactions();
         res.status(result.code).json(result);
      } catch (error: any) {
         next(new Exception(handleError(error)));
      }
   }

   /**
    * Finalizes/Posts a transaction to the vendor (T+1 action).
    */
   @httpPost('/transactions/post/:id')
   async postTransaction(@request() req: Request, @response() res: Response, @next() next: NextFunction) {
      const profiler = INLogger.log.startTimer();
      try {
         const result = await this.subscriptionService.postTransaction(req.params.id);
         res.status(result.code).json(result);
         profiler.done({ service: 'InvestIN', message: `Posted transaction ${req.params.id} to vendor` });
      } catch (error: any) {
         next(new Exception(handleError(error)));
      }
   }

   /**
    * List transactions with filtering and pagination.
    */
   @httpGet('/funds')
   @JoiMWDecorator(AdminValidation.getFunds)
   async getFunds(@request() req: Request, @response() res: Response, @next() next: NextFunction) {
      const profiler = INLogger.log.startTimer();
      try {
         const result = await this.subscriptionService.getTransactions(req.query);
         res.status(result.code).json(result);
         profiler.done({ service: 'InvestIN', message: 'Retrieved filtered transaction list' });
      } catch (error: any) {
         next(new Exception(handleError(error)));
      }
   }
}
