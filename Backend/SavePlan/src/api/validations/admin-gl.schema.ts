import Joi from 'joi';

export class AdminGlValidation {
   static create = {
      body: Joi.object().keys({
         code: Joi.string().required().messages({
            'string.empty': `Code cannot be empty`,
            'any.required': `Code is required`,
         }),
         description: Joi.string().optional().allow(null).allow(''),
         type: Joi.number().required().messages({
            'number.empty': `GL Type cannot be an empty field`,
            'any.required': `GL Type is a required field`,
         }),
         rate: Joi.number().required().messages({
            'number.empty': `Rate for GL cannot be an empty field`,                                                                                   
            'any.required': `Rate for GL is a required field`,
         }),
      }).unknown().strict(),
      params: Joi.object().keys({
         saveplanId: Joi.string().required().messages({
            'string.empty': `SavePlan ID cannot be empty`,
            'any.required': `SavePlan ID is required`,
         }),
      })
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
