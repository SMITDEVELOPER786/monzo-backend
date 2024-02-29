const Joi = require('joi');

const ProfileValidator = Joi.object({
    username: Joi.string().min(2).max(50).required().messages({
        'string.base': `username must be a string`,
        'string.empty': `username cannot be empty`,
        'any.required': `username is required`,
    }),
    dateOfBirth: Joi.date().required().messages({
        'date.base': `dateOfBirth must be a string`,
        'date.empty': `dateOfBirth cannot be empty`,
        'any.required': `dateOfBirth is required`,
    }),
    gender: Joi.string().valid('male', 'female', 'other').required().messages({
        'string.base': `gender must be a string`,
        'string.empty': `gender cannot be empty`,
        'any.required': `gender is required`,
    }),
    // profileImage: Joi.string().valid().required().messages({
    //     'string.base': `Profileimage must be a string`,
    //     'string.empty': `Profileimage cannot be empty`,
    //     'any.required': `Profileimage is required`,
    // }),
    favBroadcaster: Joi.string().valid().required().messages({
        'string.base': `favBroadcaster must be a string`,
        'string.empty': `favBroadcaster cannot be empty`,
        'any.required': `favBroadcaster is required`,
    }),
    authId: Joi.string().required().messages({
        'string.base': `authId must be a string`,
        'string.empty': `authId cannot be empty`,
        'any.required': `authId is required`,
    }),
});

module.exports = { ProfileValidator };
