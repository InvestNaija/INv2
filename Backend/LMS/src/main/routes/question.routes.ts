import express, { Router } from 'express';
import { QuestionController } from '../controllers';
import { requireAuth } from '@inv2/common';

class QuestionRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/', requireAuth, QuestionController.getQuestion);
      this.router.put('/:id', requireAuth, QuestionController.updateQuestion);
      this.router.post('/', requireAuth, QuestionController.createQuestion);
      this.router.delete('/:id', requireAuth, QuestionController.deleteQuestion);

      return this.router;
   }
}

export const questionRoutes: QuestionRoutes = new QuestionRoutes();