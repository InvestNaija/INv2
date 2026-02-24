import express, { Router } from 'express';
import { QuestionController } from '../controllers';
import { Authentication } from '@inv2/common';

class QuestionRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/', Authentication.requireAuth, QuestionController.getQuestion);
      this.router.put('/:id', Authentication.requireAuth, QuestionController.updateQuestion);
      this.router.post('/', Authentication.requireAuth, QuestionController.createQuestion);
      this.router.delete('/:id', Authentication.requireAuth, QuestionController.deleteQuestion);

      return this.router;
   }
}

export const questionRoutes: QuestionRoutes = new QuestionRoutes();