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
  City,
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

const sendOrderEmails = async (
  orderItems,
  customerDetails,
  newOrder,
  totalAmount
) => {
  const detailedOrderItems = await Promise.all(
    orderItems.map(async (item) => {
      const product = await Product.findByPk(item.product_id, {
        include: [
          {
            model: Vendor,
            as: "vendor",
            attributes: ["first_name", "email"],
          },
        ],
      });

      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }
      return {
        ...item,
        product_name: product.product_name,
        mrp: product.mrp,
        size: product.size,
        vendor: product.vendor,
      };
    })
  );

  for (const item of detailedOrderItems) {
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
            Total Amount: ${totalAmount}<br>
            <h4>Order Items:</h4>
        <ul>
        ${detailedOrderItems
          .map(
            (item) => `
        <li>
            <h4>${item.product_name}</h4>
            <p>Quantity: ${item.quantity}</p>
            <p>Price: ${item.unit_price}</p>
            <p>Total: ${item.total_price}</p>
            <p>MRP: ${item.mrp}</p>
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
    customerDetails.email,
    "Order Request Received",
    customerHtmlContent
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
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["product_name", "p_images"],
              },
            ],
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

        const product_temp = item.product || product; // Access product details from include or from Product.findOne

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

        console.log("product_temp.p_images:", product_temp.p_images);

        const productImage = product_temp.p_images[0]; // Take the first image URL from the array
        console.log("productImage:", productImage);

        // Assign product_name and product_image to item
        item.product_name = product_temp.product_name;
        item.product_image = productImage;
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

      await sendOrderEmails(orderItems, customerDetails, newOrder, totalAmount);

      const responseOrderItems = await Promise.all(
        orderItems.map(async (item) => {
          const product = await Product.findByPk(item.product_id, {
            attributes: ["product_name", "p_images"],
          });

          if (!product) {
            throw new Error(`Product with ID ${item.product_id} not found`);
          }

          return {
            ...item,
            product_name: product.product_name,
            product_image:
              product.p_images.length > 0 ? product.p_images[0] : null,
          };
        })
      );

      res.status(201).json({
        message: "Order added successfully",
        order: newOrder,
        orderItems: responseOrderItems,
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

  try {
    const order = await Order.findOne({
      where: { user_id, order_id },
      attributes: [
        "order_id",
        "order_date",
        "status",
        "total_amount",
        "updatedAt",
      ],
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

    const addresses = await Address.findAll({
      where: { user_id },
      include: [
        { model: City, as: "city", attributes: ["city_name"] },
        { model: State, as: "state", attributes: ["state_name"] },
      ],
    });

    if (!addresses.length) {
      return res
        .status(404)
        .json({ error: "No addresses found for the specified user_id" });
    }

    let hasDefaultShippingAddress = false;
    addresses.forEach((address) => {
      if (address.is_default) {
        hasDefaultShippingAddress = true;
        return;
      }
    });

    if (hasDefaultShippingAddress) {
      const shippingAddresses = addresses.filter(
        (address) => address.address_type === "shipping"
      );
      return res.status(200).json({
        message: "Order details retrieved successfully",
        order,
        shippingAddresses,
      });
    } else {
      const shippingAddresses = addresses.filter(
        (address) => address.address_type === "shipping"
      );
      const billingAddresses = addresses.filter(
        (address) => address.address_type === "billing"
      );
      return res.status(200).json({
        message: "Order details retrieved successfully",
        order,
        shippingAddresses,
        billingAddresses,
      });
    }
  } catch (error) {
    console.error("Error retrieving order details:", error);
    res.status(500).json({ message: "Failed to retrieve order details" });
  }
};

const getBasicOrderDetailsForAdmin = async (req, res) => {
  try {
    const orders = await Order.findAll({
      attributes: [
        "order_id",
        "order_date",
        "status",
        "total_amount",
        [
          Sequelize.literal(
            '(SELECT COUNT(*) FROM "OrderItems" WHERE "OrderItems"."order_id" = "Order"."order_id")'
          ),
          "total_products",
        ],
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "first_name", "last_name"],
        },
        {
          model: OrderItem,
          as: "orderItems",
          attributes: [],
        },
      ],
      group: ["Order.order_id", "user.user_id"],
    });

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json({
      message: "Basic order details retrieved successfully",
      orders,
    });
  } catch (error) {
    console.error("Error retrieving basic order details:", error);
    res.status(500).json({ message: "Failed to retrieve basic order details" });
  }
};

const getAdminDetailedOrderDetails = async (req, res) => {
  const { order_id } = req.params;

  try {
    const order = await Order.findOne({
      where: { order_id },
      attributes: ["order_id", "order_date", "status", "total_amount"],
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "user_id",
            "first_name",
            "last_name",
            "email",
            "phone_no",
          ],
          include: [
            {
              model: Address,
              as: "addresses",
              attributes: [
                "address_id",
                "user_id",
                "first_name",
                "last_name",
                "phone_no",
                "street_address",
                "city_id",
                "state_id",
                "pincode",
                "address_type",
              ],
              include: [
                {
                  model: City,
                  as: "city",
                  attributes: ["city_name"],
                },
                {
                  model: State,
                  as: "state",
                  attributes: ["state_name"],
                },
              ],
            },
          ],
        },
        {
          model: OrderItem,
          as: "orderItems",
          attributes: [
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
              attributes: [
                "product_name",
                "p_images",
                "main_description",
                "mrp",
                "selling_price",
                "stock_quantity",
                "size",
              ],
              include: [
                {
                  model: Vendor,
                  as: "vendor",
                  attributes: ["vendor_id", "first_name", "last_name"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Detailed order details retrieved successfully",
      order: order,
    });
  } catch (error) {
    console.error("Error retrieving detailed order details:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve detailed order details" });
  }
};

const getBasicOrderDetailsForVendor = async (req, res) => {
  const { vendor_id } = req.params;

  try {
    const orders = await Order.findAll({
      where: { vendor_id},
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: OrderItem,
          attributes: ['order_id', 'order_date', 'status'],
        },
      ],
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const getVendorDetailedOrderDetails = async (req, res) => {
  const { order_id,vendor_id } = req.params;

  try {
    const order = await Order.findOne({
      where: { order_id },
      attributes: ["order_id", "order_date", "status", "total_amount"],
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "user_id",
            "first_name",
            "last_name",
            "email",
            "phone_no",
          ],
          include: [
            {
              model: Address,
              as: "addresses",
              attributes: [
                "address_id",
                "user_id",
                "first_name",
                "last_name",
                "phone_no",
                "street_address",
                "city_id",
                "state_id",
                "pincode",
                "address_type",
              ],
              include: [
                {
                  model: City,
                  as: "city",
                  attributes: ["city_name"],
                },
                {
                  model: State,
                  as: "state",
                  attributes: ["state_name"],
                },
              ],
            },
          ],
        },
        {
          model: OrderItem,
          as: "orderItems",
          attributes: [
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
              attributes: [
                "product_name",
                "p_images",
                "main_description",
                "mrp",
                "selling_price",
                "stock_quantity",
                "size",
              ],
              include: [
                {
                  model: Vendor,
                  as: "vendor",
                  attributes: [],
                  where: { vendor_id}, // Filter products based on the vendor ID
                },
              ],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Detailed order details retrieved successfully",
      order: order,
    });
  } catch (error) {
    console.error("Error retrieving detailed order details:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve detailed order details" });
  }
};


// Add conditions for various status
const updateOrderItemStatus = async (req, res) => {
  const { order_id, orderItem_id } = req.params;
  const { vendor_status } = req.body;

  try {
    const orderItem = await OrderItem.findOne({
      where: {
        order_id,
        orderItem_id,
      },
    });

    if (!orderItem) {
      return res.status(404).json({ message: "Order Item not found" });
    }

    orderItem.vendor_status = vendor_status;
    await orderItem.save();

    res.status(200).json({ message: "Vendor status updated successfully" });
  } catch (error) {
    console.error("Error updating vendor status:", error);
    res.status(500).json({ message: "Failed to update vendor status" });
  }
};

// Maybe not working
const updateOrderStatus = async (req, res) => {
  const { order_id } = req.params;

  try {
    const order = await Order.findByPk(order_id, {
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          attributes: ["vendor_status"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderItems = order.orderItems;

    const allConfirmed = orderItems.every(
      (item) => item.vendor_status === "confirmed"
    );

    if (allConfirmed) {
      await order.update({ status: "placed" });

      const userDetails = await order.getUser();

      await sendOrderConfirmationEmail(userDetails, order);

      return res.status(200).json({
        message: 'Order status updated to "placed" and confirmation email sent',
      });
    } else {
      return res.status(400).json({
        message:
          'Order status cannot be updated to "placed" yet. Not all items have vendor_status set to "confirmed"',
      });
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

const sendOrderConfirmationEmail = async (userDetails, order) => {
  const htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 10px;
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f4f4f4;
            margin: 0;
          }
          .container {
            max-width: 600px;
            padding: 20px;
            border-radius: 10px;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            margin-bottom: 20px;
          }
          h1 {
            text-align: center;
          }
          .header img {
            max-width: 200px;
          }
          .content {
            margin-bottom: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 3px solid #ccc;
            background-color: #d7d3d3;
            height: 100px;
          }
          .button {
            justify-content: center;
            align-items: center;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            align-items: center;
            text-align: center;
            border-radius: 5px;
            margin-left: 35%;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>
          <div class="content">
            <p>Dear ${userDetails.first_name} ${userDetails.last_name},</p>
            <p>Your order has been confirmed and is now being processed. Here are your order details:</p>
            <ul>
              ${order.orderItems
                .map(
                  (item) => `
                    <li>${item.quantity}x ${item.product.product_name} - $${item.total_price}</li>
                  `
                )
                .join("")}
            </ul>
            <p>Total Price: $${order.total_amount}</p>
            <p>Thank you for shopping with us!</p>
          </div>
          <div class="footer">
            <a href="#" class="button">Track Order</a>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await sendEmail(userDetails.email, "Order Confirmation", htmlContent);
    console.log("Order confirmation email sent successfully");
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
};

module.exports = {
  addOrder,
  getOrderDetailsByUserId,
  getDetailedOrderDetails,
  getBasicOrderDetailsForAdmin,
  getAdminDetailedOrderDetails,
  getBasicOrderDetailsForVendor,
  getVendorDetailedOrderDetails,
  updateOrderItemStatus,
  updateOrderStatus,
};
