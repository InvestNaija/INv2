import { NextFunction, Request, Response } from 'express';
import { Exception, handleError, INLogger } from "@inv2/common";

// import { AuthValidation } from '../validations/auth.schema';

import { CustomerService } from '../../business/services';

export class CustomerController {
   public static async healthz(req: Request, res: Response): Promise<void> {
      res.status(200).json({status:200, message: "Auth server is Healthy"});
   }

   public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
      // console.log(req?.currentUser);
      
      const profiler = INLogger.log.startTimer();
      try {         
         const saveplanSvc = new CustomerService;
         const user = await saveplanSvc.list(req.params.type);
         res.status(user.code).json(user);
         profiler.done({service: `SavePlan`, message: `Finished processing login request`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));
      }
   }
   
   public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {         
         const saveplanSvc = new CustomerService;
         const user = await saveplanSvc.create(req.params.type);
         res.status(user.code).json(user);
         profiler.done({service: `SavePlan`, message: `Finished processing login request`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));
      }
   }
}