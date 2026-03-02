import Joi from "joi";

export class QuestionAnswerValidation {
    static createQuestionAnswer = {
        body: Joi.object({
            questionId: Joi.string().uuid().required(),
            answer: Joi.string().max(1000).required(),
            details: Joi.string().allow('', null).optional(),
            isValid: Joi.boolean().required(),
        }).unknown().strict()
    };

    static updateQuestionAnswer = {
        body: Joi.object({
            answer: Joi.string().max(1000).optional(),
            details: Joi.string().allow('', null).optional(),
            isValid: Joi.boolean().optional(),
        }).unknown().strict()
    };
}
