const express = require('express');
const router = express.Router();

const FileController = require('../controllers/FileController');


router.post('/upload', FileController.upload);
router.post('/upload/img', FileController.uploadImage);

router.get('/download/:file_id', FileController.download);


module.exports = router;