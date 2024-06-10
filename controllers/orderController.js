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

const getOrderDetailsByUserId = async (req, res) => {
  const { user_id } = req.params;

  try {
    const orders = await Order.findAll({
      where: { user_id },
      attributes: [
        "order_id",
        "order_date",
        "status",
        "discount_value",
        "discounted_amount",
        "total_amount",
      ],
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
        "order_placed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "discount_value",
        "discounted_amount",
        "total_amount",
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
            "vendor_status",
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
      attributes: [
        "order_id",
        "order_date",
        "status",
        "discount_value",
        "discounted_amount",
        "total_amount",
      ],
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
            "vendor_status",
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
                "size",
              ],
              include: [
                {
                  model: Vendor,
                  as: "vendor",
                  attributes: ["vendor_id", "first_name", "last_name", "email"],
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
    const orderItems = await OrderItem.findAll({
      attributes: ["order_id"],
      include: [
        {
          model: Product,
          as: "product",
          attributes: [],
          where: { vendor_id },
        },
      ],
      group: ["order_id"],
    });

    const orderIds = orderItems.map((item) => item.order_id);

    const orders = await Order.findAll({
      attributes: ["order_id", "order_date", "status"],
      where: {
        order_id: orderIds,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "first_name", "last_name"],
        },
        {
          model: OrderItem,
          as: "orderItems",
          attributes: [
            "product_id",
            "orderItem_id",
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
              attributes: ["product_id", "product_name"],
              where: { vendor_id },
            },
          ],
        },
      ],
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getVendorDetailedOrderDetails = async (req, res) => {
  const { order_id, vendor_id } = req.params;

  try {
    const order = await Order.findOne({
      where: { order_id },
      attributes: [
        "order_id",
        "order_date",
        "status",
        "total_amount",
        "order_placed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
      ],
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
            "orderItem_id",
            "vendor_status",
            "product_id",
            "quantity",
            "unit_price",
            "cgst",
            "sgst",
            "igst",
            "sub_total",
            "total_price",
            "order_received",
            "processing",
            "shipped",
            "out_for_delivery",
            "delivered",
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
                "size",
              ],
              where: { vendor_id },
              include: [
                {
                  model: Vendor,
                  as: "vendor",
                  attributes: [],
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

const updateVendorOrderItemStatus = async (req, res) => {
  const { order_id, orderItem_id } = req.params;
  const { vendor_status } = req.body;
  const { authority } = req.decodedToken;

  if (authority !== "vendor") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const orderItem = await OrderItem.findOne({
      where: { order_id, orderItem_id: orderItem_id },
    });

    if (!orderItem) {
      return res.status(404).json({ message: "Order Item not found" });
    }

    if (vendor_status > 3) {
      return res
        .status(403)
        .json({ message: "Vendors can only update status up to 'shipped'" });
    }

    switch (vendor_status) {
      case 2:
        orderItem.vendor_status = 2;
        orderItem.processing = new Date();
        break;
      case 3:
        orderItem.vendor_status = 3;
        orderItem.shipped = new Date();
        break;
      default:
        return res.status(400).json({ message: "Invalid vendor status" });
    }

    await orderItem.save();

    const order = await Order.findByPk(order_id, {
      include: [{ model: OrderItem, as: "orderItems" }],
    });

    const allShipped = order.orderItems.every(
      (item) => item.vendor_status === 3
    );

    if (allShipped) {
      order.status = 3;
      order.shipped = new Date();
    } else {
      const hasProcessing = order.orderItems.some(
        (item) => item.vendor_status === 2
      );

      if (hasProcessing) {
        order.status = 2;
        order.processing = new Date();
      }
    }

    await order.save();

    res.status(200).json({ message: "Vendor status updated successfully" });
  } catch (error) {
    console.error("Error updating vendor status:", error);
    res.status(500).json({ message: "Failed to update vendor status" });
  }
};

const updateAdminOrderStatus = async (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;
  const { authority } = req.decodedToken;

  if (authority !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const order = await Order.findByPk(order_id, {
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: Product,
              as: "product",
              include: [
                {
                  model: Vendor,
                  as: "vendor",
                  attributes: ["first_name", "email"],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["user_id", "first_name", "email"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status < 3) {
      return res.status(403).json({
        message: "Admins can only update status from 'shipped' onwards",
      });
    }

    if (status === 4) {
      order.status = 4;
      order.out_for_delivery = new Date();
      await order.save();
      await OrderItem.update(
        { vendor_status: 4, out_for_delivery: new Date() },
        { where: { order_id } }
      );
    } else if (status === 5) {
      order.status = 5;
      order.delivered = new Date();
      await order.save();
      await OrderItem.update(
        { vendor_status: 5, delivered: new Date() },
        { where: { order_id } }
      );
      let productList = "";
      order.orderItems.forEach((item) => {
        productList += `<li>${item.product.product_name} (Quantity: ${item.quantity})</li>`;
      });

      // Send email to user
      const userEmail = order.user.email;
      const userSubject = "Your order has been delivered!";
      const userHtml = `
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
            /box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);/
        }
        
        .header {
            color: #832729;
            padding: 20px;
            border-bottom: 2px solid #f2e9e9;
            text-align: center;
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
            width: 100%;
            max-width: 350px;
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
         <h1>Order Delivered</h1>
         <p>Dear ${order.user.first_name},</p>
         <p>Your order #${order.order_id} has been successfully delivered. Thank you for shopping with us!</p>
         <p>Order Details:</p>
         <ul>
           ${productList}
         </ul>
         <p>Best regards,<br>Team Nishkar</p>
         </div>
         <div class="footer">
             <p>If you have any questions, please contact our support team at projectsarvadhi@gmail.com</p>
         </div>
         </div>
       </body>
     </html>
       `;
      sendEmail(userEmail, userSubject, userHtml);

      //email to vendor
      for (const item of order.orderItems) {
        const vendorEmail = item.product.vendor.email;
        const vendorSubject = "Order delivered - Product sold";
        const vendorHtml = `
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
            /box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);/
        }
        
        .header {
            color: #832729;
            padding: 20px;
            border-bottom: 2px solid #f2e9e9;
            text-align: center;
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
            width: 100%;
            max-width: 350px;
            height: auto;
        }
        
        ul {
            list-style-type: none;
            padding: 0;
        }
        
        ul li {
            // background-color: #f2e9e9;
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
          <h1>Product Delivered</h1>
          <p>Hello ${item.product.vendor.first_name},</p>
          <p>The product "${item.product.product_name}" from order #${order_id} has been successfully delivered to the customer.</p>
          <p>Order Details:</p>
          <ul>
            <li>Product: ${item.product.product_name}</li>
            <li>Quantity: ${item.quantity}</li>
            <li>Total: ${item.total_price}</li>
          </ul>
          <p>Best regards,<br>Team Nishkar</p>
          </div>
          <div class="footer">
              <p>If you have any questions, please contact our support team at projectsarvadhi@gmail.com</p>
          </div>
          </div>
        </body>
      </html>
        `;
        sendEmail(vendorEmail, vendorSubject, vendorHtml);
      }
    } else {
      order.status = status;
      await order.save();
    }

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

const getStatusForAdmin = async (req, res) => {
  const { order_id } = req.params;

  try {
    const order = await Order.findOne({
      where: { order_id },
      attributes: [
        "status",
        "order_placed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order status:", error);
    res.status(500).json({ message: "Failed to fetch order status" });
  }
};

const getStatusForVendor = async (req, res) => {
  const { orderItem_id } = req.params;

  try {
    const orderItem = await OrderItem.findOne({
      where: { orderItem_id },
      attributes: [
        "vendor_status",
        "order_received",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
      ],
    });

    if (!orderItem) {
      return res.status(404).json({ message: "Order Item not found" });
    }

    res.json(orderItem);
  } catch (error) {
    console.error("Error fetching order item status:", error);
    res.status(500).json({ message: "Failed to fetch order item status" });
  }
};

module.exports = {
  getOrderDetailsByUserId,
  getDetailedOrderDetails,
  getBasicOrderDetailsForAdmin,
  getAdminDetailedOrderDetails,
  getBasicOrderDetailsForVendor,
  getVendorDetailedOrderDetails,
  updateVendorOrderItemStatus,
  updateAdminOrderStatus,
  getStatusForAdmin,
  getStatusForVendor,
};
