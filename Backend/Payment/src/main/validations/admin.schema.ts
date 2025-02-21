import Joi from 'joi';

export class AdminValidation {
   static create = {
      body: Joi.object().keys({
         title: Joi.string().required().messages({
            'string.empty': `Title cannot be empty`,
            'any.required': `Title is required`,
         }),
         type: Joi.number().required().messages({
            'number.empty': `Plan type cannot be empty`,
            'any.required': `Plan type is required`,
         }),
         calculator: Joi.number().required().messages({
            'number.empty': `Calculator cannot be empty`,
            'any.required': `Calculator is required`,
         }),
         currency: Joi.number().required().messages({
            'number.empty': `Currency cannot be empty`,
            'any.required': `Currency is required`,
         }),
         description: Joi.string().optional().allow(null).allow(''),
         interestRate: Joi.number().required().messages({
            'number.empty': `Interest Rate cannot be an empty field`,
            'any.required': `Interest Rate is a required field`,
         }),
         minDuration: Joi.number().required().messages({
            'number.empty': `Minimum duration cannot be an empty field`,
            'any.required': `Minimum duration is a required field`,
         }),
         maxDuration: Joi.number().optional().allow(null).allow(''),
         minAmount: Joi.number().optional().allow(null).allow(''),
         maxAmount: Joi.number().allow(null).allow(''),
         chargeList: Joi.string().optional().allow(null).allow(''),
         categoryMax: Joi.number().optional().allow(null).allow(''),
         categoryMin: Joi.number().optional().allow(null).allow(''),
      }).unknown().strict(),
   };

   static update = {
      body: Joi.object().keys({
         title: Joi.string().optional(),
         slug: Joi.string().optional(),
         icon: Joi.string().optional(),
         type: Joi.string().optional(),
         calculator: Joi.string().optional(),
         currency: Joi.string().optional(),
         description: Joi.string().optional(),
         interestRate: Joi.number().optional(),
         minDuration: Joi.number().optional(),
         maxDuration: Joi.number().optional(),
         minAmount: Joi.optional(),
         maxAmount: Joi.optional(),
         status: Joi.string().optional(),
      }),
   };
}
