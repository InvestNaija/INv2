"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSavePlanValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const date_1 = __importDefault(require("@joi/date"));
const Joi = joi_1.default.extend(date_1.default);
class CustomerSavePlanValidation {
}
exports.CustomerSavePlanValidation = CustomerSavePlanValidation;
CustomerSavePlanValidation.create = {
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
        custom: Joi.boolean().required().messages({
            'any.required': `Custom is required`,
        }),
        frequency: Joi.string().required().messages({
            'string.empty': `Frequency cannot be empty`,
            'any.required': `Frequency is required`,
        }),
        duration: Joi.alternatives().try(Joi.number(), Joi.string()).required().messages({
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
        customEndDate: Joi.alternatives().try(Joi.date().format(['YYYY-MM-DD']), Joi.string().valid('')).messages({
            'alternatives.match': 'Custom End Date must be in YYYY-MM-DD format or empty',
            'date.format': 'Custom End Date must be in YYYY-MM-DD format',
            'date.empty': `Custom End Date cannot be empty`,
            'any.required': `Custom End Date is required`,
        }),
        gateway: Joi.string().required().messages({
            'string.empty': `Gateway cannot be empty`,
            'any.required': `Gateway is required`,
        }),
    }).unknown(),
};
