const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-checkout-session', paymentController.createCheckoutSession);

// Route to handle Stripe webhook events
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);

module.exports = router;
