const express = require('express');
const router = express.Router();
// const jwt = require('../jwt');

const AuthController = require('../controllers/AuthController');

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

router.post('/verify', AuthController.verify);
router.post('/verify/resend', AuthController.verifyResendCode);


module.exports = router;