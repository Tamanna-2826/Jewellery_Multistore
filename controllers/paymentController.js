const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {
  Order,
  OrderItem,
  Payment,
  Product,
  CartItem,
  Cart,
  Address,
  State,
  Vendor,
} = require("../models");

const generateOrderTrackingId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let trackingId = "";
  for (let i = 0; i < 3; i++) {
    trackingId += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  for (let i = 0; i < 9; i++) {
    trackingId += Math.floor(Math.random() * 10);
  }
  return trackingId;
};

const IGST_RATE = 3;

const createCheckoutSession = async (req, res) => {
  const { user_id } = req.body;

  try {
    const shippingAddress = await Address.findOne({
      where: {
        user_id,
        address_type: "shipping",
      },
      include: [
        {
          model: State,
          as: "state",
          attributes: ["state_name"],
        },
      ],
    });

    if (!shippingAddress) {
      throw new Error("Shipping address not found");
    }

    const cart = await Cart.findOne({
      where: { user_id },
      include: [
        {
          model: CartItem,
          as: "cartItems",
          attributes: ["product_id", "quantity", "price", "size"],
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["product_name", "selling_price", "p_images"],
            },
          ],
        },
      ],
    });

    const lineItems = cart.cartItems.map((item) => ({
      price_data: {
        currency: "INR",
        product_data: {
          name: item.product.product_name,
          images: item.product.p_images,
        },
        unit_amount: item.product.selling_price * 100,
      },
      quantity: item.quantity,
    }));

    const origin = req.headers.origin || "http://localhost:4000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&user_id=${user_id}`,
      cancel_url: `${origin}/cancel`,
      metadata: {
        order_id: generateOrderTrackingId(),
        user_id,
        address_id: shippingAddress.address_id,
      },
    });
    console.log("Order_id : ", session.metadata.order_id);

    res.status(200).send({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).send({ error: error.message });
  }
};

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    const rawBody = req.rawBody.toString();

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { user_id, order_id } = session.metadata;

    try {
      const shippingAddress = await Address.findOne({
        where: {
          user_id,
          address_type: "shipping",
        },
        include: [
          {
            model: State,
            as: "state",
            attributes: ["state_name"],
          },
        ],
      });

      if (!shippingAddress) {
        console.error("Shipping address not found");
        return res.status(400).send("Shipping address not found");
      }

      const userState = shippingAddress.state
        ? shippingAddress.state.state_name
        : null;

      let subtotal = 0;
      let cgst,
        sgst,
        igst = 0;

      const cart = await Cart.findOne({
        where: { user_id },
        include: [
          {
            model: CartItem,
            as: "cartItems",
            attributes: ["product_id", "quantity", "price", "size"],
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["product_name", "selling_price", "p_images"],
              },
            ],
          },
        ],
      });

      if (!cart || cart.cartItems.length === 0) {
        console.error("Cart is empty");
        return res.status(400).send("Cart is empty");
      }

      const cartItems = cart.cartItems;

      for (const item of cartItems) {
        const { product_id, size, quantity, price } = item;
        const sub_total_item = quantity * price;
        subtotal += sub_total_item;

        const product = await Product.findOne({
          where: { product_id },
          include: [
            {
              model: Vendor,
              as: "vendor",
              attributes: ["first_name", "email"],
              include: [
                {
                  model: State,
                  as: "state",
                  attributes: ["state_name"],
                },
              ],
            },
          ],
        });

        const product_temp = item.product || product;
        if (!product) {
          throw new Error("Product not found");
        }

        const vendorState = product.vendor.state
          ? product.vendor.state.state_name
          : null;

        if (userState === vendorState) {
          cgst = 1.5;
          sgst = 1.5;
          igst = 0;
        } else {
          cgst = 0;
          sgst = 0;
          igst = 3;
        }

        const productImage = product_temp.p_images[0];

        item.product_name = product_temp.product_name;
        item.product_image = productImage;

        const gstAmt = (sub_total_item * IGST_RATE) / 100;
        const total_price = sub_total_item + gstAmt;

        await OrderItem.create({
          order_id: session.metadata.order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price,
          cgst,
          sgst,
          igst,
          sub_total: sub_total_item,
          total_price,
          vendor_status:'order_received',
        });
      }

      const gstAmount = (subtotal * IGST_RATE) / 100;
      const total_amount = subtotal + gstAmount;

      const order = await Order.create({
        order_id,
        user_id,
        order_date: new Date(),
        cgst,
        sgst,
        igst,
        subtotal,
        total_amount,
        address_id: shippingAddress.address_id,
        status: "placed",
      });
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent
      );

      await Payment.create({
        order_id: order.order_id,
        currency: session.currency,
        payment_method_name: session.payment_method_types,
        amount: total_amount,
        payment_date: new Date(paymentIntent.created * 1000),
        status: session.status,
        transaction_id: paymentIntent.id,
      });

      await CartItem.destroy({
        where: { cart_id: cart.cart_id },
        force: false,
      });

      return res.status(200).json({ message: "Payment completed Successfully" });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

module.exports = {
  createCheckoutSession,
  handleStripeWebhook,
};
