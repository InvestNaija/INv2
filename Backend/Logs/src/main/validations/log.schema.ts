import Joi from 'joi';

export class LogValidation {
   static create = {
      body: Joi.object().keys({
         service: Joi.string().required().messages({
            'string.empty': `Service cannot be empty`,
            'any.required': `Service is required`,
         }),
         level: Joi.string().required().messages({
            'string.empty': `Log level cannot be empty`,
            'any.required': `Log level is required`,
         }),
         message: Joi.string().required().messages({
            'string.empty': `Message cannot be empty`,
            'any.required': `Message is required`,
         }),
         timestamp: Joi.date().required().messages({
            'string.empty': `Timestamp cannot be empty`,
            'any.required': `Timestamp is required`,
         }),
      }).unknown().strict(),
   };
}
