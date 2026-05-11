const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment, getPaymentMethods } = require('../controllers/paymentController');
const { optionalAuth } = require('../middleware/auth');

router.get('/methods', getPaymentMethods);
router.post('/initiate', optionalAuth, initiatePayment);
router.get('/verify/:transactionId', verifyPayment);

module.exports = router;
