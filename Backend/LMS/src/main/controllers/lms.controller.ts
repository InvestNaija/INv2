import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator } from "@inv2/common";
import { LmsValidation  } from '../validations/lms.schema';

import { LmsService} from '../services';


export class LmsController {

   public static async healthz(req: Request, res: Response): Promise<void> {
      res.status(200).json({status:200, message: "Auth server is Healthy"});
   }

   @JoiMWDecorator(LmsValidation.createLms)
   public static async createLms(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {         
         const body = req.body;
         const lmsService = new LmsService;
         const lms = await lmsService.createLms(req.currentUser!, body);
         res.status(lms.code).json(lms);
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   @JoiMWDecorator(LmsValidation.updateLms)
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