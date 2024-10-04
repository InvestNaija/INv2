import { Application } from 'express';
import { authRoutes } from './auth.routes';


const BaseRoutes = (app: Application) => {
   const routes = () => {
      app.use(`/api/v2/auth`, authRoutes.routes());
   };
   routes();
};
export default BaseRoutes;