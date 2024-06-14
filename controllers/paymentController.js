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
  Vendor,
  User,
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

const createCheckoutSession = async (req, res) => {
  const { user_id, coupon_id } = req.body;

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
              attributes: [
                "product_name",
                "selling_price",
                "p_images",
                "vendor_id",
              ],
            },
          ],
        },
      ],
    });

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      return res.status(400).send({ error: "Cart is empty" });
    }

    let subtotal = 0;
    let vendorTotals = {};

    cart.cartItems.forEach((item) => {
      const itemTotal = item.quantity * item.product.selling_price;
      subtotal += itemTotal;

      if (!vendorTotals[item.product.vendor_id]) {
        vendorTotals[item.product.vendor_id] = 0;
      }
      vendorTotals[item.product.vendor_id] += itemTotal;
    });

    let discountValue = 0;
    let discountedAmount = subtotal;
    let appliedCoupon = null;

    if (coupon_id) {
      try {
        const coupon = await Coupon.findOne({
          where: {
            coupon_id,
          },
          include: [{ model: Vendor, as: "vendor", attributes: ["vendor_id"] }],
        });
        if (coupon) {
          const vendorSubtotal = vendorTotals[coupon.vendor.vendor_id] || 0;
          const applicableAmount =
            coupon.minimum_amount !== null
              ? Math.min(vendorSubtotal, subtotal)
              : subtotal;
          if (
            !coupon.minimum_amount ||
            applicableAmount >= coupon.minimum_amount
          ) {
            discountValue =
              coupon.discount_type === "percentage"
                ? (applicableAmount * coupon.discount_value) / 100
                : Math.min(coupon.discount_value, applicableAmount);
            discountedAmount = Math.max(0, subtotal - discountValue);
            appliedCoupon = coupon;
          } else {
            return res.status(400).send({
              error: `Minimum order amount of ${coupon.minimum_amount} is required to use this coupon.`,
            });
          }
        } else {
          return res
            .status(400)
            .send({ error: "Invalid or expired coupon code." });
        }
      } catch (couponError) {
        console.error("Error validating coupon:", couponError);
        return res.status(500).send({ error: "Error validating coupon." });
      }
    }

    // Apply GST to the discounted amount
    const gstAmount = discountedAmount * 0.03;
    const totalPayable = discountedAmount + gstAmount;

    const lineItems = cart.cartItems.map((item) => {
      const itemTotal = item.quantity * item.product.selling_price;
      const itemDiscount =
        appliedCoupon &&
        appliedCoupon.vendor.vendor_id === item.product.vendor_id
          ? appliedCoupon.discount_type === "percentage"
            ? (itemTotal * appliedCoupon.discount_value) / 100
            : Math.min(appliedCoupon.discount_value, itemTotal) /
              cart.cartItems.length
          : 0;

      const discountedItemTotal = Math.max(0, itemTotal - itemDiscount);
      const gstIncludedPrice =
        Math.round(discountedItemTotal * 1.03 * 100) / item.quantity;

      return {
        price_data: {
          currency: "INR",
          product_data: {
            name: item.product.product_name,
            images: item.product.p_images,
          },
          unit_amount: Math.round(gstIncludedPrice),
        },
        quantity: item.quantity,
      };
    });

    const origin = req.headers.origin || "http://localhost:4000";

    const sessionData = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&user_id=${user_id}`,
      cancel_url: `${origin}/cancel`,
      metadata: {
        order_id: generateOrderTrackingId(),
        user_id,
        subtotal: subtotal.toFixed(2),
        discount_value: discountValue.toFixed(2),
        discounted_amount: discountedAmount,
        gst_amount: gstAmount.toFixed(2),
        total_payable: totalPayable.toFixed(2),
      },
    };

    if (appliedCoupon) {
      sessionData.metadata.coupon_code = appliedCoupon.code;

      await Coupon.update(
        { maximum_uses: appliedCoupon.maximum_uses - 1 },
        { where: { coupon_id: appliedCoupon.coupon_id } }
      );
    }

    const session = await stripe.checkout.sessions.create(sessionData);

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
    const {
      user_id,
      order_id,
      coupon_id,
      subtotal: rawSubtotal,
      discount_value: rawDiscountValue,
      discounted_amount: rawDiscountedAmount,
      gst_amount: rawGstAmount,
      total_payable: rawTotalPayable,
    } = session.metadata;

    try {
      const subtotal = parseFloat(rawSubtotal) || 0;
      const discountValue = parseFloat(rawDiscountValue) || 0;
      const discountedAmount = parseFloat(rawDiscountedAmount) || subtotal;
      const gstAmount = parseFloat(rawGstAmount) || 0;
      const totalPayable =
        parseFloat(rawTotalPayable) || discountedAmount + gstAmount;

      const shippingAddress = await Address.findOne({
        where: { user_id, address_type: "shipping" },
        include: [
          { model: State, as: "state", attributes: ["state_name"] },
          { model: City, as: "city", attributes: ["city_name"] },
        ],
      });

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
                attributes: [
                  "product_name",
                  "selling_price",
                  "p_images",
                  "vendor_id",
                ],
              },
            ],
          },
        ],
      });

      if (!cart || cart.cartItems.length === 0) {
        console.error("Cart is empty");
        return res.status(400).send("Cart is empty");
      }

      let coupon = null;
      if (coupon_id) {
        coupon = await Coupon.findOne({
          where: { coupon_id },
          include: [{ model: Vendor, as: "vendor", attributes: ["vendor_id"] }],
        });

        if (coupon && coupon.maximum_uses !== null) {
          coupon.maximum_uses = Math.max(0, coupon.maximum_uses - 1);
          await coupon.save();
        }
      }

      for (const item of cart.cartItems) {
        const { product_id, quantity, price } = item;
        const itemTotal = quantity * price;

        const product = await Product.findOne({
          where: { product_id },
          include: [
            {
              model: Vendor,
              as: "vendor",
              attributes: ["first_name", "email", "vendor_id"],
              include: [
                { model: State, as: "state", attributes: ["state_name"] },
              ],
            },
          ],
        });

        if (!product) {
          console.error(`Product not found: ${product_id}`);
          continue;
        }

        const userState = shippingAddress.state
          ? shippingAddress.state.state_name
          : null;
        const vendorState = product.vendor.state
          ? product.vendor.state.state_name
          : null;

        let cgst = 0,
          sgst = 0,
          igst = 0;
        if (userState === vendorState) {
          cgst = 1.5;
          sgst = 1.5;
        } else {
          igst = 3;
        }

        const itemDiscount =
          coupon && coupon.vendor.vendor_id === product.vendor_id
            ? coupon.discount_type === "percentage"
              ? (itemTotal * coupon.discount_value) / 100
              : Math.min(coupon.discount_value, itemTotal) /
                cart.cartItems.length
            : 0;

        const discountedItemTotal = Math.max(0, itemTotal - itemDiscount);
        const gstAmt = discountedItemTotal * 0.03;
        const total_price = (discountedItemTotal + gstAmt).toFixed(2);

        await OrderItem.create({
          order_id: session.metadata.order_id,
          product_id: product_id,
          quantity: quantity,
          unit_price: price,
          cgst,
          sgst,
          igst,
          sub_total: itemTotal,
          discount: itemDiscount,
          discounted_sub_total: discountedItemTotal,
          gst_amount: gstAmt,
          total_price,
          vendor_status: 1,
          order_received: new Date(),
        });
      }

      const order = await Order.create({
        order_id,
        user_id,
        order_date: new Date(),
        subtotal,
        coupon_id: coupon ? coupon.coupon_id : null,
        discount_value: discountValue,
        discounted_amount: discountedAmount,
        gst_amount: gstAmount,
        total_amount: totalPayable,
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
        amount: totalPayable,
        payment_date: new Date(paymentIntent.created * 1000),
        status: session.status,
        transaction_id: paymentIntent.id,
      });

      await CartItem.destroy({
        where: { cart_id: cart.cart_id },
        force: false,
      });

      const customerDetails = await User.findByPk(user_id);
      const orderDate = new Date(order.order_date);
      const formattedOrderDate = `${orderDate.toLocaleDateString("en-US", {
        weekday: "long",
      })}, ${orderDate.toLocaleDateString("en-US", {
        month: "long",
      })} ${orderDate.getDate()}, ${orderDate.getFullYear()}`;

      const customerHtmlContent = `
      <html>
      <head>
      <style>
      body {
            font-family: Arial, sans-serif;
            padding: 0;
            margin: 0;
            background-color: #f2e9e9;
           }
        
        .container {
            max-width: 600px;
            padding: 20px;
            margin: 40px auto;
            border-radius: 10px;
            background-color: white;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            color: #832729;
            padding: 20px;
            border-bottom: 2px solid #f2e9e9;
        }
        
        h1 {
            text-align: center;
            color: #832729;
          }

        .content {
            padding: 20px;
            color: #333;
        }
        
        .footer {
            color: #832729;
            text-align: center;
            padding: 20px;
            background-color: #f2e9e9;
            border-radius: 0 0 10px 10px;
        }
        
        .header img {
          display: block;
          margin: 0 auto;
          width: 100%;
          max-width: 200px;
          height: auto;
        }
        
        ul {
            list-style-type: none;
            padding: 0;
        }
        
        ul li {
            background-color: #f2e9e9;
            margin: 10px 0;
            padding: 10px;
            border-radius: 5px;
        }
         p {         
           margin: 10px 0;
        }

        </style>
        </head>
        <body>
        <div class="container">
          <div class="header">
            <h2><img src="https://res.cloudinary.com/dyjgvi4ma/image/upload/v1717778172/i0wmv4lts0wkopgpovsj.png" height="300px" width="350px"></h2>
            <h1>Order  Received ! </h1>
            Dear ${customerDetails.first_name} ${customerDetails.last_name},<br><br>
            Thank you for your order on Nishkar! We're excited to process your purchase and have it delivered to you soon.<br><br>
            Your order has been received with the following details:<br><br>
            Order ID: ${order.order_id} <br>
            Order Date: ${formattedOrderDate}<br>
            Total Amount: ${totalPayable}<br><br>
            Your order will be processed as soon as possible. You will receive an email once your order has been delivered.
              <br><br>
            Thank you for choosing Nishkar! <br><br>
            Best regards,<br>
            Team Nishkar
            </div>
            <div class="footer">
                <p>If you have any questions, please contact our support team at  support@nishkar.com</p>
            </div>
            </div>
          </body>
        </html>
            `;
      sendEmail(customerDetails.email, "Order Received", customerHtmlContent);

      for (const item of cart.cartItems) {
        const product = await Product.findOne({
          where: { product_id: item.product_id },
          include: [
            {
              model: Vendor,
              as: "vendor",
              attributes: ["first_name", "email"],
            },
          ],
        });

        const vendorHtmlContent = `
        <html>
      <head>
      <style>
      body {
            font-family: Arial, sans-serif;
            padding: 0;
            margin: 0;
            background-color: #f2e9e9;
           }
        
        .container {
            max-width: 600px;
            padding: 20px;
            margin: 40px auto;
            border-radius: 10px;
            background-color: white;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            color: #832729;
            padding: 20px;
            border-bottom: 2px solid #f2e9e9;
        }
        
        h1 {
            text-align: center;
            color: #832729;
          }

        .content {
            padding: 20px;
            color: #333;
        }
        
        .footer {
            color: #832729;
            text-align: center;
            padding: 20px;
            background-color: #f2e9e9;
            border-radius: 0 0 10px 10px;
        }
        
        .header img {
          display: block;
          margin: 0 auto;
          width: 100%;
          max-width: 200px;
          height: auto;
        }
        
        ul {
            list-style-type: none;
            padding: 0;
        }
        
        ul li {
            background-color: #f2e9e9;
            margin: 10px 0;
            padding: 10px;
            border-radius: 5px;
        }
         p {         
           margin: 10px 0;
        }
                        </style>
                    </head>
                    <body>
                    <div class="container">
                      <div class="header">
                       <h2><img src="https://res.cloudinary.com/dyjgvi4ma/image/upload/v1717778172/i0wmv4lts0wkopgpovsj.png" height="300px" width="350px"></h2>
                        <h1>New Order Received</h1>
                        Dear ${product.vendor.first_name},<br><br>
                        Congratulations! You have received a new order on Nishkar.<br>
                        Here are the details:<br><br>
                        Customer Name: ${customerDetails.first_name} ${customerDetails.last_name}<br>
                        Email: ${customerDetails.email}<br>
                        Phone: ${customerDetails.phone_no}<br>
                        Product name : ${product.product_name}<br> <br>
                        We wish you great success with this new order! <br><br>
                        Best regards,<br>
                        Team Nishkar
                        </div>
                        <div class="footer">
                            <p>If you have any questions, please contact our support team at  support@nishkar.com</p>
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
      try {
      } catch (error) {
        console.error("Error sending invoices to vendors:", error);
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
