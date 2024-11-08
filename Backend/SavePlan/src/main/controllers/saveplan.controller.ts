import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, INLogger } from "@inv2/common";
// import { AuthValidation } from '../validations/auth.schema';

import { SaveplanService } from '../services';

export class SaveplanController {
   public static async healthz(req: Request, res: Response): Promise<void> {
      res.status(200).json({status:200, message: "Auth server is Healthy"});
   }

   public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {         
         const authService = new SaveplanService;
         const user = await authService.list();
         res.status(user.code).json(user);
         profiler.done({message: `Finished processing login request`});
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
}