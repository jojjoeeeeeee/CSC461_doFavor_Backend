const express = require('express');
const router = express.Router();
require('../db');


router.get('/', (req,res) => {
    res.send("HELLOWORLD HEROKU")
})
// router.use('/auth', require('../routes/auth'));

module.exports = router;
