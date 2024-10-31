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