import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator } from "@inv2/common";
import { QuizValidation } from '../validations/quiz.schema';
import { QuizService } from '../services';

export class QuizController {

   public static async healthz(req: Request, res: Response): Promise<void> {
      res.status(200).json({status:200, message: "Auth server is Healthy"});
   }

   @JoiMWDecorator(QuizValidation.createQuiz)
   public static async createQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {         
         const body = req.body;
         const quizService = new QuizService;
         const quiz = await quizService.createQuiz(req.currentUser!, body);
         res.status(quiz.code).json(quiz);
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   @JoiMWDecorator(QuizValidation.updateQuiz)
   public static async updateQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const body = req.body;
         const id = req.params.id;
         const quizService = new QuizService;
         const quiz = await quizService.updateQuiz(id, body);
         res.status(quiz.code).json(quiz);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   public static async getQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const query = req.query;
         const quizService = new QuizService;
         const quiz = await quizService.getQuiz(query);
         res.status(quiz.code).json(quiz);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }

   public static async deleteQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const id = req.params.id;
         const quizService = new QuizService;
         const quiz = await quizService.deleteQuiz(id);
         res.status(quiz.code).json(quiz);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
}