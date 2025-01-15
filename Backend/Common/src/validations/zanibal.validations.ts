const Joi = require('joi');

export class ZanibalValidation {
    static createCustomer = {
        body: Joi.object().keys({
            bvnCode: Joi.string().required().messages({
                'string.empty': `BVN cannot be empty`,
                'any.required': `BVN is required`,
            }),
            firstName: Joi.string().required().messages({
                'string.empty': `First Name cannot be empty`,
                'any.required': `First Name is required`,
            }),
            lastName: Joi.string().required().messages({
                'string.empty': `Last Name cannot be empty`,
                'any.required': `Last Name is required`,
            }),
            emailAddress1: Joi.string().required().messages({
                'string.empty': `Email cannot be empty`,
                'any.required': `Email is required`,
            }),
            sex: Joi.string().required().messages({
                'string.empty': `Sex cannot be empty`,
                'any.required': `Sex is required`,
            }),
            cellPhone: Joi.string().required().messages({
                'string.empty': `Phone cannot be empty`,
                'any.required': `Phone is required`,
            }),
            primaryAddress1: Joi.string().required().messages({
                'string.empty': `Primary Address1 cannot be empty`,
                'any.required': `Primary Address1 is required`,
            }),
            primaryCity: Joi.string().required().messages({
                'string.empty': `Primary City1 cannot be empty`,
                'any.required': `Primary City1 is required`,
            }),
            primaryState: Joi.string().required().messages({
                'string.empty': `Primary State cannot be empty`,
                'any.required': `Primary State is required`,
            }),
            primaryCountry: Joi.string().required().messages({
                'string.empty': `Primary Country cannot be empty`,
                'any.required': `Primary Country is required`,
            }),
            nationality: Joi.string().required().messages({
                'string.empty': `Nationality cannot be empty`,
                'any.required': `Nationality is required`,
            }),
            motherMaidenName: Joi.string().required().messages({
                'string.empty': `Mother's Maiden Name cannot be empty`,
                'any.required': `Mother's Maiden Name is required`,
            }),
            setttlementBankAccountNumber: Joi.string().required().messages({
                'string.empty': `NUBAN cannot be empty`,
                'any.required': `NUBAN is required`,
            }),
            setttlementBankName: Joi.string().required().messages({
                'string.empty': `Bank Name cannot be empty`,
                'any.required': `Bank Name is required`,
            }),
            setttlementBankAccountName: Joi.string().required().messages({
                'string.empty': `Bank Account Name cannot be empty`,
                'any.required': `Bank Account Name is required`,
            }),
        }).unknown(),
    };
    static customerUpdate = {
        body: Joi.object().keys({
            id: Joi.string().required().messages({
                'string.empty': `Zanibal Id cannot be empty`,
                'any.required': `Zanibal Id is required`,
            }),
        }).unknown(),
    };
    static customerUpdateBankAcc = {
        body: Joi.object().keys({
            id: Joi.string().required().messages({
                'string.empty': `Zanibal Id cannot be empty`,
                'any.required': `Zanibal Id is required`,
            }),
            setttlementBankAccountNumber: Joi.string().required().messages({
                'string.empty': `NUBAN cannot be empty`,
                'any.required': `NUBAN is required`,
            }),
            setttlementBankName: Joi.string().required().messages({
                'string.empty': `Bank Name cannot be empty`,
                'any.required': `Bank Name is required`,
            }),
            setttlementBankAccountName: Joi.string().required().messages({
                'string.empty': `Bank Account Name cannot be empty`,
                'any.required': `Bank Account Name is required`,
            }),
        }).unknown(),
    };
}
