import { Application } from 'express';
import { lmsRoutes } from './lms.routes';
import { quizAttempsRoutes } from './quizattempts.routes';

const route = '/api/v2/lms'
const BaseRoutes = (app: Application) => {
   const routes = () => {
      app.use(`${route}`, lmsRoutes.routes());
      app.use(`${route}/quiz/attempt`, quizAttempsRoutes.routes());
   };
   routes();
};
export default BaseRoutes;