import Joi from 'joi';

export class QuestionValidation {
    static createQuestion = {
        body: Joi.object().keys({
            title: Joi.string().required().messages({
                'string.empty': `Title cannot be empty`,
                'any.required': `Title is required`,
            }),
            details: Joi.string().required().messages({
                'string.empty': `Details cannot be empty`,
                'any.required': `Details is required`,
            }),
            type: Joi.string().required().messages({
                'string.empty': `Type cannot be empty`,
                'any.required': `Type is required`,
            }),
        }).unknown().strict()
    };

    static updateQuestion = {
        body: Joi.object().keys({
            title: Joi.string().required().messages({
                'string.empty': `Title cannot be empty`,
                'any.required': `Title is required`,
            }),
            details: Joi.string().required().messages({
                'string.empty': `Details cannot be empty`,
                'any.required': `Details is required`,
            }),
            type: Joi.string().required().messages({
                'string.empty': `Type cannot be empty`,
                'any.required': `Type is required`,
            }),
        }).unknown().strict()
    };
}