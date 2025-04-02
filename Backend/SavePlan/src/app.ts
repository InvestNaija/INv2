import dotenv from 'dotenv';
dotenv.config();
import { json, Request, Response, urlencoded } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler, Authentication } from '@inv2/common';

import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import "./api/controllers";

const container = new Container({ defaultScope: 'Singleton'});

/** Define all containers and inject every service */
// container.bind(AuthService).toSelf();
// container.bind<UserService>(TYPES.UserService).to(UserService);
// container.bind<RoleService>(TYPES.RoleService).to(RoleService);
// container.bind<TenantService>(TYPES.TenantService).to(TenantService);
// container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);
const server = new InversifyExpressServer(container, null, { rootPath: "/api/v2" });

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
      
});
server.setErrorConfig((app) => {
   app.use((req: Request, res: Response) => {
      res.status(404).json({message: `${req.ip} tried to ${req.method} to a resource at ${req.originalUrl} that is not on this server.`});
   });
   // Global Error middleware 
   app.use(errorHandler);
});
const app = server.build();

export { app };
