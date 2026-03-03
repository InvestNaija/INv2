import Joi from "joi";

export class AttemptAnswerValidation {
    static createAttemptAnswer = {
        body: Joi.object({
            quizAttemptId: Joi.string().uuid().required(),
            questionId: Joi.string().uuid().required(),
            answerGiven: Joi.string().required(),
            answerScore: Joi.number().required()
        }).unknown().strict()
    };

    static updateAttemptAnswer = {
        body: Joi.object({
            answerGiven: Joi.string().optional(),
            answerScore: Joi.number().optional()
        }).unknown().strict()
    };
}
