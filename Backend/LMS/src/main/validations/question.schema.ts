import Joi from 'joi';

export class QuestionValidation {
   static createQuestion = {
      body: Joi.object().keys({
         userId: Joi.string().required().messages({
            'string.empty': `User ID cannot be empty`,
            'any.required': `User ID is required`,
         }),
         title: Joi.string().required().messages({
            'string.empty': `Title cannot be empty`,
            'any.required': `Title is required`,
         }),
         detail: Joi.string().required().messages({
            'string.empty': `Details cannot be empty`,
            'any.required': `Details is required`,
         }),
         type: Joi.number().required().messages({
            'number.empty': `Type cannot be empty`,
            'any.required': `Type is required`
         })
      }).unknown().strict()
   };

   static updateQuestion = {
      body: Joi.object().keys({
         title: Joi.string().optional(),
         detail: Joi.string().optional(),
         startDate: Joi.string().optional(),
         endDate: Joi.string().optional(),
         isImmediateAnswer: Joi.string().optional(),
      }).unknown().strict()
   };
};