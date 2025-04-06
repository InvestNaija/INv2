import express, { Router } from 'express';
import { QuizQuestionController } from '../controllers';
import { Authentication } from '@inv2/common';

class QuizQuestionRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/', Authentication.requireAuth, QuizQuestionController.getQuizQuestion);
      this.router.put('/:id', Authentication.requireAuth, QuizQuestionController.updateQuizQuestion);
      this.router.post('/', Authentication.requireAuth, QuizQuestionController.createQuizQuestion);
      this.router.delete('/:id', Authentication.requireAuth, QuizQuestionController.deleteQuizQuestion);

      return this.router;
   }
}

export const quizQuestionRoutes: QuizQuestionRoutes = new QuizQuestionRoutes();