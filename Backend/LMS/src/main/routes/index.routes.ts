import { Application } from 'express';
import { lmsRoutes } from './lms.routes';
import { attemptAnswerRoutes } from './attemptAnswer.routes';


const BaseRoutes = (app: Application) => {
   const routes = () => {
      app.use(`/api/v2/lms`, lmsRoutes.routes());
      app.use(`/api/v2/attempt/answer`, attemptAnswerRoutes.routes())
   };
   routes();
};
export default BaseRoutes;