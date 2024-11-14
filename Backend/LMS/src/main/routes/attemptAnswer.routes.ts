import express, { Router } from 'express';
import { AttemptAnswerController } from '../controllers';
import { requireAuth } from '@inv2/common';

class AttemptAnswerRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/healthz', AttemptAnswerController.healthz);
      this.router.get('/', requireAuth, AttemptAnswerController.getAttemptAnswer);
      this.router.patch('/:id', requireAuth, AttemptAnswerController.updateAttemptAnswer);
      this.router.post('/', requireAuth, AttemptAnswerController.attemptAnswer);
      this.router.delete('/:id', requireAuth, AttemptAnswerController.deleteAttemptAnswer);

      return this.router;
   }
}

export const attemptAnswerRoutes: AttemptAnswerRoutes = new AttemptAnswerRoutes();
