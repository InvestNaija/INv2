const BaseJoi = require('joi');
const JoiDate = require('@joi/date');
const Joi = BaseJoi.extend(JoiDate);

const schema = Joi.object().keys({
    dob: Joi.date().format(['YYYY-MM-DD']).utc().custom((value, helpers) => {
        const inputDateStr = value.toISOString().split('T')[0];
        const todayDateStr = new Date().toISOString().split('T')[0];
        
        if (inputDateStr >= todayDateStr) {
            return helpers.error('date.less');
        }

        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setUTCFullYear(eighteenYearsAgo.getUTCFullYear() - 18);
        const eighteenStr = eighteenYearsAgo.toISOString().split('T')[0];

        if (inputDateStr <= eighteenStr) {
            return helpers.error('date.greater');
        }

        return value;
    }).required().messages({
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
    "2008-04-20", // Exactly 18 years ago, should fail 
    "2009-01-01", // Should pass
    "1980-05-26", // Should fail
];

for (const p of testCases) {
    const result = schema.validate({ dob: p }, { abortEarly: false, allowUnknown: true });
    console.log(`Payload ${p}:`, result.error ? result.error.details.map(d => d.message) : "Success");
}
