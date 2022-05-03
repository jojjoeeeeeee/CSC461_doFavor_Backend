const express = require('express');
const router = express.Router();
const jwt = require('../jwt');
const dvVerify = require('../device_verify');

// const jwt = require('../jwt');

const UserController = require('../controllers/UserController');

router.post('/report', UserController.report);

module.exports = router;