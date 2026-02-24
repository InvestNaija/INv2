import Joi from 'joi';

export class QuizQuestionValidation {
   static createQuizQuestion = {
      body: Joi.object().keys({
         quizId: Joi.string().required().messages({
            'string.empty': `Quiz ID cannot be empty`,
            'any.required': `Quiz ID is required`,
         }),
         questionId: Joi.string().required().messages({
            'string.empty': `Question ID cannot be empty`,
            'any.required': `Question ID is required`,
         }),
         userId: Joi.string().required().messages({
            'string.empty': `User ID cannot be empty`,
            'any.required': `User ID is required`,
         }),
         passScore: Joi.number().required().messages({
            'number.empty': `Pass score cannot be empty`,
            'any.required': `Pass score is required`,
         }),
         failScore: Joi.number().required().messages({
            'number.empty': `Fail score cannot be empty`,
            'any.required': `Fail score is required`,
         }),
         order: Joi.number().required().messages({
            'number.empty': `Order cannot be empty`,
            'any.required': `Order is required`,
         }),
         
      }).unknown().strict()
   };

   static updateQuizQuestion = {
      body: Joi.object().keys({
         passScore: Joi.number().optional(),
         failScore: Joi.number().optional(),
         order: Joi.number().optional(),
      }).unknown().strict()
   };
};