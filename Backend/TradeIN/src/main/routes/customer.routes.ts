// import 'reflect-metadata';
import express, { Router } from 'express';
// import { container, } from 'tsyringe';
import { CustomerController } from '../controllers/customer.controller';
// import { requireAuth } from '@inv2/common';

class SaveplanRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/healthz', CustomerController.healthz);
      this.router.get('/:type?', CustomerController.list); //List all types of saveplan, e.g Save a Million, 100M65
      this.router.post('/', CustomerController.create); //Customer wants to create a new saveplan
      // this.router.get('/', UserController.login);
      // this.router.get('/get-apps/:device_id', authMiddleware.checkAuthentication, Get.prototype.read);
      // this.router.post('/update-app-status', authMiddleware.checkAuthentication, Update.prototype.updateStatus);

      return this.router;
   }
}

export const customerRoutes: SaveplanRoutes = new SaveplanRoutes();
