const Users = require('../models/user_schema');
const bcrypt = require('bcryptjs');
const Files = require('../models/file_schema');
const Otps = require('../models/otp_schema');

const jwt = require('../jwt');
const moment = require('moment');

const { generateOtpcode, mailer } = require('../services/utilities');

const { loginValidation, registerValidation, verifyValidation } = require('../services/validation');

const gswu_regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@g.swu.ac.th$/

exports.register = async (req,res) => {
    const { error } = registerValidation(req.body);
    if (error) return res.status(200).json({result: 'nOK', message: error.details[0].message, data: {}});

    if (!gswu_regex.test(req.body.email)) return res.status(200).json({result: 'nOK', message: 'Please use g.swu.ac.th email domain', data: {}});

    const usernameExist = await Users.findOne({username: req.body.username});
    if (usernameExist) return res.status(200).json({result: 'nOK', message: 'Username already exists', data: {}});

    const emailExist = await Users.findOne({email: req.body.email});
    if (emailExist) return res.status(200).json({result: 'nOK', message: 'Email already exists', data: {}});

    try {
        req.body.password = await bcrypt.hash(req.body.password, 8);
        req.body.state = 'none'

        if (req.body.profile_pic === '') {
            req.body.profile_pic = '6233b48434353cf2996e71eb' //Default image
        }

        const data = await Users.create(req.body);
        const userSchema = {
            username: data.username,
            email: data.email,
            profile_pic: '',
            name: data.name,
            state: data.state,
            device_id: data.device_id
            //if device_id ไม่ตรงกับใน db ตอน request ให้ขึ้น session expire แล้ว logout
        }

        const profile_pic = await Files.findById(data.profile_pic);
        userSchema.profile_pic = profile_pic.file_path

        const minutesToAdd = 15;
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + minutesToAdd*60000);

        const OTP_Schema = {
            email: data.email,
            otp: generateOtpcode(),
            expired: futureDate,
        }

        await Otps.create(OTP_Schema);

        // mailer(data.email,'Verify your account',`คุณ, ${data.name.firstname} ${data.name.lastname} <br><br>username : ${data.username} <br><br>รหัสยืนยันการสมัครสมาชิก :  ${OTP_Schema.otp}`)

        res.status(200).json({result: 'OK', message: 'success create account please verify account by email in 15 minutes', data: userSchema});
    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }
};

