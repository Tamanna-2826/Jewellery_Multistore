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
  Coupon,
} = require("../models");
const { sendEmail } = require("../helpers/emailHelper");

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
        // unit_amount: item.product.selling_price * 100,
        unit_amount: Math.round(item.product.selling_price * 1.03 * 100), // Adding 3% GST
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
        coupon_code: coupon_code || null, // Include coupon code in metadata
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
    const { user_id, order_id, coupon_code } = session.metadata;

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
          {
            model: City,
            as: "city",
            attributes: ["city_name"],
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

      const coupon = await Coupon.findOne({
        where: { code: coupon_code },
        include: [
          {
            model: Vendor,
            as: "vendor",
            attributes: ["vendor_id"],
          },
        ],
      });

      let discountValue = 0;
      let discountedAmount = 0;
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
          vendor_status: 1,
          order_received: new Date(),
        });
      }

      if (coupon) {
        if (coupon.maximum_uses && coupon.maximum_uses <= 0) {
          console.error("Coupon has reached the maximum allowed uses");
          return res
            .status(400)
            .send("Coupon has reached the maximum allowed uses");
        }

        if (coupon.discount_type === "percentage") {
          discountValue = (subtotal * coupon.discount_value) / 100;
        } else {
          discountValue = coupon.discount_value;
        }

        discountedAmount = subtotal - discountValue;

        if (coupon.maximum_uses) {
          coupon.maximum_uses--;
          await coupon.save();
        }
      } else {
        discountedAmount = subtotal;
      }

      const gstAmount = (discountedAmount * IGST_RATE) / 100;
      const total_amount = (discountedAmount + gstAmount).toFixed(2);

      const order = await Order.create({
        order_id,
        user_id,
        order_date: new Date(),
        subtotal,
        coupon_id: coupon ? coupon.coupon_id : null,
        discount_value: discountValue,
        discounted_amount: discountedAmount,
        total_amount,
        address_id: shippingAddress.address_id,
        status: 1,
        order_placed: new Date(),
      });

      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent
      );

      await Payment.create({
        order_id: order.order_id,
        currency: session.currency,
        payment_method_name: "card",
        amount: total_amount,
        payment_date: new Date(paymentIntent.created * 1000),
        status: session.status,
        transaction_id: paymentIntent.id,
      });

      await CartItem.destroy({
        where: { cart_id: cart.cart_id },
        force: false,
      });

      // Send emails to customer and vendors
      const customerDetails = await User.findByPk(user_id);

      const customerHtmlContent = `
      <html>
          <head>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      padding: 10px;
                      width: 100%;
                      height: 100vh;
                      display: flex;
                  }
                  .container {
                      max-width: 600px;
                      padding: 10px;
                      border-radius: 10px;
                      background-color: #f5f5f5;
                  }
                  .header {
                      color: black;
                      padding: 10px;
                  }
                  h1 {
                      text-align: center;
                  }
                  .content {
                      padding: 20px;
                  }
                  .footer {
                      color: black;
                      text-align: center;
                      padding: 10px;
                      background-color: #d7d3d3;
                      border-radius: 3px;
                  }
              </style>
          </head>
          <body>
          <div class="container">
            <div class="header">
             <h2><img src="https://res.cloudinary.com/dyjgvi4ma/image/upload/dgg9v84gtpn3drrp8qce" height="300px" width="350px"></h2>  
              <h1>Order Request Received ! </h1>
              Dear ${customerDetails.first_name} ${customerDetails.last_name},<br><br>
              Thank you for your order on Nishkar! We're excited to process your purchase and have it delivered to you soon.<br><br>
              Your order has been received with the following details:<br>
              Order ID: ${order.order_id} <br>
              Order Date: ${order.order_date}<br>
              Total Amount: ${total_amount}<br>
              Your order will be processed as soon as possible. You will receive a order confirmation email once your order has been confirmed.
               <br><br>
              Thank you for choosing Nishkar! <br><br>
              Best regards,<br>
               The Nishkar Team
              </div>
              <div class="footer">
                  <p>If you have any questions, please contact our support team at projectsarvadhi@gmail.com</p>
              </div>
              </div>
            </body>
          </html>
      `;
      sendEmail(
        customerDetails.email,
        "Order Request Received",
        customerHtmlContent
      );

      for (const item of cartItems) {
        const product = await Product.findOne({
          where: { product_id: item.product_id },
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

        const vendorHtmlContent = `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 10px;
                        width: 100%;
                        height: 100vh;
                        display: flex;
                    }
                    .container {
                        max-width: 600px;
                        padding: 10px;
                        border-radius: 10px;
                        background-color: #f5f5f5;
                    }
                    .header {
                        color: black;
                        padding: 10px;
                    }
                    h1 {
                        text-align: center;
                    }
                    .content {
                        padding: 20px;
                    }
                    .footer {
                        color: black;
                        text-align: center;
                        padding: 10px;
                        background-color: #d7d3d3;
                        border-radius: 3px;
                    }
                </style>
            </head>
            <body>
            <div class="container">
              <div class="header">
               <h2><img src="https://res.cloudinary.com/dyjgvi4ma/image/upload/dgg9v84gtpn3drrp8qce" height="300px" width="350px"></h2>  
                <h1>New Order Received</h1>
                Dear ${product.vendor.first_name},<br><br>
                Congratulations! You have received a new order on Nishkar.<br>
                Here are the details:<br>
                Customer Name: ${customerDetails.first_name} ${customerDetails.last_name}<br>
                Email: ${customerDetails.email}<br>
                Phone: ${customerDetails.phone_no}<br>
                Product name : ${product.product_name}<br> <br>
                We wish you great success with this new order! <br><br>
                Best regards,<br>
                The Nishkar Team
                </div>
                <div class="footer">
                    <p>If you have any questions, please contact our support team at projectsarvadhi@gmail.com</p>
                </div>
                </div>
              </body>
            </html>
        `;
        sendEmail(
          product.vendor.email,
          "New Order received",
          vendorHtmlContent
        );
      }
      return res
        .status(200)
        .json({ message: "Payment completed Successfully" });
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
