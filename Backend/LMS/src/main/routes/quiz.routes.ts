import express, { Router } from 'express';
import { QuizController } from '../controllers';
import { requireAuth } from '@inv2/common';

class QuizRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/', requireAuth, QuizController.getQuiz);
      this.router.patch('/:id', requireAuth, QuizController.updateQuiz);
      this.router.post('/', requireAuth, QuizController.createQuiz);
      this.router.delete('/:id', requireAuth, QuizController.deleteQuiz);

      return this.router;
   }
}

export const quizRoutes: QuizRoutes = new QuizRoutes();