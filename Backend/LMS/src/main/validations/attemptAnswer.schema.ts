import Joi from 'joi';

export class AttemptAnswerValidation {
   static attemptAnswer = {
      body: Joi.object().keys({
         answerGiven: Joi.string().required().messages({
            'string.empty': `Title cannot be empty`,
            'any.required': `Title is required`,
         }),
         questionId: Joi.string().required().messages({
            'string.empty': `Type cannot be empty`,
            'any.required': `Type is required`,
         }),
         quizAttepmtId: Joi.string().required().messages({
            'string.empty': `Type cannot be empty`,
            'any.required': `Type is required`,
         }),
      }).unknown().strict()
   };

   static getAttemptAnswer = {
      query: Joi.object().keys({
         id: Joi.string().required().messages({
            'string.empty': `Title cannot be empty`,
            'any.required': `Title is required`,
         }),
         search: Joi.string().required().messages({
            'string.empty': `Type cannot be empty`,
            'any.required': `Type is required`,
         }),
         attemptId: Joi.string().required().messages({
            'string.empty': `Type cannot be empty`,
            'any.required': `Type is required`,
         }),
         question: Joi.string().required().messages({
            'string.empty': `Type cannot be empty`,
            'any.required': `Type is required`,
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