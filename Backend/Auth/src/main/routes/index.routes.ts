import { Application } from 'express';
import { authRoutes } from './auth.routes';
import { testRoutes } from './test.routes';


const BaseRoutes = (app: Application) => {
   const routes = () => {
      app.use(`/api/v2/auth`, authRoutes.routes());

      app.use(`/api/v2/tests`, testRoutes.routes());
   };
   routes();
   
};
export default BaseRoutes;