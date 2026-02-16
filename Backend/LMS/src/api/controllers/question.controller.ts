import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator } from "@inv2/common";
import { QuestionValidation } from '../validations/question.schema';
import { QuestionService } from '../../business/services';
import { controller, httpDelete, httpGet, httpPost, httpPut } from 'inversify-express-utils';
import { Authentication } from '@inv2/common';

@controller('/questions')
export class QuestionController {

   constructor(private readonly questionService: QuestionService) {}

   @httpPost('/', Authentication.requireAuth)
   @JoiMWDecorator(QuestionValidation.createQuestion)
   public async createQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {         
         const body = req.body;
         const result = await this.questionService.createQuestion(req.currentUser!, body);
         res.status(result.code).json(result);
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }

   @httpPut('/:id', Authentication.requireAuth)
   @JoiMWDecorator(QuestionValidation.updateQuestion)
   public async updateQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const body = req.body;
         const id = req.params.id;
         const result = await this.questionService.updateQuestion(id, req.currentUser!, body);
         res.status(result.code).json(result);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }

   @httpGet('/', Authentication.requireAuth)
   public async getQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const query = req.query;
         const result = await this.questionService.getQuestion(query);
         res.status(result.code).json(result);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }

   @httpDelete('/:id', Authentication.requireAuth)
   public async deleteQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const id = req.params.id;
         const result = await this.questionService.deleteQuestion(id, req.currentUser!);
         // For 204 No Content, send status without body
         if (result.code === 204) {
            res.status(204).send();
         } else {
            res.status(result.code).json(result);
         }
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
}
