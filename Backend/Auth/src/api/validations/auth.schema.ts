import { Joi } from '@inv2/common';

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
   static forgotPassword = {
      body: Joi.object().keys({
         email: Joi.string().email({ tlds: { allow: false } }).required().messages({
            'string.empty': `Email cannot be empty`,
            'string.email': 'Email must be a valid email',
            'any.required': `Email is required`,
         }),
      }).unknown().strict(),
   };
   static resetPassword = {
      body: Joi.object().keys({
         email: Joi.string().email({ tlds: { allow: false } }).required().messages({
            'string.empty': `Email cannot be empty`,
            'string.email': 'Email must be a valid email',
            'any.required': `Email is required`,
         }),
         otp: Joi.string().required().messages({
            'string.empty': `OTP cannot be empty`,
            'any.required': `OTP is required`,
         }),
         password: Joi.string().required().messages({
            'string.empty': `Password cannot be empty`,
            'any.required': `Password is required`,
         }),
         confirmPassword: Joi.string().required().messages({
            'string.empty': `Confirm Password cannot be empty`,
            'any.required': `Confirm Password is required`,
         }),
      }).unknown().strict(),
   };
   static set2FA = {
      body: Joi.object().keys({
         enable2fa: Joi.boolean().required().messages({
            'boolean.empty': `You need to either enable or disable 2FA`,
            'any.required': `You need to either enable or disable 2FA`,
         }),
      }).unknown().strict(),
   };
   static registerDependent = {
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
         phone: Joi.string().optional(),
         nin: Joi.string().required().messages({
            'string.empty': `NIN cannot be empty`,
            'any.required': `NIN is required`,
         }),
         dob: Joi.date().format(['YYYY-MM-DD']).greater(new Date().setFullYear(new Date().getFullYear() - 18)).less(new Date().setHours(0, 0, 0, 0)).required().messages({
            'date.base': `Date of Birth must be a valid date.`,
            'date.format': `Date of Birth must be in YYYY-MM-DD format`,
            'date.greater': `Dependent must be less than 18 years old`,
            'date.less': `Date of Birth cannot be in the future or today`,
            'any.required': `Date of Birth is required`,
         }),
         gender: Joi.number().required().messages({
            'number.base': `Gender is required`,
            'any.required': `Gender is required`,
         }),
         relationship: Joi.number().required().messages({
            'number.base': `Relationship to dependant is required`,
            'any.required': `Relationship to dependant is required`,
         }),
         nationality: Joi.string().optional().messages({
            'string.empty': `Nationality is required`,
            'any.required': `Nationality is required`,
         }),
         mothersMaidenName: Joi.string().required().messages({
            'string.empty': `Mother's Maiden Name is required`,
            'any.required': `Mother's Maiden Name is required`,
         }),
      }).unknown(),
   };
}
