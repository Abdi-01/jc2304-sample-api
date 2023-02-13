const { check, validationResult } = require('express-validator');

module.exports = {
    checkUser: async (req, res, next) => {
        try {
            console.log('request path', req.path);
            if (req.path == '/regis') {
                await check("username").notEmpty().isAlphanumeric().run(req);
                await check("email").notEmpty().isEmail().run(req);
                await check("phone").notEmpty().isMobilePhone().run(req);
            } else if (req.path == '/auth') {
                await check("username").optional({nullable:true}).isAlphanumeric().run(req);
                await check("email").optional({nullable:true}).isEmail().run(req);
                await check("phone").optional({nullable:true}).isMobilePhone().run(req);
            }
            await check("password").notEmpty().isStrongPassword({
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 0
            }).withMessage('Your password is to short or requirement are not met')
                .run(req);

            const validation = validationResult(req);
            console.log("Validation result :", validation);
            if (validation.isEmpty()) {
                next();
            } else {
                return res.status(400).send({
                    success: false,
                    message: 'Validation invalid',
                    error: validation.errors
                })
            }
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}