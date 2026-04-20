import dotenv from 'dotenv';
dotenv.config();
import { json, Request, Response, urlencoded } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler, Authentication } from '@inv2/common';
import swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';

import { InversifyExpressServer } from 'inversify-express-utils';
import "./api/controllers";
import { container } from './inversify.config';

const server = new InversifyExpressServer(container, null, { rootPath: "/api/v2/auth" });

server.setConfig(app=>{
   /*===============================
    * Initiate all middlewares except error
   =================================*/
   app.set('trust proxy', true);
   // //   app.use(hpp());
   app.use(helmet());
   app.use(
      cors(
         {
            origin: '*',
            credentials: true,
            optionsSuccessStatus: 200,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
         }
      )
   );
   // Authentication
   app.use(Authentication.currentUser);
   //   app.use(compression());
   app.use(json({ limit: '50mb' }));
   app.use(urlencoded({ extended: true, limit: '50mb' }));

   // Swagger Documentation
   const swaggerFile = path.join(__dirname, './swagger-output.json');
   if (fs.existsSync(swaggerFile)) {
      const swaggerConfig = JSON.parse(fs.readFileSync(swaggerFile, 'utf8'));
      
      // Serve the swagger JSON file for this service
      app.get('/api/v2/auth/swagger.json', (req, res) => res.json(swaggerConfig));

      // Centralized Swagger UI Hub
      app.use('/api/v2/docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig, {
         explorer: true,
         swaggerOptions: {
            urls: [
               { url: '/api/v2/auth/swagger.json', name: 'Auth Service' },
               { url: '/api/v2/finance/swagger.json', name: 'Finance Service' },
               { url: '/api/v2/lms/swagger.json', name: 'LMS Service' },
               { url: '/api/v2/tradein/swagger.json', name: 'TradeIN Service' },
               { url: '/api/v2/investin/swagger.json', name: 'InvestIN Service' },
               { url: '/api/v2/saveplan/swagger.json', name: 'SavePlan Service' },
            ],
            persistAuthorization: true
         }
      }));
   }
      
});
server.setErrorConfig((app) => {
   app.use((req: Request, res: Response) => {
      res.status(404).json({message: `${req.ip} tried to ${req.method} to a resource at ${req.originalUrl} that is not on this server.`});
   });
   // Global Error middleware 
   app.use(errorHandler);
});
const app = server.build();

// Route Debugging
if (process.env.NODE_ENV !== 'production') {
   console.log('--- Registered Routes ---');
   app._router.stack.forEach((middleware: any) => {
      if (middleware.route) { // routes registered directly on the app
         console.log(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
      } else if (middleware.name === 'router') { // router middleware 
         middleware.handle.stack.forEach((handler: any) => {
            if (handler.route) {
               console.log(`${Object.keys(handler.route.methods).join(',').toUpperCase()} ${handler.route.path}`);
            }
         });
      }
   });
   console.log('-------------------------');
}

export { app };
