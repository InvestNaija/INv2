import Joi from 'joi';

export class LmsValidation {
   static signup = {
      body: Joi.object().keys({
         firstName: Joi.string().required().messages({
            'string.empty': `First Name cannot be empty`,
            'any.required': `First Name is required`,
         }),
      })
   };
}