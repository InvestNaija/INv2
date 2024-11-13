import express, { Router } from 'express';
import { QuestionAnswersController } from '../controllers';
import { requireAuth } from '@inv2/common';

class QuestionAnswerRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/', requireAuth, QuestionAnswersController.getQuestionAnswer);
      this.router.put('/:id', requireAuth, QuestionAnswersController.updateQuestionAnswer);
      this.router.post('/', requireAuth, QuestionAnswersController.createQuestionAnswer);
      this.router.delete('/:id', requireAuth, QuestionAnswersController.deleteQuestionAnswer);

      return this.router;
   }
}

export const questionAnswerRoutes: QuestionAnswerRoutes = new QuestionAnswerRoutes();