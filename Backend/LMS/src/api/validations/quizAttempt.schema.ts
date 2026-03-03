import Joi from "joi";

export class QuizAttemptValidation {
    static createQuizAttempt = {
        body: Joi.object({
            quizId: Joi.string().uuid().required(),
            attemptIp: Joi.string().max(45).optional()
        })
    };

    static updateQuizAttempt = {
        body: Joi.object({
            attemptEnd: Joi.date().optional(),
            attemptIp: Joi.string().max(45).optional()
        })
    };
}
