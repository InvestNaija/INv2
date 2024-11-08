import { Application } from 'express';
import { saveplanRoutes } from './saveplan.routes';


const BaseRoutes = (app: Application) => {
   const routes = () => {
      app.use(`/api/v2/saveplan`, saveplanRoutes.routes());
   };
   routes();
};
export default BaseRoutes;