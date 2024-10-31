import { Application } from 'express';
// import { authRoutes } from './lms.routes';


const BaseRoutes = (app: Application) => {
   const routes = () => {
      // app.use(`/api/v2/saveplan`, authRoutes.routes());
   };
   routes();
};
export default BaseRoutes;