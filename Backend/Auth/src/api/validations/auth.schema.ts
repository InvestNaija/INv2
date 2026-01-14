import Joi from 'joi';

export class AuthValidation {
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
   static login = {
      body: Joi.object().keys({
         email: Joi.string().trim().email({ tlds: { allow: false } }).required().messages({
            'string.empty': `Email cannot be empty`,
            'string.email': 'Email must be a valid email',
            'any.required': `Email is required`,
         }),
         password: Joi.string().required().messages({
            'string.empty': `Password cannot be empty`,
            'any.required': `Password is required`,
         }),
         deviceToken: Joi.string().optional(),
         channel: Joi.string().optional(),
         deviceId: Joi.string().optional(),
         deviceName: Joi.string().optional(),
      }).unknown().strict(),
   };
   static changePassword = {
      body: Joi.object().keys({
         oldPassword: Joi.string().required().messages({
            'string.empty': `Old Password cannot be empty`,
            'any.required': `Old Password is required`,
         }),
         newPassword: Joi.string().required().messages({
            'string.empty': `New Password cannot be empty`,
            'any.required': `New Password is required`,
         }),
      }).unknown().strict(),
   };
   static resetPasswordCustomer = {
      body: Joi.object().keys({
         password: Joi.string().required().messages({
            'string.empty': `Password cannot be empty`,
            'any.required': `Password is required`,
         }),
         confirmPassword: Joi.string().required().messages({
            'string.empty': `Confirm Password cannot be empty`,
            'any.required': `Confirm Password is required`,
         }),
      }).unknown().strict(),
      params: {
         token: Joi.string().required().messages({
            'string.empty': `Token cannot be empty`,
            'any.required': `Token is required`,
         }),
      },
   };
   static set2FA = {
      body: Joi.object().keys({
         enable2fa: Joi.boolean().required().messages({
            'boolean.empty': `You need to either enable or disable 2FA`,
            'any.required': `You need to either enable or disable 2FA`,
         }),
      }).unknown().strict(),
   };
}
