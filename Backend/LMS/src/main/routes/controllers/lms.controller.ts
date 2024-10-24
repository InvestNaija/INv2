import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator } from "@inv2/common";
import { LmsValidation  } from '../validations/lms.schema';

import { LmsService} from '../services';


export class LmsController {

   public static async healthz(req: Request, res: Response): Promise<void> {
      res.status(200).json({status:200, message: "Auth server is Healthy"});
   }

   @JoiMWDecorator(LmsValidation.signup)
   public static async createLms(req: Request, res: Response, next: NextFunction): Promise<void> {
      // const profiler = Logger.logger.startTimer();
      try {         
         const body = req.body;
         const lmsService = new LmsService;
         const lms = await lmsService.createLms(body);
         res.status(lms.code).json(lms);
         // profiler.done({message: `Finished processing login request`});
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
      // console.log(cxn.postgres.manager.find(INUser));
      // console.log(await cxn.default?.pgINv2?.models?.User.findAll());
   }
   @JoiMWDecorator(LmsValidation.signup)
   public static async updateLms(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const body = req.body;
         const id = req.params.id;
         const lmsService = new LmsService;
         const lms = await lmsService.updateLms(id, body);
         res.status(lms.code).json(lms);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   public static async getLms(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const query = req.query;
         const lmsService = new LmsService;
         const lms = await lmsService.getLms(query);
         res.status(lms.code).json(lms);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }

   public static async deleteLms(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const id = req.params.id;
         const lmsService = new LmsService;
         const lms = await lmsService.deleteLms(id);
         res.status(lms.code).json(lms);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
}