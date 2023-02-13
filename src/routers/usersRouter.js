const express = require('express');
const { register, login, keepLogin, verify } = require('../controllers/usersController');
const route = express.Router();
const { readToken } = require('../helper/jwt');
const { checkUser } = require('../helper/validator');

route.post('/regis', checkUser, register);
route.post('/auth', checkUser, login);
route.get('/keeplogin', readToken, keepLogin);
route.patch('/verify', readToken, verify);

module.exports = route;