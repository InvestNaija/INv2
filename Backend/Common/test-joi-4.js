const BaseJoi = require('joi');
const JoiDate = require('@joi/date');
const Joi = BaseJoi.extend(JoiDate);

const schema = Joi.object().keys({
    dob: Joi.date().format('YYYY-MM-DD').utc().required().messages({
        'date.base': `Date of Birth must be a valid date.`,
        'date.format': `Date of Birth must be in YYYY-MM-DD format`,
        'any.required': `Date of Birth is required`,
        'date.empty': `Date of Birth cannot be empty`
    }),
}).unknown().strict();

const payload = {
    "dob": "1980-05-26"
};

const result = schema.validate(payload, { abortEarly: false });
console.log(JSON.stringify(result.error ? result.error.details : "Success", null, 2));
