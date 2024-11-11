import Joi from 'joi';

export class StartAttemptValidation {
   static startAttempt = {
      params: Joi.object().keys({
         quiz: Joi.string().required().messages({
            'string.empty': `Quiz cannot be empty`,
            'any.required': `Quiz is required`,
         })
      }).unknown().strict()
   };
   static endAttempt = {
      params: Joi.object().keys({
         quiz: Joi.string().required().messages({
            'string.empty': `Quiz cannot be empty`,
            'any.required': `Quiz is required`,
         })
      }).unknown().strict()
   };
   static getAttempt = {
      query: Joi.object().keys({
         quiz: Joi.string().optional()
      }).unknown().strict()
   };
   static deleteAttempt = {
      params: Joi.object().keys({
         quiz: Joi.string().optional()
      }).unknown().strict()
   };
}