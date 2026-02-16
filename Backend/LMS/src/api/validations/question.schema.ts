import Joi from 'joi';

export class QuestionValidation {
   static createQuestion = {
      body: Joi.object().keys({
         quizId: Joi.string().uuid().required().messages({
            'string.empty': `Quiz ID cannot be empty`,
            'any.required': `Quiz ID is required`,
            'string.guid': `Quiz ID must be a valid UUID`,
         }),
         title: Joi.string().max(200).required().messages({
            'string.empty': `Title cannot be empty`,
            'string.max': `Title cannot exceed 200 characters`,
            'any.required': `Title is required`,
         }),
         details: Joi.string().required().messages({
            'string.empty': `Details cannot be empty`,
            'any.required': `Details is required`,
         }),
         type: Joi.alternatives().try(
            Joi.number().integer().min(0),
            Joi.string().valid('Boolean', 'MCMA', 'MCSA', 'MTC', 'SA', 'LA')
         ).required().messages({
            'any.required': `Type is required`,
            'alternatives.match': `Type must be a valid question type (Boolean, MCMA, MCSA, MTC, SA, LA) or a number`,
         }),
      }).unknown().strict()
   };

   static updateQuestion = {
      body: Joi.object().keys({
         title: Joi.string().max(200).optional(),
         details: Joi.string().optional(),
         type: Joi.alternatives().try(
            Joi.number().integer().min(0),
            Joi.string().valid('Boolean', 'MCMA', 'MCSA', 'MTC', 'SA', 'LA')
         ).optional(),
      }).unknown().strict()
   };
}
