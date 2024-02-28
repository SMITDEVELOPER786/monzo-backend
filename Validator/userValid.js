const exp = require("express")
const joi = require("joi")

const userValid = joi.object({
    email: joi.string().trim().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).messages({
        "string.base" :`Email is must be a String`,
        "string empty":`Email connot be a empty`,
        "any.required":`Email is required`,
        "string.email":`Email must be valid` 
       }),
       password: joi.string().trim().min(8).max(20).required().messages({
        "string.base" :`password is must be a String`,
        "string empty":`password connot be a empty`,
        "any.required":`password is required`,
        "string.max":`max 8 num latters` ,
        "string.min":`min num latters` 
       })
   

})

module.exports = userValid
