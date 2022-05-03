const express = require('express');
const router = express.Router();
require('../db');

router.use('/auth', require('../routes/auth'));
router.use('/file', require('../routes/file'));
router.use('/transaction', require('../routes/transaction'));
router.use('/user', require('../routes/user'));

module.exports = router;
