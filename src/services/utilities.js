const generator = require('generate-password');

const generateOtpcode = () => {
    return generator.generate({
        length: 6,
        numbers: true,
        exclude: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    });
}
exports.generateOtpcode = generateOtpcode;
