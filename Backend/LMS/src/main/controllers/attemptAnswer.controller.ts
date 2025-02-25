import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator } from "@inv2/common";
import { AttemptAnswerValidation } from '../validations/attemptAnswer.schema';
import { AttemptAnswerService } from '../services';
import { AttemptAnswerDto, GetAttemptAnswerDto } from '../dtos';

export class AttemptAnswerController {
   private static attemptAnswerService = new AttemptAnswerService();

   public static async healthz(req: Request, res: Response): Promise<void> {
      res.status(200).json({ status: 200, message: "Auth server is Healthy" });
   }

   @JoiMWDecorator(AttemptAnswerValidation.attemptAnswer)
   public static async attemptAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const body: AttemptAnswerDto = req.body;
         const response = await AttemptAnswerController.attemptAnswerService.attemptAnswer(req.currentUser!, body);
         res.status(response.code).json(response);
      } catch (error: unknown) {
         if (error instanceof CustomError) {
            return next(new Exception(error));
         }
         return next(error);
      }
   }

   @JoiMWDecorator(AttemptAnswerValidation.getAttemptAnswer)
   public static async getAttemptAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const query: Partial<GetAttemptAnswerDto> = req.query;
         const response = await AttemptAnswerController.attemptAnswerService.getAttemptAnswer(query);
         res.status(response.code).json(response);
      } catch (error: unknown) {
         if (error instanceof CustomError) {
            return next(new Exception(error));
         }
         return next(error);
      }
   }

   @JoiMWDecorator(AttemptAnswerValidation.updateAttemptAnswer)
   public static async updateAttemptAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { id } = req.params;
         const data = req.body;
         const response = await AttemptAnswerController.attemptAnswerService.updateAttemptAnswer(id, data);
         res.status(response.code).json(response);
      } catch (error: unknown) {
         if (error instanceof CustomError) {
            return next(new Exception(error));
         }
         return next(error);
      }
   }

   @JoiMWDecorator(AttemptAnswerValidation.deleteAttemptAnswer)
   public static async deleteAttemptAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { id } = req.params;
         const response = await AttemptAnswerController.attemptAnswerService.deleteAttemptAnswer(id);
         res.status(response.code).json(response);
      } catch (error: unknown) {
         if (error instanceof CustomError) {
            return next(new Exception(error));
         }
         return next(error);
      }
   }
}
