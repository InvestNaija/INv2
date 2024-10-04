import express, { Router } from 'express';
import { LogController } from '../controllers/log.controller';

class LogsRoutes {
   private router: Router;

   constructor() {
      this.router = express.Router();
   }

   public routes(): Router {
      this.router.post('/logs/create', LogController.create);
      return this.router;
   }
}

export const logsRouter: LogsRoutes = new LogsRoutes();
