import express, { Router } from 'express';
import { LmsController } from '../controllers';
import { requireAuth } from '@inv2/common';

class LmsRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/healthz', LmsController.healthz);
      this.router.get('/', requireAuth, LmsController.getLms);
      this.router.patch('/:id', requireAuth, LmsController.updateLms);
      this.router.post('/', requireAuth, LmsController.createLms);
      this.router.delete('/:id', requireAuth, LmsController.deleteLms);

      return this.router;
   }
}

export const lmsRoutes: LmsRoutes = new LmsRoutes();
