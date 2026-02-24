import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator } from "@inv2/common";
import { QuestionValidation } from '../validations/question.schema';
import { QuestionService } from '../services';

export class QuestionController {
   @JoiMWDecorator(QuestionValidation.createQuestion)
   public static async createQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {         
         const body = req.body;
         const questionService = new QuestionService;
         const question = await questionService.createQuestion(req.currentUser!, body);
         res.status(question.code).json(question);
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   @JoiMWDecorator(QuestionValidation.updateQuestion)
   public static async updateQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const body = req.body;
         const id = req.params.id;
         const questionService = new QuestionService;
         const question = await questionService.updateQuestion(id, body);
         res.status(question.code).json(question);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   public static async getQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const query = req.query;
         const questionService = new QuestionService;
         const question = await questionService.getQuestion(query);
         res.status(question.code).json(question);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }

   public static async deleteQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const id = req.params.id;
         const questionService = new QuestionService;
         const question = await questionService.deleteQuestion(id);
         res.status(question.code).json(question);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
}