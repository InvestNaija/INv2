import express, { Router } from 'express';
import { QuizQuestionController } from '../controllers';
import { requireAuth } from '@inv2/common';

class QuizQuestionRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/', requireAuth, QuizQuestionController.getQuizQuestion);
      this.router.put('/:id', requireAuth, QuizQuestionController.updateQuizQuestion);
      this.router.post('/', requireAuth, QuizQuestionController.createQuizQuestion);
      this.router.delete('/:id', requireAuth, QuizQuestionController.deleteQuizQuestion);

      return this.router;
   }
}

export const quizQuestionRoutes: QuizQuestionRoutes = new QuizQuestionRoutes();