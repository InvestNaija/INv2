"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const joi_1 = __importDefault(require("joi"));
class AuthValidation {
}
exports.AuthValidation = AuthValidation;
AuthValidation.signup = {
    body: joi_1.default.object().keys({
        firstName: joi_1.default.string().required().messages({
            'string.empty': `First Name cannot be empty`,
            'any.required': `First Name is required`,
        }),
        lastName: joi_1.default.string().required().messages({
            'string.empty': `Last Name cannot be empty`,
            'any.required': `Last Name is required`,
        }),
        middleName: joi_1.default.string().optional(),
        email: joi_1.default.string().email({ tlds: { allow: false } }).required().messages({
            'string.empty': `Email cannot be empty`,
            'string.email': 'Email must be a valid email',
            'any.required': `Email is required`,
        }),
        phone: joi_1.default.string().required().messages({
            'string.empty': `Phone cannot be empty`,
            'any.required': `Phone is required`,
        }),
        password: joi_1.default.string().required().messages({
            'string.empty': `Password cannot be empty`,
            'any.required': `Password is required`,
        }),
    }).unknown().strict(),
};
AuthValidation.login = {
    body: joi_1.default.object().keys({
        email: joi_1.default.string().trim().email({ tlds: { allow: false } }).required().messages({
            'string.empty': `Email cannot be empty`,
            'string.email': 'Email must be a valid email',
            'any.required': `Email is required`,
        }),
        password: joi_1.default.string().required().messages({
            'string.empty': `Password cannot be empty`,
            'any.required': `Password is required`,
        }),
        deviceToken: joi_1.default.string().optional(),
        channel: joi_1.default.string().optional(),
        deviceId: joi_1.default.string().optional(),
        deviceName: joi_1.default.string().optional(),
    }).unknown().strict(),
};
AuthValidation.changePassword = {
    body: joi_1.default.object().keys({
        oldPassword: joi_1.default.string().required().messages({
            'string.empty': `Old Password cannot be empty`,
            'any.required': `Old Password is required`,
        }),
        newPassword: joi_1.default.string().required().messages({
            'string.empty': `New Password cannot be empty`,
            'any.required': `New Password is required`,
        }),
    }).unknown().strict(),
};
AuthValidation.resetPasswordCustomer = {
    body: joi_1.default.object().keys({
        password: joi_1.default.string().required().messages({
            'string.empty': `Password cannot be empty`,
            'any.required': `Password is required`,
        }),
        confirmPassword: joi_1.default.string().required().messages({
            'string.empty': `Confirm Password cannot be empty`,
            'any.required': `Confirm Password is required`,
        }),
    }).unknown().strict(),
    params: {
        token: joi_1.default.string().required().messages({
            'string.empty': `Token cannot be empty`,
            'any.required': `Token is required`,
        }),
    },
};
AuthValidation.set2FA = {
    body: joi_1.default.object().keys({
        enable2fa: joi_1.default.boolean().required().messages({
            'boolean.empty': `You need to either enable or disable 2FA`,
            'any.required': `You need to either enable or disable 2FA`,
        }),
    }).unknown().strict(),
};
