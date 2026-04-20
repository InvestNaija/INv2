const BaseJoi = require('joi');
const JoiDate = require('@joi/date');
const Joi = BaseJoi.extend(JoiDate);

const schema = Joi.object().keys({
    dob: Joi.date().format('YYYY-MM-DD').utc().required().options({ convert: true }),
    gender: Joi.string().required(),
}).unknown().strict();

const payload = {
    "firstName": "Bisolu",
    "lastName": "Hasn",
    "email": "bisolu@hans.com",
    "dob": "1980-05-26",
    "gender": "male"
};

const result = schema.validate(payload, { abortEarly: false });
console.log(JSON.stringify(result.error ? result.error.details : "Success", null, 2));
