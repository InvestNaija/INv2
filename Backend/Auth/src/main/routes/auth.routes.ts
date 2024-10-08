import express, { Router } from 'express';
import { AuthController } from '../controllers';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { requireAuth } from '@inv2/common';

class AuthRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/healthz', AuthController.healthz);
      this.router.post('/user/signup', AuthController.signup);
      this.router.post('/user/signin', AuthMiddleware.checkLoginDetails, AuthMiddleware.check2FA, AuthController.signin);
      this.router.post('/user/signin-choose-tenant', AuthMiddleware.checkLoginDetails, AuthController.signin);
      this.router.post('/user/set-2FA', requireAuth, AuthController.set2FA);
      this.router.post('/user/signout', requireAuth, AuthController.set2FA);
      // this.router.get('/get-apps/:device_id', authMiddleware.checkAuthentication, Get.prototype.read);
      // this.router.post('/update-app-status', authMiddleware.checkAuthentication, Update.prototype.updateStatus);

      return this.router;
   }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
