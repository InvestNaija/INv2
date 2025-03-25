import { NextFunction, Request, Response } from 'express';
import { CustomError, Exception, ZanibalService } from "@inv2/common";

export class TestController {
   public static async createZanibalCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
      // const profiler = Logger.logger.startTimer();
      try {         
         const body = req.body;
         const zanibalService = await (new ZanibalService).init();
         const user = await zanibalService.createUpdateCustomer(body);
         res.status(200).json(user);
         // profiler.done({message: `Finished processing login request`});
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
}