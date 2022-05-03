const express = require('express');
const router = express.Router();
const jwt = require('../jwt');
const dvVerify = require('../device_verify');

const UserController = require('../controllers/UserController');

router.post('/report', jwt.verify, dvVerify.verify, UserController.report);

module.exports = router;