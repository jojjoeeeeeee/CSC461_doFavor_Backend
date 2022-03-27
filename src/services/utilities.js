const generator = require('generate-password');
const nodemailer = require('nodemailer');

const NodeCache = require('node-cache')
const Landmarks = require('../models/landmark_schema')
const Types = require('../models/type_schema')

const locationCache = new NodeCache({ stdTTL: 604800 }) //7วัน

const getLocation = async () => {

    if (locationCache.has('location')) {
        return locationCache.get('location')
    }

    try {
        const data = await Landmarks.find()
        locationCache.set('location', data)
        return data
    } catch (e) {
        return '500'
    }

}

const getTypes = async () => {

    if (locationCache.has('category')) {
        return locationCache.get('category')
    }

    try {
        const data = await Types.find()
        locationCache.set('category', data)
        return data
    } catch (e) {
        return '500'
    }

}

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

exports.getLocation = getLocation;
exports.getTypes = getTypes;