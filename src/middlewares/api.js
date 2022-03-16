const express = require('express');
const router = express.Router();
require('../db');

router.use('/auth', require('../routes/auth'));
router.use('/file', require('../routes/file'));

module.exports = router;
