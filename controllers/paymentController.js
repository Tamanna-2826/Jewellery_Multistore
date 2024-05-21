const { Cart, CartItem, User, Product } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  try {
    const { cart_id, currency } = req.body;
    const cart = await Cart.findOne({
      where: { cart_id },
      include: [
        {
          model: CartItem,
          as: 'cartItems',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const totalAmount = cart.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const customer = await User.findOne({ where: { user_id: cart.user_id } });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const origin = req.headers.origin || 'http://localhost:4000'; 

    const lineItems = cart.cartItems.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.product.product_name,
          images: item.product.p_images || [],
          description: item.product.main_description,
          metadata: {
            clasp_type: item.product.clasp_type,
            gem_type: item.product.gem_type,
            gem_color: item.product.gem_color,
            occasion_type: item.product.occasion_type,
            size: item.product.size,
            weight: item.product.weight,
            gold_type: item.product.gold_type,
            no_of_gems: item.product.no_of_gems,
            purity: item.product.purity,
          }
        },
        unit_amount: Math.round(item.price * 100), // Stripe requires amount in cents
      },
      quantity: item.quantity,
    }));

    if (lineItems.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      customer_email: customer.email,
      client_reference_id: customer.user_id.toString(),
      metadata: {
        customer_id: customer.user_id.toString(),
        cart_id: cart.cart_id.toString()
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCheckoutSession
};
