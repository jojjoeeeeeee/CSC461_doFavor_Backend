const generator = require('generate-password');
const nodemailer = require("nodemailer");

const generateOtpcode = () => {
    return generator.generate({
        length: 6,
        numbers: true,
        exclude: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    });
};

const mailer = (to,subject,html) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'dofavor.info@gmail.com',
          pass: 'Admin888'
        },
    });

    let mailOptions = {
        from: 'dofavor.info@gmail.comm',
        to: to,
        subject: `doFavor ${subject}`,
        html: html
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error.message);
        }
        console.log(`success send email`)
    });
};

exports.generateOtpcode = generateOtpcode;
exports.mailer = mailer;
