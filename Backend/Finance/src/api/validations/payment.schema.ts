import Joi from 'joi';

export class PaymentValidation {
   static payment = {
      body: Joi.object().keys({
         amount: Joi.number().required().messages({
            'number.empty': `Amount cannot be empty`,
            'any.required': `Amount is required`,
         }),
         module: Joi.string().required().messages({
            'string.empty': `Module cannot be empty`,
            'any.required': `Module is required`,
         }),
         moduleId: Joi.string().required().messages({
            'string.empty': `Module Id be empty`,
            'any.required': `Module Id is required`,
         }),
         userId: Joi.string().required().messages({
            'string.empty': `User Id cannot be empty`,
            'any.required': `User Id is required`,
         }),
         gateway: Joi.string().required().messages({
            'string.empty': `Gateway cannot be empty`,
            'any.required': `Gateway is required`,
         }),
      }).unknown().strict(),
   };
}
