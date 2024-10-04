import { Application } from 'express';
import { logsRouter } from './log.routes';


const BaseRoutes = (app: Application) => {
   const routes = () => {
      app.use(`/api/v2/logs`, logsRouter.routes());
   };
   routes();
};
export default BaseRoutes;