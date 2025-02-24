import express, { Router } from 'express';
import { TestController } from '../controllers/test.controller';

class TestRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.post('/create-zanibal-customer', TestController.createZanibalCustomer);
      // this.router.get('/get-apps/:device_id', authMiddleware.checkAuthentication, Get.prototype.read);
      // this.router.post('/update-app-status', authMiddleware.checkAuthentication, Update.prototype.updateStatus);

      return this.router;
   }
}

export const testRoutes: TestRoutes = new TestRoutes();
