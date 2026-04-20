import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { NextFunction, Request, Response } from 'express';
import { Exception, handleError, INLogger, JoiMWDecorator } from "@inv2/common";

// import { AuthValidation } from '../validations/auth.schema';

import { CustomerSaveplanService } from '../../business/services';
import { CustomerSavePlanValidation } from '../validations/customer.schema';

@controller("/customer")
export class CustomerSaveplanController {
   constructor(private readonly customerSvc: CustomerSaveplanService) {}

   @httpGet('/healthz')
   public async healthz(req: Request, res: Response): Promise<void> {
      res.status(200).json({status:200, message: "SavePlan server is Healthy"});
   }

   @httpGet("/:type?")
   public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
      // console.log(req?.currentUser);
      
      const profiler = INLogger.log.startTimer();
      try {         
         const user = await this.customerSvc.list(req.params.type);
         res.status(user.code).json(user);
         profiler.done({service: `SavePlan`, message: `Finished processing login request`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));
      }
   }
   
   @JoiMWDecorator(CustomerSavePlanValidation.create)
   @httpPost("/")
   public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {         
         const body = req.body;
         const saveplan = await this.customerSvc.create(req.currentUser!, body);
         res.status(saveplan.code).json(saveplan);
         profiler.done({service: `SavePlan`, message: `Finished processing login request`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));
      }
   }
}
