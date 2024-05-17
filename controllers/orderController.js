const {
  Vendor,
  User,
  Order,
  OrderItem,
  Product,
  CartItem,
  Cart,
  Address,
  State,
} = require("../models");

const { sendEmail } = require("../helpers/emailHelper");
const Sequelize = require("sequelize");
const sequelizeConfig = require("../config/config.js");
const sequelize = new Sequelize(sequelizeConfig.development);

function generateOrderTrackingId() {
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
}

const createOrderItems = async (cartItems, orderId, cgst, sgst, igst) => {
  const orderItems = [];

  for (const item of cartItems) {
    const { product_id, size, quantity, price } = item;

    const sub_total_item = quantity * price;
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

    if (!product) {
      throw new Error("Product not found");
    }

    const orderItem = {
      order_id: orderId,
      product_id,
      quantity,
      unit_price: price,
      cgst,
      sgst,
      igst,
      sub_total: sub_total_item,
      total_price: (
        sub_total_item +
        (sub_total_item * (cgst + sgst + igst)) / 100
      ).toFixed(2),
    };

    orderItems.push(orderItem);
  }

  return orderItems;
};

const sendOrderEmails = async (orderItems, customerDetails, newOrder,totalAmount) => {
  
  for (const item of orderItems) {
    const product = await Product.findByPk(item.product_id, {
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: ["first_name", "email"],
        },
      ],
    });

    if (product) {
      const vendorhtmlContent = `
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
                    h1{
                      text-align: center;
                    }
       
                    .content {
                        padding: 20px;
                    }
       
                    .footer {
                        color: black;
                        text-align: center;
                        padding: 10px;
                        background-color: #d7d3d3; /* Light grey background color */
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
              Congratulations! You have received a new order on Sarvadhi Solutions.<br>
              Here are the details:<br>
              Customer Name: ${customerDetails.first_name} ${customerDetails.last_name}<br>
              Email: ${customerDetails.email}<br>
              Phone: ${customerDetails.phone_no}<br>
              Product name : ${product.product_name}<br> <br>
              Please log in to your vendor dashboard to view the order details and take necessary actions.
              We wish you great success with this new order! <br><br>
              Best regards,<br>
              The Sarvadhi Solutions Team 
              </div>
              <div class="footer">
                  <p>If you have any questions, please contact our support team at projectsarvadhi@gmail.com</p>
              </div>
              </div>
            </body>
          </html>      `;
      sendEmail(product.vendor.email, "New Order received", vendorhtmlContent);
    }
  }

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
              h1{
                text-align: center;
              }
              .content {
                  padding: 20px;
              }
 
              .footer {
                  color: black;
                  text-align: center;
                  padding: 10px;
                  background-color: #d7d3d3; /* Light grey background color */
                  border-radius: 3px;
 
              }
          </style>
      </head>
 
      <body>
      <div class="container">
        <div class="header">
         <h2><img src="https://res.cloudinary.com/dyjgvi4ma/image/upload/dgg9v84gtpn3drrp8qce" height="300px" width="350px"></h2>  
            <h1>Order Request Received ! </h1>
  
            Dear ${customerDetails.first_name} ${
    customerDetails.last_name
  },<br><br>
            Thank you for your order on Sarvadhi Solutions! We're excited to process your purchase and have it delivered to you soon.<br><br>
  
            Your order has been received with the following details:<br>
            Order ID: ${newOrder.order_id} <br>
            Order Date: ${newOrder.order_date}<br>
            Total Amount: ${newOrder.totalAmount}<br>
            <h4>Order Items:</h4>
        <ul>
        ${orderItems
          .map(
            (item) => `
        <li>
            <h4>${item.product_name}</h4>
            <p>Quantity: ${item.quantity}</p>
            <p>Price: ${item.unit_price}</p>
            <p>Total: ${item.total_price}</p>
            <p>Description: ${item.main_description}</p>
            <p>MRP: ${item.mrp}</p>
            <p>Selling Price: ${item.selling_price}</p>
            <p>Size: ${item.size}</p>
        </li>
    `
          )
          .join("")}
        </ul>
            Your order will be processed as soon as possible. You will receive a order confirmation email once your order has been confirmed.
             <br><br>
            Thank you for choosing Sarvadhi Solutions! <br><br>
            Best regards,<br>
             The Sarvadhi Solutions Team
            </div>
            <div class="footer">
                <p>If you have any questions, please contact our support team at projectsarvadhi@gmail.com</p>
            </div>
            </div>
          </body>
        </html>
  `;
  sendEmail(
    customerDetails.email, "Order Request Received",customerHtmlContent
  );
};

const addOrder = async (req, res) => {
  const { user_id } = req.body;

  try {
    await sequelize.transaction(async (t) => {
      const cart = await Cart.findOne({
        where: { user_id },
        include: [
          {
            model: CartItem,
            as: "cartItems",
            attributes: ["product_id", "quantity", "price", "size"],
          },
        ],
        transaction: t,
      });

      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const cartItems = cart.cartItems;
      
        if (cartItems.length === 0) {
          return res.status(400).json({ message: "Cart is empty" });
        }

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
        transaction: t,
      });

      if (!shippingAddress) {
        throw new Error("Shipping address not found");
      }

      const userState = shippingAddress.state
        ? shippingAddress.state.state_name
        : null;

      let subtotal = 0;
      const customerDetails = await User.findByPk(user_id, {
        where: {
          user_id,
        },
        transaction: t,
      });

      let cgst,
        sgst,
        igst = 0;

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
          transaction: t,
        });

        if (!product) {
          throw new Error("Product not found");
        }

        const vendorState = product.vendor.state
          ? product.vendor.state.state_name
          : null;

        if (userState === vendorState) {
          cgst = 9;
          sgst = 9;
          igst = 0;
        } else {
          cgst = 0;
          sgst = 0;
          igst = 18;
        }
      }

      let totalAmount = 0;
      const orderItems = await createOrderItems(
        cartItems,
        null,
        cgst,
        sgst,
        igst
      );

      for (const item of orderItems) {
        totalAmount += parseFloat(item.total_price);
      }
      totalAmount = parseFloat(totalAmount.toFixed(2));

      const newOrder = await Order.create(
        {
          order_id: generateOrderTrackingId(),
          user_id,
          order_date: new Date(),
          subtotal,
          shipping_charges: 0,
          cgst,
          sgst,
          igst,
          total_amount: totalAmount,
          status: "pending",
          address_id: shippingAddress.address_id,
        },
        { transaction: t }
      );

      for (const orderItem of orderItems) {
        orderItem.order_id = newOrder.order_id;
        await OrderItem.create(orderItem);
      }

      await CartItem.destroy({
        where: { cart_id: cart.cart_id },
        force: false,
        transaction: t,
      });

      await sendOrderEmails(orderItems, customerDetails, newOrder,totalAmount);

      res.status(201).json({
        message: "Order added successfully",
        order: newOrder,
        orderItems,
      });
    });
  } catch (error) {
    console.error("Error adding order:", error);
    res.status(500).json({ message: "Failed to add order" });
  }
};

const getOrderDetailsByUserId = async (req, res) => {
  const { user_id } = req.params;

  try {
    const orders = await Order.findAll({
      where: { user_id },
      attributes: ["order_id", "order_date", "status", "total_amount"],
      order: [["order_date", "DESC"]], 
    });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json({
      message: "Order details retrieved successfully",
      orders,
    });
  } catch (error) {
    console.error("Error retrieving order details:", error);
    res.status(500).json({ message: "Failed to retrieve order details" });
  }
};

const getDetailedOrderDetails = async (req, res) => {
  const { user_id, order_id } = req.params;
  console.log(user_id , " ",order_id);

  try {
    const order = await Order.findOne({
      where: { user_id, order_id },
      attributes: ["order_id", "order_date", "status", "total_amount"],
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          attributes: [
            "order_id",
            "product_id",
            "quantity",
            "unit_price",
            "cgst",
            "sgst",
            "igst",
            "sub_total",
            "total_price",
          ],
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["product_name", "p_images"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order details retrieved successfully",
      order,
    });
  } catch (error) {
    console.error("Error retrieving order details:", error);
    res.status(500).json({ message: "Failed to retrieve order details" });
  }
};
module.exports = { addOrder,getOrderDetailsByUserId,getDetailedOrderDetails };
