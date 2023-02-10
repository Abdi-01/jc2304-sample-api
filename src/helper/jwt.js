const jwt = require('jsonwebtoken');

module.exports = {
    createToken: (payload, exp = '24h') => jwt.sign(payload, 'EdoTensei', {
        expiresIn: exp
    }),
    readToken: (req, res, next) => {
        jwt.verify(req.token, 'EdoTensei', (error, decript) => {
            if (error) {
                console.log(error);
                return res.status(401).send({
                    success: false,
                    message: 'Authenticate failed'
                })
            }

            req.decript = decript;
            next();
        });
    }
}