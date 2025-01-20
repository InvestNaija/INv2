import { Application } from 'express';
import { customerRoutes } from './customer.routes';
import { adminRoutes } from './admin.routes';


const BaseRoutes = (app: Application) => {
   const routes = () => {
      app.use(`/api/v2/saveplan/customer`, customerRoutes.routes());
      app.use(`/api/v2/saveplan/admin`, adminRoutes.routes());
   };
   routes();
};
export default BaseRoutes;