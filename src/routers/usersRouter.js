const express = require('express');
const { register, login, keepLogin, verify, updateProfile } = require('../controllers/usersController');
const route = express.Router();
const { readToken } = require('../helper/jwt');
const { checkUser } = require('../helper/validator');
const uploader = require('../helper/uploader');

route.post('/regis', checkUser, register);
route.post('/auth', checkUser, login);
route.get('/keeplogin', readToken, keepLogin);
route.patch('/verify', readToken, verify);
route.patch('/profile',
    uploader('/imgProfile', 'PRF').array('images', 1),
    updateProfile);

module.exports = route;