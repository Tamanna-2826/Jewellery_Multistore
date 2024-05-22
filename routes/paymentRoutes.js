const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const paymentController = require('../controllers/paymentController');

router.use(bodyParser.raw({ type: 'application/json', verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));

router.post('/webhook', paymentController.handleStripeWebhook);
router.post('/create-checkout-session', paymentController.createCheckoutSession);


module.exports = router;