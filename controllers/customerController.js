const { Product, Vendor, Order, OrderItem,User } = require("../models");

const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.findAll();

    if (customers.length === 0) {
      return res.status(404).json({ message: "No customers found" });
    }

    res
      .status(200)
      .json({ message: "Customers fetched successfully", data: customers });
  } catch (error) {
    console.error("Error fetching customer details:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

async function getVendorCustomers(req, res) {
  try {
    const { vendor_id } = req.params;

    const vendor = await Vendor.findByPk(vendor_id, {
      include: [
        {
          model: Product,
          as: "products",
          include: [
            {
              model: OrderItem,
              as: "orderItems",
              include: [
                {
                  model: Order,
                  as: "order",
                  include: [
                    {
                      model: User,
                      as: "user",
                      
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const customerMap = new Map();    
    vendor.products.forEach((product) => {
        product.orderItems.forEach((orderItem) => {
          if (orderItem.order && orderItem.order.user) {
            customerMap.set(orderItem.order.user.user_id, orderItem.order.user);
          }
        });
      });
  
      const uniqueCustomers = Array.from(customerMap.values());

    res.json(uniqueCustomers);
  } catch (error) {
    console.error("Error fetching vendor customers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
module.exports = { getAllCustomers, getVendorCustomers };
