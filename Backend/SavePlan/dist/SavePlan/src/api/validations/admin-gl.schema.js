"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGlValidation = void 0;
const joi_1 = __importDefault(require("joi"));
class AdminGlValidation {
}
exports.AdminGlValidation = AdminGlValidation;
AdminGlValidation.create = {
    body: joi_1.default.object().keys({
        code: joi_1.default.string().required().messages({
            'string.empty': `Code cannot be empty`,
            'any.required': `Code is required`,
        }),
        description: joi_1.default.string().optional().allow(null).allow(''),
        type: joi_1.default.number().required().messages({
            'number.empty': `GL Type cannot be an empty field`,
            'any.required': `GL Type is a required field`,
        }),
        rate: joi_1.default.number().required().messages({
            'number.empty': `Rate for GL cannot be an empty field`,
            'any.required': `Rate for GL is a required field`,
        }),
    }).unknown().strict(),
    params: joi_1.default.object().keys({
        saveplanId: joi_1.default.string().required().messages({
            'string.empty': `SavePlan ID cannot be empty`,
            'any.required': `SavePlan ID is required`,
        }),
    })
};
AdminGlValidation.update = {
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
