const BaseJoi = require('joi');
const JoiDate = require('@joi/date');
const Joi = BaseJoi.extend(JoiDate);

const eighteenYearsAgo = new Date();
eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

const schema = Joi.object().keys({
    dob: Joi.date().format(['YYYY-MM-DD']).greater(eighteenYearsAgo).less('now').required().messages({
        'date.base': `Date of Birth must be a valid date.`,
        'date.format': `Date of Birth must be in YYYY-MM-DD format`,
        'date.greater': `Dependent must be less than 18 years old`,
        'date.less': `Date of Birth cannot be in the future`,
        'any.required': `Date of Birth is required`,
    }),
});

const payloads = [
    { dob: "1980-05-26" }, // Older than 18 (fails greater)
    { dob: "2050-01-01" }, // Future (fails less)
    { dob: "2015-05-26" }, // Good (under 18, past)
];

for (const p of payloads) {
    const result = schema.validate(p, { abortEarly: false, allowUnknown: true });
    console.log(`Payload ${p.dob}:`, result.error ? result.error.details.map(d => d.message) : "Success");
}
