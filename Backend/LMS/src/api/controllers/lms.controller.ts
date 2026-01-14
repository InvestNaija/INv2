import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator } from "@inv2/common";
import { LmsValidation  } from '../validations/lms.schema';

import { LmsService} from '../../business/services';
import { controller } from 'inversify-express-utils';

@controller('lms')
export class LmsController {

   constructor(private readonly lmsService: LmsService) {}
   public async healthz(req: Request, res: Response): Promise<void> {
      res.status(200).json({status:200, message: "Auth server is Healthy"});
   }

   @JoiMWDecorator(LmsValidation.createLms)
   public async createLms(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {         
         const body = req.body;
         const lms = await this.lmsService.createLms(req.currentUser!, body);
         res.status(lms.code).json(lms);
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   @JoiMWDecorator(LmsValidation.updateLms)
   public async updateLms(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const body = req.body;
         const id = req.params.id;
         const lms = await this.lmsService.updateLms(id, body);
         res.status(lms.code).json(lms);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   public async getLms(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const query = req.query;
         const lms = await this.lmsService.getLms(query);
         res.status(lms.code).json(lms);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }

   public async deleteLms(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const id = req.params.id;
         const lms = await this.lmsService.deleteLms(id);
         res.status(lms.code).json(lms);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
}