import { Application } from 'express';
import { lmsRoutes } from './lms.routes';


const BaseRoutes = (app: Application) => {
   const routes = () => {
      app.use(`/api/v2/lms`, lmsRoutes.routes());
   };
   routes();
};
export default BaseRoutes;