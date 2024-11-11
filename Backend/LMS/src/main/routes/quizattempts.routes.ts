import express, { Router } from 'express';
import { QuizAttemptController } from '../controllers';
import { requireAuth } from '@inv2/common';

class QuizAttempsRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/', requireAuth, QuizAttemptController.getAttempts);
      this.router.post('/start/:quiz', requireAuth, QuizAttemptController.startAttempt);
      this.router.post('/end/:quiz', requireAuth, QuizAttemptController.endAttempt);
      this.router.delete('/:id', requireAuth, QuizAttemptController.deleteAttempt);

      return this.router;
   }
}

export const quizAttempsRoutes: QuizAttempsRoutes = new QuizAttempsRoutes();
