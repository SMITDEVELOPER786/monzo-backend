const Joi = require("joi");

const agencyValidate = Joi.object({
    email: Joi.string().trim().required().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
    }).messages({
        "string.base": `Email is must be a String`,
        "string empty": `Email connot be a empty`,
        "any.required": `Email is required`,
        "string.email": `Email must be valid`
    }),
    phone: {

    }
})