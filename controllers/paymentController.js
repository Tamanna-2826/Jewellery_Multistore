// const stripe = require("../config/stripe");
// const cloudinaryBaseUrl =
//   "https://res.cloudinary.com/dyjgvi4ma/image/upload/t_fixed_scale/";

// const createCheckoutSession = async (req, res) => {
//   const { cart_items, currency, user_id } = req.body;

//   try {
//     // const totalAmount = parseFloat(cart_items[0].total);
//     // const amountInPaise = Math.round(totalAmount * 100);

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: cart_items.map((item) => ({
//         price_data: {
//           currency,
//           product_data: {
//             name: item.product.product_name,
//             images: `[${cloudinaryBaseUrl}${item.product.p_images[0]}]`,
//           },
//           unit_amount: parseFloat(item.subTotal) * 100,
//         },
//         quantity: item.quantity,
//       })),
//       mode: "payment",
//       success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}&user_id=${user_id}`,
//       cancel_url: `${req.headers.origin}/cancel`,
//     });

//     res.status(200).json({ id: session.id });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = {
//   createCheckoutSession,
// };

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
  City,
} = require("../models");
const Sequelize = require("sequelize");
const sequelizeConfig = require("../config/config.js");

const sequelize = new Sequelize(sequelizeConfig.development);

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

const CGST_RATE = 1.5; // 9%
const SGST_RATE = 1.5; // 9%
const IGST_RATE = 3; // 18%

const createCheckoutSession = async (req, res) => {
  const { metadata } = req.body;
  const { user_id } = req.body;
  // const { user_id } = req.decodedToken;

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
          images: item.product.p_images, // Include product images
        },
        unit_amount: item.product.selling_price * 100,
      },
      quantity: item.quantity,
    }));

    const origin = req.headers.origin || "http://localhost:4000"; // Default to localhost if origin is undefined

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&user_id=${user_id}`,
      cancel_url: `${origin}/cancel`,
      metadata: {
        order_id: generateOrderTrackingId(), // Generate unique order_id
        user_id,
        // shipping_charges: 0,
        // coupon_id: metadata.coupon_id,
        // discount_value: metadata.discount_value,
        // discounted_amount: metadata.discounted_amount,
        address_id: shippingAddress.address_id,
      },
    });
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
    console.log("Request Headers:", req.headers);
    console.log("Stripe-Signature Header:", req.headers["stripe-signature"]);
    console.log("Stripe-Signature-Version Header:",req.headers["stripe-signature-version"]
    );
    console.log("Body : ", req.body);

    if (!req.body) {
      console.error("Request body is undefined or empty");
    } else {
      const bodyString = JSON.stringify(req.body);
      console.log("Body Length:", bodyString.length);
      // console.log("Body (first 100 characters):", bodyString.slice(0, 100));
    }
    console.log("Raw Request Body:", req.rawBody); // Add this line

    event = stripe.webhooks.constructEvent(
      JSON.stringify(req.body),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("EVENT : ", event);
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Session metadata:", session.metadata); // Log session metadata
    const user_id = session.metadata.user_id;

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
      console.log("Shipping address:", shippingAddress); // Log shipping address

      if (!shippingAddress) {
        console.error("Shipping address not found");
        return res.status(400).send("Shipping address not found");
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
      console.log("Cart:", cart); // Log cart

      if (!cart || cart.cartItems.length === 0) {
        console.error("Cart is empty");
        return res.status(400).send("Cart is empty");
      }

      const cartItems = cart.cartItems;

      // Calculate GST and other amounts
      const totalAmount = session.amount_total / 100;
      const gstAmount = totalAmount * IGST_RATE;
      const subTotal = totalAmount - gstAmount;

      const order = await Order.create({
        order_id: generateOrderTrackingId(),
        user_id,
        order_date: new Date(),
        cgst: gstAmount / 2,
        sgst: gstAmount / 2,
        igst: gstAmount,
        subtotal: subTotal,
        // shipping_charges: session.metadata.shipping_charges,
        // coupon_id: session.metadata.coupon_id,
        // discount_value: session.metadata.discount_value,
        // discounted_amount: session.metadata.discounted_amount,
        total_amount: totalAmount,
        address_id: shippingAddress.address_id,
        status: "placed",
      });
      console.log("Order created:", order); // Log order creation

      for (const cartItem of cartItems) {
        const itemTotal = cartItem.price * cartItem.quantity;
        const itemGST = itemTotal * IGST_RATE;
        const itemSubTotal = itemTotal - itemGST;

        await OrderItem.create({
          order_id: order.order_id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          unit_price: cartItem.price,
          cgst: itemGST / 2,
          sgst: itemGST / 2,
          igst: itemGST,
          sub_total: itemSubTotal,
          total_price: itemTotal,
          product_name: cartItem.product.product_name,
          product_image: cartItem.product.p_images[0],
        });
      }
      console.log("Order items created"); // Log order items creation

      await Payment.create({
        order_id: order.order_id,
        amount: totalAmount,
        currency: session.currency,
        status: session.payment_status,
        paymentMethod: "stripe",
      });
      console.log("Payment record created"); // Log payment creation

      await CartItem.destroy({
        where: { cart_id: cart.cart_id },
        force: false,
      });
      console.log("Cart cleared"); // Log cart clearance
    } catch (error) {
      console.error("Error processing webhook:", error);
      return res.status(500).send("Internal Server Error");
    }
  }

  res.json({ received: true });
};

module.exports = {
  createCheckoutSession,
  handleStripeWebhook,
};
