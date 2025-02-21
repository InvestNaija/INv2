import { Application } from 'express';
import { customerRoutes } from './customer.routes';
import { adminRoutes } from './admin.routes';


const BaseRoutes = (app: Application) => {
   const routes = () => {
      app.use(`/api/v2/customer/saveplan`, customerRoutes.routes());
      app.use(`/api/v2/admin/saveplan`, adminRoutes.routes());
   };
   routes();
};
export default BaseRoutes;