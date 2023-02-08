const { users } = require('../models');
const sequelize = require('sequelize');

module.exports = {
    register: async (req, res, next) => {
        try {
            // 1. Memeriksa apakah email atau username sudah pernah terdaftar
            //   - Jika sudah pernah terdaftar maka registrasi tidak lanjut
            let checkUser = await users.findAll({
                where: {
                    [sequelize.Op.or]: [
                        { email: req.body.email },
                        { username: req.body.username }
                    ]
                }
            })
            console.log("Check user exist :", checkUser);
            if (checkUser.length == 0) {
                // 2. Memeriksa password sesuai atau tidak dengan confirmationPassword
                //   - Jika tidak sama maka registrasi tidak lanjut
                if (req.body.password == req.body.confirmationPassword) {
                    // 3. Memeriksa panjang password minimal 9
                    //   - Jika kurang dari 9 maka registrasi tidak lanjut
                    if (req.body.password.length > 8) {
                        // 4. Jika semua persyaratan terpenuhi maka registrasi jalan
                        delete req.body.confirmationPassword;
                        console.log('Check data before create :', req.body);
                        let regis = await users.create(req.body);
                        console.log(regis);
                        res.status(201).send({
                            success: true,
                            data: regis
                        })
                    } else {
                        res.status(400).send({
                            success: false,
                            message: 'Password to short'
                        })
                    }
                } else {
                    res.status(400).send({
                        success: false,
                        message: 'Password not match'
                    })
                }
            } else {
                res.status(400).send({
                    success: false,
                    message: 'Email or Username exist ⚠️'
                })
            }
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    login: async (req, res, next) => {
        try {
            // 1. Mencocokkan data email dan password dari request ke database
            console.log("Data dari req :", req.body);

            let get = await users.findAll({
                where: sequelize.and(
                    { password: req.body.password },
                    sequelize.or({ email: req.body.email },
                        { phone: req.body.phone },
                        { username: req.body.username })
                ),
                attributes: { exclude: 'password' }
            });
            // WHERE password='body.password' AND (email='' OR phone='' OR username='');
            if (get.length > 0) {
                console.log("Check result get :", get[0].dataValues);
                // reset attempt
                await users.update({ attempt: 0, status:'unverified' }, {
                    where: {
                        id: get[0].dataValues.id
                    }
                })
                res.status(200).send(get[0].dataValues)
            } else {
                // 2. Jika data tidak ada, berarti password salah atau belum register
                let checkUser = await users.findAll({
                    attributes: ['id', 'attempt'],
                    where: sequelize.or({ email: req.body.email },
                        { phone: req.body.phone },
                        { username: req.body.username }),
                });

                if (checkUser.length > 0) {
                    // Increment attempt jika attempt < 3
                    if (checkUser[0].dataValues.attempt < 3) {
                        await users.update({ attempt: checkUser[0].dataValues.attempt + 1 }, {
                            where: {
                                id: checkUser[0].dataValues.id
                            }
                        });
                        res.status(400).send({
                            success: false,
                            message: `Wrong password ${checkUser[0].dataValues.attempt + 1}`
                        })
                    } else {
                        await users.update({ status: 'suspended' }, {
                            where: {
                                id: checkUser[0].dataValues.id
                            }
                        });
                        res.status(400).send({
                            success: false,
                            message: `Your account suspended`
                        })
                    }
                } else {
                    res.status(404).send({
                        success: false,
                        message: "Account not found"
                    })
                }
            }

        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}