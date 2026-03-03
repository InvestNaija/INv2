import Joi from "joi";

export class QuizQuestionValidation {
   static createQuizQuestion = {
      body: Joi.object({
         quizId: Joi.string().uuid().required(),
         questionId: Joi.string().uuid().required(),
         passScore: Joi.number().required(),
         failScore: Joi.number().required(),
         order: Joi.number().integer().required(),
      }).unknown().strict()
   };

   static updateQuizQuestion = {
      body: Joi.object({
         passScore: Joi.number().optional(),
         failScore: Joi.number().optional(),
         order: Joi.number().integer().optional(),
      }).unknown().strict()
   };
}
