import Joi from 'joi';

export class QuestionAnswersValidation {
   static createQuestionAnswer = {
      body: Joi.object().keys({
         questionId: Joi.string().required().messages({
            'string.empty': `Question ID cannot be empty`,
            'any.required': `Question ID is required`,
         }),
         answer: Joi.string().required().messages({
            'string.empty': `Answer cannot be empty`,
            'any.required': `Answer is required`,
         }),
         detail: Joi.string().required().messages({
            'string.empty': `Detail cannot be empty`,
            'any.required': `Detail is required`,
         }),
         isValid: Joi.boolean().required().messages({
            'boolean.empty': `Is Valid cannot be empty`,
            'any.required': `Is Valid  cannot be empty`
         })
      }).unknown().strict()
   };

   static updateQuestionAnswer = {
      body: Joi.object().keys({
         questionId: Joi.string().optional(),
         answer: Joi.string().optional(),
         detail: Joi.string().optional(),
         isValid: Joi.boolean().optional(),
      }).unknown().strict()
   };
};