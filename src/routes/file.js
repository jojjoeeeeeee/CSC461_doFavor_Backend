const express = require('express');
const router = express.Router();
const jwt = require('../jwt');
const dvVerify = require('../device_verify');

const FileController = require('../controllers/FileController');


router.post('/upload', jwt.verify, dvVerify.verify ,FileController.upload);
router.post('/upload/img', jwt.verify, dvVerify.verify ,FileController.uploadImage);

router.get('/download/:file_id', FileController.download);


module.exports = router;