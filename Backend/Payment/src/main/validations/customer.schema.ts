import Joi from 'joi';

export class SavePlanValidation {
   static signup = {
      body: Joi.object().keys({
         firstName: Joi.string().required().messages({
            'string.empty': `First Name cannot be empty`,
            'any.required': `First Name is required`,
         }),
         lastName: Joi.string().required().messages({
            'string.empty': `Last Name cannot be empty`,
            'any.required': `Last Name is required`,
         }),
         middleName: Joi.string().optional(),
         email: Joi.string().email({ tlds: { allow: false } }).required().messages({
            'string.empty': `Email cannot be empty`,
            'string.email': 'Email must be a valid email',
            'any.required': `Email is required`,
         }),
         phone: Joi.string().required().messages({
            'string.empty': `Phone cannot be empty`,
            'any.required': `Phone is required`,
         }),
         password: Joi.string().required().messages({
            'string.empty': `Password cannot be empty`,
            'any.required': `Password is required`,
         }),
      }).unknown().strict(),
   };
}
