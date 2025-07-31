const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Define routes
router.post('/make', paymentController.payment);
// router.get('/status/:id', paymentController.getPaymentStatus);

module.exports = router;