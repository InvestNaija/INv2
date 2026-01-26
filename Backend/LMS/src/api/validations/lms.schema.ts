import Joi from 'joi';

export class LmsValidation {
   static createLms = {
      body: Joi.object().keys({
         title: Joi.string().required().messages({
            'string.empty': `Title cannot be empty`,
            'any.required': `Title is required`,
         }),
         type: Joi.string().required().messages({
            'string.empty': `Type cannot be empty`,
            'any.required': `Type is required`,
         }),
      }).unknown().strict()
   };

   static updateLms = {
      body: Joi.object().keys({
         title: Joi.string().optional(),
         type: Joi.string().optional(),
         price: Joi.string().optional(),
         summary: Joi.string().optional(),
         content: Joi.string().optional(),
         pId: Joi.string().optional(),
      }).unknown().strict()
   };
}

export class QuizValidation {
   static createQuiz = {
      body: Joi.object().keys({
         lmsId: Joi.string().uuid().required().messages({
            'string.empty': 'LMS ID cannot be empty',
            'any.required': 'LMS ID is required',
         }),
         title: Joi.string().required().messages({
            'string.empty': 'Title cannot be empty',
            'any.required': 'Title is required',
         }),
         detail: Joi.string().allow('').optional(),
         startDate: Joi.alternatives().try(
            Joi.date(),
            Joi.string().isoDate()
         ).optional(),
         endDate: Joi.alternatives().try(
            Joi.date(),
            Joi.string().isoDate()
         ).optional(),
         isImmediateAnswer: Joi.boolean().optional(),
      }).unknown().strict(),
   };

   static updateQuiz = {
      body: Joi.object().keys({
         title: Joi.string().optional(),
         detail: Joi.string().allow('').optional(),
         startDate: Joi.alternatives().try(
            Joi.date(),
            Joi.string().isoDate()
         ).optional(),
         endDate: Joi.alternatives().try(
            Joi.date(),
            Joi.string().isoDate()
         ).optional(),
         isImmediateAnswer: Joi.boolean().optional(),
      }).unknown().strict(),
   };
}