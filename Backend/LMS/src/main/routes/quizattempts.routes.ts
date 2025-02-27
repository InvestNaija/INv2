import express, { Router } from 'express';
import { QuizAttemptController } from '../controllers';
import { Authentication } from '@inv2/common';

class QuizAttempsRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/', Authentication.requireAuth, QuizAttemptController.getAttempts);
      this.router.post('/start/:quiz', Authentication.requireAuth, QuizAttemptController.startAttempt);
      this.router.post('/end/:quiz', Authentication.requireAuth, QuizAttemptController.endAttempt);
      this.router.delete('/:id', Authentication.requireAuth, QuizAttemptController.deleteAttempt);

      return this.router;
   }
}

export const quizAttempsRoutes: QuizAttempsRoutes = new QuizAttempsRoutes();
