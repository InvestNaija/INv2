import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
export class CustomerSavePlanValidation {
   static create = {
      body: Joi.object().keys({
         productId: Joi.string().required().messages({
            'string.empty': `Product ID cannot be empty`,
            'any.required': `Product ID is required`,
         }),
         title: Joi.string().required().messages({
            'string.empty': `Title cannot be empty`,
            'any.required': `Title is required`,
         }),
         initialAmt: Joi.number().required().messages({
            'number.empty': `Initial Amount cannot be empty`,
            'any.required': `Initial Amount is required`,
         }),
         amount: Joi.number().greater(0).required().messages({
            'number.base': `Amount must be a number`,
            'number.greater': `Amount must be greater than 0`,
            'number.empty': `Amount cannot be empty`,
            'any.required': `Amount is required`,
         }),
         frequency: Joi.string().required().messages({
            'string.empty': `Frequency cannot be empty`,
            'any.required': `Frequency is required`,
         }),
         duration: Joi.number().required().messages({
            'number.empty': `Duration cannot be empty`,
            'any.required': `Duration is required`,
         }),
         startDate: Joi.date().format(['YYYY-MM-DD']).required().messages({
            'date.base': 'Start Date must be a valid date. You sent {#value}',
            'date.format': 'Start Date must be in YYYY-MM-DD format. You sent {#value}',
            'date.empty': `Start Date cannot be empty. You sent {#value}`,
            'any.required': `Start Date is required. You sent {#value}`,
         }),
         endDate: Joi.alternatives().try(Joi.date().format(['YYYY-MM-DD']), Joi.string().valid('')).messages({
            'alternatives.match': 'End Date must be in YYYY-MM-DD format or empty',
            'date.format': 'End Date must be in YYYY-MM-DD format',
            'date.empty': `End Date cannot be empty`,
            'any.required': `End Date is required`,
         }),
         gateway: Joi.string().required().messages({
            'string.empty': `Gateway cannot be empty`,
            'any.required': `Gateway is required`,
         }),
      }).unknown(),
   };
}
