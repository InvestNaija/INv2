import express, { Router } from 'express';
import { SaveplanController } from '../controllers/saveplan.controller';

class SaveplanRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/healthz', SaveplanController.healthz);
      this.router.post('/list', SaveplanController.list);
      // this.router.get('/', UserController.login);
      // this.router.get('/get-apps/:device_id', authMiddleware.checkAuthentication, Get.prototype.read);
      // this.router.post('/update-app-status', authMiddleware.checkAuthentication, Update.prototype.updateStatus);

      return this.router;
   }
}

export const saveplanRoutes: SaveplanRoutes = new SaveplanRoutes();
