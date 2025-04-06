import express, { Router } from 'express';
import { QuizController } from '../controllers';
import { Authentication } from '@inv2/common';

class QuizRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/', Authentication.requireAuth, QuizController.getQuiz);
      this.router.patch('/:id', Authentication.requireAuth, QuizController.updateQuiz);
      this.router.post('/', Authentication.requireAuth, QuizController.createQuiz);
      this.router.delete('/:id', Authentication.requireAuth, QuizController.deleteQuiz);

      return this.router;
   }
}

export const quizRoutes: QuizRoutes = new QuizRoutes();