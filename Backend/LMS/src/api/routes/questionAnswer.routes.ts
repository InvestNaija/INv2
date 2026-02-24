import express, { Router } from 'express';
import { QuestionAnswersController } from '../controllers';
import { Authentication } from '@inv2/common';

class QuestionAnswerRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/', Authentication.requireAuth, QuestionAnswersController.getQuestionAnswer);
      this.router.put('/:id', Authentication.requireAuth, QuestionAnswersController.updateQuestionAnswer);
      this.router.post('/', Authentication.requireAuth, QuestionAnswersController.createQuestionAnswer);
      this.router.delete('/:id', Authentication.requireAuth, QuestionAnswersController.deleteQuestionAnswer);

      return this.router;
   }
}

export const questionAnswerRoutes: QuestionAnswerRoutes = new QuestionAnswerRoutes();