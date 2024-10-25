import express, { Router } from 'express';
// import { UserController } from '../controllers/user.controller';

class UserRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      // this.router.post('/', Create.prototype.create);
      // this.router.get('/', UserController.login);
      // this.router.get('/get-apps/:device_id', authMiddleware.checkAuthentication, Get.prototype.read);
      // this.router.post('/update-app-status', authMiddleware.checkAuthentication, Update.prototype.updateStatus);

      return this.router;
   }
}

export const userRoutes: UserRoutes = new UserRoutes();
