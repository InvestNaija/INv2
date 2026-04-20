import 'reflect-metadata';
import express, { Request, Response } from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
import { container } from './inversify.config';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler, Authentication } from '@inv2/common';

// Import controllers to register them
import './api/controllers';

/**
 * Express Server Configuration
 * Uses inversify-express-utils to bootstrap the application with dependency injection.
 * Aligned with the SavePlan microservice template.
 */
const server = new InversifyExpressServer(container, null, { rootPath: '/api/v2/investin' });

server.setConfig((app) => {
   /*===============================
    * Initiate all middlewares except error
    =================================*/
   app.set('trust proxy', true);

   app.use(helmet());
   app.use(
      cors({
         origin: '*',
         credentials: true,
         optionsSuccessStatus: 200,
         methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      }),
   );

   // Authentication Middleware
   app.use(Authentication.currentUser);

   // Body parsers with limits
   app.use(express.json({ limit: '50mb' }));
   app.use(express.urlencoded({ extended: true, limit: '50mb' }));
});

server.setErrorConfig((app) => {
   // 404 Handler
   app.use((req: Request, res: Response) => {
      res.status(404).json({
         message: `${req.ip} tried to ${req.method} to a resource at ${req.originalUrl} that is not on this server.`,
      });
   });

   // Global Error middleware
   app.use(errorHandler);
});

const app = server.build();

export { app };
