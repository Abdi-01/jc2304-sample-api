const express = require('express');
const { register, login, keepLogin } = require('../controllers/usersController');
const route = express.Router();
const { readToken } = require('../helper/jwt');

route.post('/regis', register);
route.post('/auth', login);
route.get('/keeplogin', readToken, keepLogin);

module.exports = route;