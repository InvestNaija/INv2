const BaseJoi = require('joi');
const JoiDate = require('@joi/date');
const Joi = BaseJoi.extend(JoiDate);

const schema = Joi.object().keys({
    dob: Joi.date().format('YYYY-MM-DD').utc().required().messages({
        'date.base': `Date of Birth must be a valid date...`,
        'date.format': `Date of Birth must be in YYYY-MM-DD format`,
        'any.required': `Date of Birth is required`,
    }),
    gender: Joi.alternatives().try(Joi.number(), Joi.string()).required().messages({
        'any.required': `Gender is required`,
    }),
}); // NO .strict()

const payload = {
    "firstName": "Bisolu",
    "lastName": "Hasn",
    "email": "bisolu@hans.com",
    "dob": "1980-05-26",
    "gender": "male"
};

const result = schema.validate(payload, { abortEarly: false, allowUnknown: true });
console.log(JSON.stringify(result.error ? result.error.details : "Success", null, 2));
