const { users } = require('../models');
const model = require('../models');
const sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const { createToken } = require('../helper/jwt');

let salt = bcrypt.genSaltSync(10);

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
                        req.body.password = bcrypt.hashSync(req.body.password, salt);
                        console.log('Check data after hash password :', req.body);
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
                where: sequelize.or({ email: req.body.email },
                    { phone: req.body.phone },
                    { username: req.body.username }),
                include: [{ model: model.status, attributes: ['status'] }]
            });
            // WHERE password='body.password' AND (email='' OR phone='' OR username='');
            if (get.length > 0) {
                // Pencocokan password
                let check = bcrypt.compareSync(req.body.password, get[0].dataValues.password);
                if (check) {
                    // reset attempt
                    await users.update({ attempt: 0, status: 'unverified' }, {
                        where: {
                            id: get[0].dataValues.id
                        }
                    });

                    console.log("Check result get :", get[0].dataValues);
                    get[0].dataValues.status = get[0].dataValues.status.status;
                    let { id, username, email, phone, gender, occupation, currency, role, status } = get[0].dataValues;
                    // GENERATE TOKEN
                    let token = createToken({ id, role, status });
                    res.status(200).send({ username, email, phone, gender, occupation, currency, role, status, token });
                } else {
                    // Increment attempt jika attempt < 3
                    if (get[0].dataValues.attempt < 3) {
                        await users.update({ attempt: get[0].dataValues.attempt + 1 }, {
                            where: {
                                id: get[0].dataValues.id
                            }
                        });
                        res.status(400).send({
                            success: false,
                            message: `Wrong password ${get[0].dataValues.attempt + 1}`
                        })
                    } else {
                        await users.update({ status: 'suspended' }, {
                            where: {
                                id: get[0].dataValues.id
                            }
                        });
                        res.status(400).send({
                            success: false,
                            message: `Your account suspended`
                        })
                    }
                }
            } else {
                // 2. Jika data tidak ada, berarti password salah atau belum register
                res.status(404).send({
                    success: false,
                    message: "Account not found"
                })
            }

        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    keepLogin: async (req, res, next) => {
        try {
            console.log("Decript token :", req.decript);
            let get = await users.findAll({
                where: {
                    id: req.decript.id
                },
                include: [{ model: model.status, attributes: ['status'] }]
            });
            get[0].dataValues.status = get[0].dataValues.status.status;
            let { id, username, email, phone,
                gender, occupation,
                currency, role, status } = get[0].dataValues;

            let token = createToken({ id, role, status });

            return res.status(200).send({
                username, email, phone, gender, occupation,
                currency, role, status, token
            })
        } catch (error) {
            next(error);
        }
    }
}