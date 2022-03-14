const express = require('express');
const router = express.Router();
require('../db');


router.get('/test', (req,res) => {
    res.send("HELLOWORLD HEROKU")
})

router.get('/hi', (req,res) => {
    res.send("HIIII")
})
// router.use('/auth', require('../routes/auth'));

module.exports = router;
