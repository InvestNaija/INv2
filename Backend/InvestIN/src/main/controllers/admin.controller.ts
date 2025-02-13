import { NextFunction, Request, Response } from 'express';
import { Exception, handleError, INLogger, JoiMWDecorator } from "@inv2/common";

import { AdminService } from '../services';
import { AdminValidation } from '../validations/admin.schema';

export class AdminController {
   @JoiMWDecorator(AdminValidation.create)
   public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {         
         const adminSvc = new AdminService;
         const user = await adminSvc.create(req.body);
         res.status(user.code).json(user);
         profiler.done({service: `InvestIN`, message: `New InvestIN Asset created successfully`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));
      }
   }
   public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {         
         const saveplanSvc = new AdminService;
         const user = await saveplanSvc.list(req.params.type);
         res.status(user.code).json(user);
         profiler.done({service: `SavePlan`, message: `List of saveplas retrieved successfully`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));
      }
   }
   @JoiMWDecorator(AdminValidation.update)
   public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {         
         const adminSvc = new AdminService;
         const user = await adminSvc.update(req.params.id, req.body);
         res.status(user.code).json(user);
         
         profiler.done({service: `SavePlan`, message: `Update SavePlan with id ${req.params.id} successfully`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));
      }
   }
}