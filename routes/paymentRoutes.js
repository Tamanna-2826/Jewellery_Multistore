const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');

router.post('/webhook', express.json({ type: "application/json" }), paymentController.handleStripeWebhook);
router.post('/create-checkout-session', paymentController.createCheckoutSession);

module.exports = router;