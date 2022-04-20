const express = require('express');
const router = express.Router();
const jwt = require('../jwt');
const dvVerify = require('../device_verify');

const TransactionController = require('../controllers/TransactionController');

router.get('/data', jwt.verify, dvVerify.verify, TransactionController.getFormData);

router.post('/create', jwt.verify, dvVerify.verify, TransactionController.create);
router.post('/get/petitioner', jwt.verify, dvVerify.verify, TransactionController.petitionerGet);
router.post('/get/applicant', jwt.verify, dvVerify.verify, TransactionController.applicantGet)
router.get('/get/all', jwt.verify, dvVerify.verify, TransactionController.getAll);

router.patch('/accept', jwt.verify, dvVerify.verify, TransactionController.accept);
router.patch('/cancel/petitioner', jwt.verify, dvVerify.verify, TransactionController.petitionerCancel);
router.patch('/cancel/applicant', jwt.verify, dvVerify.verify, TransactionController.applicantCancel);
router.patch('/success', jwt.verify, dvVerify.verify, TransactionController.success);

router.get('/history', jwt.verify, dvVerify.verify, TransactionController.getHistory);
router.post('/report', jwt.verify, dvVerify.verify, TransactionController.report);

module.exports = router;