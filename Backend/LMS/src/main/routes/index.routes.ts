import { Application } from 'express';
import { lmsRoutes } from './lms.routes';
import { quizRoutes } from './quiz.routes';

const BaseRoutes = (app: Application) => {
   const routes = () => {
      app.use(`/api/v2/lms`, lmsRoutes.routes());
      app.use(`/api/v2/quiz`, quizRoutes.routes());
   };
   routes();
};
export default BaseRoutes;