import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator } from "@inv2/common";
import { QuestionAnswersValidation } from '../validations/questionAnswer.schema';
import { QuestionAnswersService } from '../services';

export class QuestionAnswersController {
   @JoiMWDecorator(QuestionAnswersValidation.createQuestionAnswer)
   public static async createQuestionAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {         
         const body = req.body;
         const questionAnswersService = new QuestionAnswersService;
         const questionAnswer = await questionAnswersService.createQuestionAnswer(req.currentUser!, body);
         res.status(questionAnswer.code).json(questionAnswer);
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   @JoiMWDecorator(QuestionAnswersValidation.updateQuestionAnswer)
   public static async updateQuestionAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const body = req.body;
         const id = req.params.id;
         const questionAnswersService = new QuestionAnswersService;
         const questionAnswer = await questionAnswersService.updateQuestionAnswer(id, body);
         res.status(questionAnswer.code).json(questionAnswer);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   public static async getQuestionAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const query = req.query;
         const questionAnswersService = new QuestionAnswersService;
         const questionAnswer = await questionAnswersService.getQuestionAnswer(query);
         res.status(questionAnswer.code).json(questionAnswer);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }

   public static async deleteQuestionAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const id = req.params.id;
         const questionAnswersService = new QuestionAnswersService;
         const questionAnswer = await questionAnswersService.deleteQuestionAnswer(id);
         res.status(questionAnswer.code).json(questionAnswer);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
}