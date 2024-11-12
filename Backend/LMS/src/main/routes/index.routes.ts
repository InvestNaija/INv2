import { Application } from 'express';
import { lmsRoutes } from './lms.routes';
import { quizRoutes } from './quiz.routes';
import { quizQuestionRoutes } from './quizQuestion.routes';

const BaseRoutes = (app: Application) => {
   const routes = () => {
      app.use(`/api/v2/lms`, lmsRoutes.routes());
      app.use(`/api/v2/quiz`, quizRoutes.routes());
      app.use(`/api/v2/quiz/question`, quizQuestionRoutes.routes());
   };
   routes();
};
export default BaseRoutes;