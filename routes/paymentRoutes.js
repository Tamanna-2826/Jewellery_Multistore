const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');


const paymentController = require('../controllers/paymentController');
// 
router.post('/webhook', bodyParser.raw({type: 'application/json'}), paymentController.handleStripeWebhook);
router.post('/create-checkout-session', paymentController.createCheckoutSession);


module.exports = router;