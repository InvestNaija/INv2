import { Request, Response, NextFunction } from 'express';
import { Exception, CustomError, JoiMWDecorator } from "@inv2/common";
import { LogService } from '../services/log.service';
import { LogValidation } from '../validations/log.schema';

export class LogController {
   // @JoiMWDecorator(LogValidation.create)
   public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const logService = new LogService;
         const log = await logService.create(req.body)
         res.status(log.code).send(log);
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
}