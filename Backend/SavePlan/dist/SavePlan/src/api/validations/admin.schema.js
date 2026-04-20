"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminValidation = void 0;
const joi_1 = __importDefault(require("joi"));
class AdminValidation {
}
exports.AdminValidation = AdminValidation;
AdminValidation.create = {
    body: joi_1.default.object().keys({
        title: joi_1.default.string().required().messages({
            'string.empty': `Title cannot be empty`,
            'any.required': `Title is required`,
        }),
        type: joi_1.default.number().required().messages({
            'number.empty': `Plan type cannot be empty`,
            'any.required': `Plan type is required`,
        }),
        calculator: joi_1.default.number().required().messages({
            'number.empty': `Calculator cannot be empty`,
            'any.required': `Calculator is required`,
        }),
        currency: joi_1.default.number().required().messages({
            'number.empty': `Currency cannot be empty`,
            'any.required': `Currency is required`,
        }),
        description: joi_1.default.string().optional().allow(null).allow(''),
        interestRate: joi_1.default.number().required().messages({
            'number.empty': `Interest Rate cannot be an empty field`,
            'any.required': `Interest Rate is a required field`,
        }),
        minDuration: joi_1.default.number().required().messages({
            'number.empty': `Minimum duration cannot be an empty field`,
            'any.required': `Minimum duration is a required field`,
        }),
        maxDuration: joi_1.default.number().optional().allow(null).allow(''),
        minAmount: joi_1.default.number().optional().allow(null).allow(''),
        maxAmount: joi_1.default.number().allow(null).allow(''),
        chargeList: joi_1.default.string().optional().allow(null).allow(''),
        categoryMax: joi_1.default.number().optional().allow(null).allow(''),
        categoryMin: joi_1.default.number().optional().allow(null).allow(''),
    }).unknown().strict(),
};
AdminValidation.update = {
    body: joi_1.default.object().keys({
        title: joi_1.default.string().optional(),
        slug: joi_1.default.string().optional(),
        icon: joi_1.default.string().optional(),
        type: joi_1.default.string().optional(),
        calculator: joi_1.default.string().optional(),
        currency: joi_1.default.string().optional(),
        description: joi_1.default.string().optional(),
        interestRate: joi_1.default.number().optional(),
        minDuration: joi_1.default.number().optional(),
        maxDuration: joi_1.default.number().optional(),
        minAmount: joi_1.default.optional(),
        maxAmount: joi_1.default.optional(),
        status: joi_1.default.string().optional(),
    }),
};
