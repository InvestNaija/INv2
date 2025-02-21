// import 'reflect-metadata';
import express, { Router } from 'express';
// import { container, } from 'tsyringe';
import { AdminController } from '../controllers/admin.controller';
// import { requireAuth } from '@inv2/common';

class SaveplanRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.get('/:type?', AdminController.list); //List all types of saveplan, e.g Save a Million, 100M65
      this.router.post('/', AdminController.create); //Create a new saveplan, e.g Save a Million, 100M65
      this.router.patch('/:id', AdminController.update); //List all types of saveplan, e.g Save a Million, 100M65

      return this.router;
   }
}

export const adminRoutes: SaveplanRoutes = new SaveplanRoutes();
