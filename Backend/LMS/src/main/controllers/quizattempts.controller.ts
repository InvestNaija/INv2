import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator } from "@inv2/common";
import { StartAttemptValidation  } from '../validations/quizAttempt.schema';

import { QuizAttemptService } from '../services';
import { QuizAttemptDto } from '../dtos';


export class QuizAttemptController {

   static quizAttemptService = new QuizAttemptService;

   public static async healthz(req: Request, res: Response): Promise<void> {
      res.status(200).json({status:200, message: "Auth server is Healthy"});
   }

   @JoiMWDecorator(StartAttemptValidation.startAttempt)
   public static async startAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {      
         const ip: string = req.ip || req.socket!.remoteAddress!   
         let body: Partial<QuizAttemptDto> = { ...req.params, ip };
         const quizAttempt = await this.quizAttemptService.startAttempt(req.currentUser!, body)
         res.status(quizAttempt.code).json(quizAttempt);
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }

   @JoiMWDecorator(StartAttemptValidation.endAttempt)
   public static async endAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         let data: Partial<QuizAttemptDto> = { id: req.params.quiz };
         const endAttempt = await this.quizAttemptService.endAttempt(req.currentUser!, data)
         res.status(endAttempt.code).json(endAttempt);
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }

   @JoiMWDecorator(StartAttemptValidation.getAttempt)
   public static async getAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         let data: Partial<QuizAttemptDto> = req.query;
         const getAttempts = await this.quizAttemptService.getAttempts(req.currentUser!, data)
         res.status(getAttempts.code).json(getAttempts);
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }

   @JoiMWDecorator(StartAttemptValidation.deleteAttempt)
   public static async deleteAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         let data: Partial<QuizAttemptDto> = req.params;
         const deleteAttempt = await this.quizAttemptService.deleteAttempt(req.currentUser!, data)
         res.status(deleteAttempt.code).json(deleteAttempt);
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
}