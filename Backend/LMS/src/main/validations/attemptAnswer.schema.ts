import Joi from 'joi';

export class AttemptAnswerValidation {
   static attemptAnswer = {
      body: Joi.object().keys({
         answerGiven: Joi.string().required().messages({
            'string.empty': `answerGiven cannot be empty`,
            'any.required': `answerGiven is required`,
         }),
         questionId: Joi.string().required().messages({
            'string.empty': `questionId cannot be empty`,
            'any.required': `questionId is required`,
         }),
         quizAttepmtId: Joi.string().required().messages({
            'string.empty': `quizAttepmtId cannot be empty`,
            'any.required': `quizAttepmtId is required`,
         }),
      }).unknown().strict()
   };

   static getAttemptAnswer = {
      query: Joi.object().keys({
         id: Joi.string().optional().messages({
            'string.empty': `query cannot be empty`,
            'any.required': `query is required`,
         }),
         search: Joi.string().optional().messages({
            'string.empty': `search cannot be empty`,
            'any.required': `search is required`,
         }),
         attemptId: Joi.string().optional().messages({
            'string.empty': `attemptId cannot be empty`,
            'any.required': `attemptId is required`,
         }),
         question: Joi.string().optional().messages({
            'string.empty': `question cannot be empty`,
            'any.required': `question is required`,
         }),
      }).unknown().strict()
   };

   static updateAttemptAnswer = {
      params: Joi.object().keys({
         id: Joi.string().required().messages({
            'string.empty': `Title cannot be empty`,
            'any.required': `Title is required`,
         })
      }).unknown().strict(),
      body: Joi.object().keys({
         answerGiven: Joi.string().required().messages({
            'string.empty': `Title cannot be empty`,
            'any.required': `Title is required`,
         })
      }).unknown().strict()
   };

   static deleteAttemptAnswer = {
      params: Joi.object().keys({
         id: Joi.string().required().messages({
            'string.empty': `Title cannot be empty`,
            'any.required': `Title is required`,
         })
      }).unknown().strict(),
   };
}