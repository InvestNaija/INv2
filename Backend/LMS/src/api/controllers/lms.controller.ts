import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator, Authentication } from "@inv2/common";
import { LmsValidation  } from '../validations/lms.schema';

import { LmsService} from '../../business/services';

@controller('/lms')
export class LmsController {

   constructor(private readonly lmsService: LmsService) {}

   @httpGet('/healthz')
   public async healthz(req: Request, res: Response): Promise<void> {
      res.status(200).json({status:200, message: "Auth server is Healthy"});
   }

   @httpPost('/', Authentication.requireAuth)
   @JoiMWDecorator(LmsValidation.createLms)
   public async createLms(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {         
         const body = req.body;
         const lms = await this.lmsService.createLms(req.currentUser!, body);
         res.status(lms.code).json(lms);
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) {
            next(error);
         } else {
            next(new Exception({ code: 500, message: "An unexpected error occurred" }));
         }
      }
   }
   
   @httpPut('/:id', Authentication.requireAuth)
   @JoiMWDecorator(LmsValidation.updateLms)
   public async updateLms(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const body = req.body;
         const id = req.params.id;
         const lms = await this.lmsService.updateLms(id, body);
         res.status(lms.code).json(lms);
      } catch (error) {
         if(error instanceof CustomError) {
            next(error);
         } else {
            next(new Exception({ code: 500, message: "An unexpected error occurred" }));
         }
      }
   }

   @httpGet('/', Authentication.requireAuth)
   public async getLms(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const query = req.query;
         const lms = await this.lmsService.getLms(query);
         res.status(lms.code).json(lms);
      } catch (error) {
         if(error instanceof CustomError) {
            next(error);
         } else {
            next(new Exception({ code: 500, message: "An unexpected error occurred" }));
         }
      }
   }

   @httpDelete('/:id', Authentication.requireAuth)
   public async deleteLms(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const id = req.params.id;
         const lms = await this.lmsService.deleteLms(id);
         res.status(lms.code).json(lms);
      } catch (error) {
         if(error instanceof CustomError) {
            next(error);
         } else {
            next(new Exception({ code: 500, message: "An unexpected error occurred" }));
         }
      }
   }
}