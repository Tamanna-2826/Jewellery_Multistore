const stripe = require('../config/stripe');
const { Payment } = require('../models'); 

const createPaymentIntent = async (req, res) => {
  const { amount, currency, order_id, payment_method_name } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency,
      payment_method_types: [payment_method_name],
      metadata: { order_id },
    });

    const payment = await Payment.create({
      order_id,
      payment_method_name,
      amount,
      payment_date: new Date(),
      status: 'pending',
      payment_intent_id: paymentIntent.id
    });

    res.status(200).json({ client_secret: paymentIntent.client_secret, payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const confirmPayment = async (req, res) => {
  const { payment_intent_id } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status === 'succeeded') {
      await Payment.update(
        { status: 'completed', transaction_id: paymentIntent.charges.data[0].id },
        { where: { payment_intent_id } }
      );

      res.status(200).json({ message: 'Payment successful' });
    } else {
      res.status(400).json({ message: 'Payment not successful' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment
};
