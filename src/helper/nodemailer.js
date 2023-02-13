const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'leadwear01@gmail.com',
        pass:'ajeucmuwgikbjcri'
    }
});

module.exports = transporter;