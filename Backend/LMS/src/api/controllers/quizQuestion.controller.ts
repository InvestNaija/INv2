import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator } from "@inv2/common";
import { QuizQuestionValidation } from '../validations/quizQuestion.schema';
import { QuizQuestionService } from '../services';

export class QuizQuestionController {
   @JoiMWDecorator(QuizQuestionValidation.createQuizQuestion)
   public static async createQuizQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {         
         const body = req.body;
         const quizQuestionService = new QuizQuestionService;
         const quizQuestion = await quizQuestionService.createQuizQuestion(req.currentUser!, body);
         res.status(quizQuestion.code).json(quizQuestion);
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   @JoiMWDecorator(QuizQuestionValidation.updateQuizQuestion)
   public static async updateQuizQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const body = req.body;
         const id = req.params.id;
         const quizQuestionService = new QuizQuestionService;
         const quizQuestion = await quizQuestionService.updateQuizQuestion(id, body);
         res.status(quizQuestion.code).json(quizQuestion);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   public static async getQuizQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const query = req.query;
         const quizQuestionService = new QuizQuestionService;
         const quizQuestion = await quizQuestionService.getQuizQuestion(query);
         res.status(quizQuestion.code).json(quizQuestion);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }

   public static async deleteQuizQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const id = req.params.id;
         const quizQuestionService = new QuizQuestionService;
         const quizQuestion = await quizQuestionService.deleteQuizQuestion(id);
         res.status(quizQuestion.code).json(quizQuestion);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
}