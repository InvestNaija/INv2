import { Joi as BaseJoi, JoiDate } from '@inv2/common';
const Joi = BaseJoi.extend(JoiDate);
/**
 * Admin Validation
 * Joi schemas for administrative endpoints in the InvestIN service.
 */
export class AdminValidation {
   /**
    * Validation for listing fund transactions.
    */
   static getFunds = {
      query: Joi.object().keys({
         q: Joi.string().required().valid('r', 's').messages({
            'any.only': 'Q parameter must be "r" (redemption) or "s" (subscription)',
            'any.required': 'Q parameter is required in query',
         }),
         startDate: Joi.date().required().messages({
            'date.base': 'Start date must be a valid date',
            'any.required': 'Start date is required',
         }),
         endDate: Joi.date().required().messages({
            'date.base': 'End date must be a valid date',
            'any.required': 'End date is required',
         }),
         page: Joi.number().min(1).default(1),
         size: Joi.number().min(1).default(10),
         status: Joi.string().optional(),
         fundId: Joi.string().uuid().optional(),
         search: Joi.string().optional(),
         channel: Joi.string().optional(),
         download: Joi.boolean().optional(),
      }).unknown(),
   };

   static createAsset = {
      body: Joi.object().keys({
         name: Joi.string().required().messages({
            'string.empty': 'Name cannot be empty',
            'any.required': 'Name is required',
         }),
         assetCode: Joi.string().required().messages({
            'string.empty': 'Asset Code cannot be empty',
            'any.required': 'Asset Code is required',
         }),
         externalIdentifier: Joi.string().required().messages({
            'string.empty': 'External Identifier cannot be empty',
            'any.required': 'External Identifier is required',
         }),
         description: Joi.string().optional(),
         price: Joi.number().positive().required().messages({
            'number.base': 'Price must be a number',
            'number.positive': 'Price must be positive',
            'any.required': 'Price is required',
         }),
         yield: Joi.string().optional(),
         currency: Joi.string().length(3).optional().messages({
            'string.length': 'Currency must be a 3-character code',
         }),
         minimumUnitsToPurchase: Joi.number().positive().required().messages({
            'number.base': 'Minimum Units to Purchase must be a number',
            'number.positive': 'Minimum Units to Purchase must be positive',
            'any.required': 'Minimum Units to Purchase is required',
         }),
         subsequentMultipleUnits: Joi.number().positive().required().messages({
            'number.base': 'Subsequent Multiple Units must be a number',
            'number.positive': 'Subsequent Multiple Units must be positive',
            'any.required': 'Subsequent Multiple Units is required',
         }),
         openingDate: Joi.date().format('YYYY-MM-DD').required().messages({
            'date.format': 'Opening Date must be in YYYY-MM-DD format',
            'date.empty': `Opening Date cannot be empty`,
            'any.required': `Opening Date is required`,
         }),
         closingDate: Joi.date().format('YYYY-MM-DD').required().messages({
            'date.format': 'Closing Date must be in YYYY-MM-DD format',
            'date.empty': `Closing Date cannot be empty`,
            'any.required': `Closing Date is required`,
         }),
      }).unknown(),
   };
}
