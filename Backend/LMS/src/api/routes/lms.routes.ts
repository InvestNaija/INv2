import express, { Router } from 'express';
import { LmsController } from '../controllers';
import { Authentication } from '@inv2/common';

class LmsRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/healthz', LmsController.healthz);
      this.router.get('/', Authentication.requireAuth, LmsController.getLms);
      this.router.patch('/:id', Authentication.requireAuth, LmsController.updateLms);
      this.router.post('/', Authentication.requireAuth, LmsController.createLms);
      this.router.delete('/:id', Authentication.requireAuth, LmsController.deleteLms);

      return this.router;
   }
}

export const lmsRoutes: LmsRoutes = new LmsRoutes();
