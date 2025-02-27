import dotenv from 'dotenv';
dotenv.config();
import express, { Express, json, Request, Response, urlencoded } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import Routes from './main/routes/index.routes';
import { errorHandler, Authentication } from '@inv2/common';

const app: Express = express();
/*===============================
 * Initiate Security middlewares *
=================================*/
app.set('trust proxy', true);
//   app.use(hpp());
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
/*====================================
* Initiate standard middlewares *
====================================*/
app.use(Authentication.currentUser);
//   app.use(compression());
app.use(json({ limit: '50mb' }));
app.use(urlencoded({ extended: true, limit: '50mb' }));
   
/*===================================
*           Load the routes         =
====================================*/
//logging for routes
// if (config.NODE_ENV !== 'test') {
//    app.use(morgan.successHandler);
//    app.use(morgan.errorHandler);
// }
Routes(app);

// eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-explicit-any
app._router.stack.forEach(function(r: any){
   if (r.route && r.route.path){
      console.log("app.routes ======>>>>>>>", r.route.path);
   }
});
/*=============================================
=         Global Error middleware            =
=============================================*/
app.use((req: Request, res: Response) => {
   res.status(404).json({message: `${req.ip} tried to ${req.method} to a resource at ${req.originalUrl} that is not on this server.`});
});
app.use(errorHandler);

export { app };
