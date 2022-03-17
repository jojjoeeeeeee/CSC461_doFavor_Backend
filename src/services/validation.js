const Joi = require('@hapi/joi');

const registerValidation = (data) => {
        const schema = Joi.object({
                username: Joi.string()
                        .min(6)
                        .required(),
                password: Joi.string()
                        .min(6)
                        .max(32)
                        .required(),
                email: Joi.string()
                        .email()
                        .required(),
                name: {
                firstname: Joi.string()
                        .max(128)
                        .required(),
                lastname: Joi.string()
                        .max(128)
                        .required()
                },
                profile_pic: Joi.string()
                        .allow('')
                        .required(),
                device_id: Joi.string()
                        .required()
        });
        return schema.validate(data);
};

const loginValidation = data => {
        const schema = Joi.object({
                username: Joi.string()
                        .min(6)
                        .required(),
                password: Joi.string()
                        .min(6)
                        .required(),
                device_id: Joi.string()
                        .required()
        });
        return schema.validate(data);
};

const verifyValidation = data => {
        const schema = Joi.object({
                email: Joi.string()
                        .email()
                        .required(),
                otp: Joi.string().regex(/^[0-9]{6}$/)
                        .required()
        });
        return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.verifyValidation = verifyValidation;