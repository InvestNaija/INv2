import express, { Router } from 'express';
import { AttemptAnswerController } from '../controllers';
import { Authentication } from '@inv2/common';

class AttemptAnswerRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/healthz', AttemptAnswerController.healthz);
      this.router.get('/', Authentication.requireAuth, AttemptAnswerController.getAttemptAnswer);
      this.router.patch('/:id', Authentication.requireAuth, AttemptAnswerController.updateAttemptAnswer);
      this.router.post('/', Authentication.requireAuth, AttemptAnswerController.attemptAnswer);
      this.router.delete('/:id', Authentication.requireAuth, AttemptAnswerController.deleteAttemptAnswer);

      return this.router;
   }
}

export const attemptAnswerRoutes: AttemptAnswerRoutes = new AttemptAnswerRoutes();