exports.verify = async (req,res) => {
    const { error } = verifyValidation(req.body);
    if (error) return res.status(200).json({result: 'nOK', message: error.details[0].message, data: {}});

    try {
        const { email, otp, device_id } = req.body;

        const data = await Otps.findOne({email: email});
        if(!data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const user_data = await Users.findOne({email: email});
        if(!user_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const userSchema = {
            username: user_data.username,
            email: user_data.email,
            profile_pic: '',
            name: user_data.name,
            state: user_data.state,
            device_id: device_id
        }

        if(otp !== data.otp) return res.status(200).json({result: 'nOK', message: 'otp code not the same', data: {}});

        if(moment().isAfter(data.expired)) {
            const minutesToAdd = 15;
            const currentDate = new Date();
            const futureDate = new Date(currentDate.getTime() + minutesToAdd*60000);

            const OTP_Schema = {
                email: user_data.email,
                otp: generateOtpcode(),
                expired: futureDate,
            }

            await Otps.findOneAndUpdate({email: user_data.email}, OTP_Schema);

            // mailer(user_data.email,'Verify your account',`คุณ, ${user_data.name.firstname} ${user_data.name.lastname} <br><br>username : ${user_data.username} <br><br>รหัสยืนยันการสมัครสมาชิก : ${OTP_Schema.otp}`)
            return res.status(200).json({ result: 'nOK', message: 'please verify account by email in 15 minutes', data: userSchema})
        }

        user_data.state = 'verify'
        userSchema.state = user_data.state

        const profile_pic = await Files.findById(user_data.profile_pic);
        userSchema.profile_pic = profile_pic.file_path

        await Users.findByIdAndUpdate(user_data._id, user_data);
        await Otps.findByIdAndDelete(data._id);

        const payload = {
            id: user_data._id,
            device_id: device_id
        };

        const token = jwt.sign(payload);

        res.status(200).header('Authorization', `Bearer ${token}`).json({ result: 'OK', message: 'success sign in', data: userSchema });

    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }

};

exports.verifyResendCode = async (req,res) => {
    const { error } = verifyValidation(req.body);
    if (error) return res.status(200).json({result: 'nOK', message: error.details[0].message, data: {}});

    try {
        const { email } = req.body;

        const data = await Otps.findOne({email: email});
        if(!data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const user_data = await Users.findOne({email: email});
        if(!user_data) return res.status(404).json({result: 'Not found', message: '', data: {}});

        const userSchema = {
            username: user_data.username,
            email: user_data.email,
            profile_pic: '',
            name: user_data.name,
            state: user_data.state,
            device_id: user_data.device_id
        }

        const minutesToAdd = 15;
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + minutesToAdd*60000);

        const OTP_Schema = {
            email: user_data.email,
            otp: generateOtpcode(),
            expired: futureDate,
        }

        await Otps.findOneAndUpdate({email: user_data.email}, OTP_Schema);

        // mailer(user_data.email,'Verify your account',`คุณ, ${user_data.name.firstname} ${user_data.name.lastname} <br><br>username : ${user_data.username} <br><br>รหัสยืนยันการสมัครสมาชิก : ${OTP_Schema.otp}`)
        res.status(200).json({ result: 'nOK', message: 'please verify account by email in 15 minutes', data: userSchema})

    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }
};

exports.login = async (req,res) => {
    const { error } = loginValidation(req.body);
    if (error) return res.status(200).json({result: 'nOK', message: error.details[0].message, data: {}});

    try {
        const { username, password, device_id } = req.body;

        const data = await Users.findOne(({$or: [
            {username: username},
            {email: username}
        ]}));
      
        if (data) {
            const isPasswordValid = await bcrypt.compare(password, data.password);
            if (isPasswordValid) {

                const userSchema = {
                    username: data.username,
                    email: data.email,
                    profile_pic: '',
                    name: data.name,
                    state: data.state,
                    device_id: data.device_id
                    //if device_id ไม่ตรงกับใน db ตอน request ให้ขึ้น session expire แล้ว logout
                }

                const profile_pic = await Files.findById(data.profile_pic);
                userSchema.profile_pic = profile_pic.file_path

                if (data.state === 'none') {
                    //send verify email
                    const minutesToAdd = 15;
                    const currentDate = new Date();
                    const futureDate = new Date(currentDate.getTime() + minutesToAdd*60000);
        
                    const OTP_Schema = {
                        email: data.email,
                        otp: generateOtpcode(),
                        expired: futureDate,
                    }

                    await Otps.findOneAndUpdate({email: data.email}, OTP_Schema);

                    // mailer(data.email,'Verify your account',`คุณ, ${data.name.firstname} ${data.name.lastname} <br><br>username : ${data.username} <br><br>รหัสยืนยันการสมัครสมาชิก : ${OTP_Schema.otp}`)
                    return res.status(200).json({ result: 'nOK', message: 'please verify account by email in 15 minutes', data: userSchema})
                }
                else if (data.state === 'ban') return res.status(200).json({ result: 'nOK', message: 'banned account', data: userSchema});

                if (device_id !== data.device_id) {
                    data.device_id = device_id
                    await Users.findByIdAndUpdate(data._id, data);
                }

                const payload = {
                    id: data._id,
                    device_id: data.device_id
                };

                const token = jwt.sign(payload);

                res.status(200).header('Authorization', `Bearer ${token}`).json({ result: 'OK', message: 'success sign in', data: userSchema });
            } else {
                res.status(200).json({ result: 'nOK', message: 'invalid username or password', data: {}});
            }
        } else {
            res.status(200).json({ result: 'nOK', message: 'invalid username or password', data: {}});
        }
    } catch (e) {
        res.status(500).json({result: 'Internal Server Error', message: '', data: {}});
    }
};