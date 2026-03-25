import Joi from 'joi';

/**
 * CustomerValidation
 * Defines Joi schemas for validating incoming requests to the CustomerController.
 */
export class CustomerValidation {
   static subscribe = {
      body: Joi.object().keys({
         assetCode: Joi.string().required().messages({
            'string.empty': 'Asset Code cannot be empty',
            'any.required': 'Asset Code is required',
         }),
         transAmount: Joi.number().positive().required().messages({
            'number.base': 'Transaction Amount must be a number',
            'number.positive': 'Transaction Amount must be positive',
            'any.required': 'Transaction Amount is required',
         }),
         portfolioId: Joi.string().required().messages({
            'string.empty': 'Portfolio ID cannot be empty',
            'any.required': 'Portfolio ID is required',
         }),
         currency: Joi.string().length(3).optional().messages({
            'string.length': 'Currency must be a 3-character code',
         }),
         gateway: Joi.string().optional(),
         callbackParams: Joi.object().optional(),
      }).unknown().strict(),
   };

   static postSubscribe = {
      body: Joi.object().keys({
         txnId: Joi.string().required().messages({
            'string.empty': 'Transaction ID is required for posting',
            'any.required': 'Transaction ID is required for posting',
         }),
      }).unknown().strict(),
   };

   static redeem = {
      body: Joi.object().keys({
         assetCode: Joi.string().required().messages({
            'string.empty': 'Asset Code cannot be empty',
            'any.required': 'Asset Code is required',
         }),
         transUnits: Joi.number().positive().required().messages({
            'number.base': 'Transaction Units must be a number',
            'number.positive': 'Transaction Units must be positive',
            'any.required': 'Transaction Units is required',
         }),
         portfolioId: Joi.string().required().messages({
            'string.empty': 'Portfolio ID cannot be empty',
            'any.required': 'Portfolio ID is required',
         }),
         currency: Joi.string().length(3).optional(),
      }).unknown().strict(),
   };
}
