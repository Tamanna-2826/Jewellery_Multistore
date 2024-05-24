const express = require('express');
const router = express.Router();
const bodyparser = require('body-parser');

const paymentController = require('../controllers/paymentController');

router.post('/webhook', express.json({ type: "application/json" }), paymentController.handleStripeWebhook);
router.post('/create-checkout-session', paymentController.createCheckoutSession);
// router.post('/testwebhook', express.json({ type: "application/json" }), paymentController.testWebhook);



module.exports = router;