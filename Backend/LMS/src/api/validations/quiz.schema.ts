import Joi from 'joi';

export class QuizValidation {
   static createQuiz = {
      body: Joi.object().keys({
         lmsId: Joi.object().optional(),
         userId: Joi.string().required().messages({
            'string.empty': `User ID cannot be empty`,
            'any.required': `User ID is required`,
         }),
         title: Joi.string().required().messages({
            'string.empty': `Title cannot be empty`,
            'any.required': `Title is required`,
         }),
         detail: Joi.string().required().messages({
            'string.empty': `Detail cannot be empty`,
            'any.required': `Detail is required`,
         }),
         startDate: Joi.string().required().messages({
            'string.empty': `Start Date cannot be empty`,
            'any.required': `Start Date is required`
         }),
         endDate: Joi.string().required().messages({
            'string.empty': `End Date cannot be empty`,
            'any.required': `End Date is required`
         }),
         isImmediateAnswer: Joi.boolean().required().messages({
            'boolean.empty': `Is Immediate Answers cannot be empty`,
            'any.required': `Is Immediate Answers cannot be empty`
         })
      }).unknown().strict()
   };

   static updateQuiz = {
      body: Joi.object().keys({
         title: Joi.string().optional(),
         detail: Joi.string().optional(),
         startDate: Joi.string().optional(),
         endDate: Joi.string().optional(),
         isImmediateAnswer: Joi.string().optional(),
      }).unknown().strict()
   };
};