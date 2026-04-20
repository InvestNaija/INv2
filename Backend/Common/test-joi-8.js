const BaseJoi = require('joi');
const JoiDate = require('@joi/date');
const Joi = BaseJoi.extend(JoiDate);

const schema = Joi.object().keys({
    dob: Joi.date()
        .format(['YYYY-MM-DD'])
        .greater(new Date(new Date().setFullYear(new Date().getFullYear() - 18)))
        .less(new Date(new Date().setHours(0, 0, 0, 0)))
        .required()
        .messages({
            'date.base': `Date of Birth must be a valid date.`,
            'date.format': `Date of Birth must be in YYYY-MM-DD format`,
            'date.greater': `Dependent must be less than 18 years old`,
            'date.less': `Date of Birth cannot be in the future or today`,
            'any.required': `Date of Birth is required`,
        }),
});

const testCases = [
    "2026-04-20", // Today (should fail)
    "2026-04-19", // Yesterday (should pass)
];

for (const p of testCases) {
    const result = schema.validate({ dob: p }, { abortEarly: false, allowUnknown: true });
    console.log(`Payload ${p}:`, result.error ? result.error.details.map(d => d.message) : "Success");
}
