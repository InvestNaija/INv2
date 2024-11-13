import { Application } from 'express';
import { lmsRoutes } from './lms.routes';
import { quizRoutes } from './quiz.routes';
import { quizQuestionRoutes } from './quizQuestion.routes';
import { questionRoutes } from './question.routes';

const BaseRoutes = (app: Application) => {
   const routes = () => {
      app.use(`/api/v2/lms`, lmsRoutes.routes());
      app.use(`/api/v2/quizes`, quizRoutes.routes());
      app.use(`/api/v2/questions`, questionRoutes.routes());
      app.use(`/api/v2/quiz/questions`, quizQuestionRoutes.routes());
   };
   routes();
};
export default BaseRoutes;