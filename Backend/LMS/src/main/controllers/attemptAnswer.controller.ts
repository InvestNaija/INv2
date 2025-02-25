import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator } from "@inv2/common";
import { AttemptAnswerValidation  } from '../validations/attemptAnswer.schema';

import { AttemptAnswerService} from '../services';
import { AttemptAnswerDto, GetAttemptAnswerDto } from '../dtos';


export class AttemptAnswerController {

   // private static attemptAnswerService = new AttemptAnswerService()

   public static async healthz(req: Request, res: Response): Promise<void> {
      res.status(200).json({status:200, message: "Auth server is Healthy"});
   }

   @JoiMWDecorator(AttemptAnswerValidation.attemptAnswer)
   public static async attemptAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const attemptAnswer =  new  AttemptAnswerService      
         const body: AttemptAnswerDto = req.body;
         const attemptAnswerService = await attemptAnswer.attemptAnswer( req.currentUser!, body );
         res.status(attemptAnswerService.code).json(attemptAnswerService);
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   @JoiMWDecorator(AttemptAnswerValidation.getAttemptAnswer)
   public static async getAttemptAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const attemptAnswer =  new  AttemptAnswerService
         const query: Partial<GetAttemptAnswerDto> = req.query;
         const attemptAnswerService = await attemptAnswer.getAttemptAnswer(query)
         res.status(attemptAnswerService.code).json(attemptAnswerService);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   @JoiMWDecorator(AttemptAnswerValidation.updateAttemptAnswer)
   public static async updateAttemptAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const attemptAnswer =  new  AttemptAnswerService
         const { id } = req.params;
         const data = req.body;
         const attemptAnswerService = await attemptAnswer.updateAttemptAnswer(id, data)
         res.status(attemptAnswerService.code).json(attemptAnswerService);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   @JoiMWDecorator(AttemptAnswerValidation.deleteAttemptAnswer)
   public static async deleteAttemptAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const attemptAnswer =  new  AttemptAnswerService
         const id = req.params.id;
         const attemptAnswerService = await attemptAnswer.deleteAttemptAnswer(id)
         res.status(attemptAnswerService.code).json(attemptAnswerService);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
}