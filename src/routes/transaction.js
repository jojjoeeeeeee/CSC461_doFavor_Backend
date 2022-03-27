const express = require('express');
const router = express.Router();
const jwt = require('../jwt');
const dvVerify = require('../device_verify');

const TransactionController = require('../controllers/TranscationController');

router.get('/data', jwt.verify, dvVerify.verify, TransactionController.getFormData);

router.post('/create', jwt.verify, dvVerify.verify, TransactionController.create);
router.post('/get', jwt.verify, dvVerify.verify, TransactionController.get);
router.post('/get/all', jwt.verify, dvVerify.verify, TransactionController.getAll);

router.patch('/accept', jwt.verify, dvVerify.verify, TransactionController.accept);
router.patch('/cancel/petitioner', jwt.verify, dvVerify.verify, TransactionController.petitionerCancel);
router.patch('/cancel/applicant', jwt.verify, dvVerify.verify, TransactionController.applicantCancel);

router.post('/history', jwt.verify, dvVerify.verify, TransactionController.getHistory);

module.exports = router;