const fs = require("fs");
const pdf = require("html-pdf"); // Import the html-pdf library
const path = require("path"); // Import the path module
const { sendEmail } = require("../helpers/emailHelper");

const {
  Order,
  OrderItem,
  Product,
  User,
  Address,
  City,
  State,
  Vendor
} = require("../models");

const invoiceDir = path.join(__dirname, "invoices");

if (!fs.existsSync(invoiceDir)) {
  fs.mkdirSync(invoiceDir);
}

const generateInvoiceHTML = (order) => {
  const orderItemsHTML = order.orderItems
    .map(
      (item) => `
    <tr>
        <td>${item.product.product_name}</td>
        <td>${item.quantity}</td>
        <td>${item.unit_price}</td>
        <td>${item.quantity * item.unit_price}</td>
    </tr>
  `
    )
    .join("");

  const address = order.address;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f2e9e9; }
      .invoice-container { max-width: 800px; margin: 50px auto; padding: 40px; background-color: #fff; border: 1px solid #832729; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
      .header { text-align: center; margin-bottom: 40px; }
      .header img { max-width: 150px; }
      .header h1 { margin: 10px 0 0; font-size: 32px; color: #832729; font-weight: bold; }
      .header p { margin: 5px 0 0; font-size: 16px; color: #666; }
      .details, .items { margin-top: 30px; }
      .details p, .items p { margin: 0; line-height: 1.5; }
      .items h2 { font-size: 22px; color: #832729; margin-bottom: 15px; border-bottom: 1px solid #832729; padding-bottom: 5px; }
      .items table { width: 100%; border-collapse: collapse; margin-top: 10px; background-color: #f2e9e9; }
      .items table, .items th, .items td { border: 1px solid #832729; }
      .items th, .items td { padding: 12px; text-align: left; }
      .items th { background-color: #832729; color: #fff; font-weight: bold; }
      .totals { margin-top: 40px; text-align: right; }
      .totals p { margin: 10px 0; font-size: 18px; }
      .totals p span { display: inline-block; width: 150px; }
      .totals p.total { font-weight: bold; font-size: 24px; color: #832729; }
  </style>
      <title>Invoice</title>
  </head>
  <body>
      <div class="invoice-container">
          <div class="header">
              <img src="https://res.cloudinary.com/dyjgvi4ma/image/upload/v1717778172/i0wmv4lts0wkopgpovsj.png" alt="Logo">
              <h1>Invoice</h1>
          </div>
          <div class="details">
              <p><b>Order ID:</b> ${order.order_id}</p>
              <p><b>Customer:</b> ${order.user.first_name} ${order.user.last_name}</p>
              <p><b>Email:</b> ${order.user.email}</p>
              <p><b>Order Date:</b> ${new Date(order.order_date).toLocaleDateString("en-GB")}</p>
              <p><b>Address:</b> ${address.street_address}, ${address.city.city_name }, ${address.state.state_name}, ${address.pincode}, ${address.country}</p>
          </div>
          <div class="items">
              <h2>Order Items</h2>
              <table>
                  <thead>
                      <tr>
                          <th>Product Name</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Total</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${orderItemsHTML}
                  </tbody>
              </table>
          </div>
          <div class="totals">
              <p><span>Subtotal:</span> <span>${order.subtotal}</span></p>
              ${order.discount_value > 0? `<p><span>Discount:</span> <span>${order.discount_value}</span></p>` : ""}
              <p><span>GST:</span> <span>3%</span></p>
              <p class="total"><span>Total:</span> <span>${order.total_amount }</span></p>
          </div>
      </div>
  </body>
  </html>
`;
};

const generateInvoice = async (order_id) => {
  try {
    const order = await Order.findOne({
      where: { order_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["first_name", "last_name", "email"],
        },
        {
          model: Address,
          as: "address",
          attributes: [
            "street_address",
            "city_id",
            "state_id",
            "pincode",
            "country",
          ],
          include: [
            { model: City, as: "city", attributes: ["city_name"] },
            { model: State, as: "state", attributes: ["state_name"] },
          ],
        },
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["product_name", "selling_price"],
            },
          ],
        },
      ],
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const htmlContent = generateInvoiceHTML(order);

    const filePath = path.join(invoiceDir, `${order_id}.pdf`);

    const options = {
      format: "A4",
      border: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
    };

    await new Promise((resolve, reject) => {
      pdf.create(htmlContent, options).toFile(filePath, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });

    return filePath;
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw new Error("Error generating invoice");
  }
};

const downloadInvoice = async (req, res) => {
  const { order_id } = req.params;

  try {
    const filePath = await generateInvoice(order_id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${order_id}.pdf"`
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("close", () => {
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("Error downloading invoice:", error);
    res.status(500).send("Error downloading invoice");
  }
};
const generateInvoiceForVendor = async (order, vendor) => {
  const orderItemsHTML = order.orderItems
    .filter(item => item.product.vendor_id === vendor.vendor_id)
    .map(
      (item) => `
    <tr>
        <td>${item.product.product_name}</td>
        <td>${item.quantity}</td>
        <td>${item.unit_price}</td>
        <td>${item.quantity * item.unit_price}</td>
    </tr>
  `
    )
    .join("");

  const address = order.address;

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f2e9e9; }
      .invoice-container { max-width: 800px; margin: 50px auto; padding: 40px; background-color: #fff; border: 1px solid #832729; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
      .header { text-align: center; margin-bottom: 40px; }
      .header img { max-width: 150px; }
      .header h1 { margin: 10px 0 0; font-size: 32px; color: #832729; font-weight: bold; }
      .header p { margin: 5px 0 0; font-size: 16px; color: #666; }
      .details, .items { margin-top: 30px; }
      .details p, .items p { margin: 0; line-height: 1.5; }
      .items h2 { font-size: 22px; color: #832729; margin-bottom: 15px; border-bottom: 1px solid #832729; padding-bottom: 5px; }
      .items table { width: 100%; border-collapse: collapse; margin-top: 10px; background-color: #f2e9e9; }
      .items table, .items th, .items td { border: 1px solid #832729; }
      .items th, .items td { padding: 12px; text-align: left; }
      .items th { background-color: #832729; color: #fff; font-weight: bold; }
      .totals { margin-top: 40px; text-align: right; }
      .totals p { margin: 10px 0; font-size: 18px; }
      .totals p span { display: inline-block; width: 150px; }
      .totals p.total { font-weight: bold; font-size: 24px; color: #832729; }
  </style>
      <title>Invoice</title>
  </head>
  <body>
      <div class="invoice-container">
          <div class="header">
              <img src="https://res.cloudinary.com/dyjgvi4ma/image/upload/v1717778172/i0wmv4lts0wkopgpovsj.png" alt="Logo">
              <h1>Invoice</h1>
          </div>
          <div class="details">
              <p><b>Order ID:</b> ${order.order_id}</p>
              <p><b>Vendor:</b> ${vendor.first_name}</p>
              <p><b>Email:</b> ${vendor.email}</p>
              <p><b>Order Date:</b> ${new Date(order.order_date).toLocaleDateString("en-GB")}</p>
          </div>
          <div class="items">
              <h2>Order Items</h2>
              <table>
                  <thead>
                      <tr>
                          <th>Product Name</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Total</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${orderItemsHTML}
                  </tbody>
              </table>
          </div>
          <div class="totals">
              <p><span>Subtotal:</span> <span>${order.subtotal}</span></p>
              ${order.discount_value > 0? `<p><span>Discount:</span> <span>${order.discount_value}</span></p>` : ""}
              <p><span>GST:</span> <span>3%</span></p>
              <p class="total"><span>Total:</span> <span>${order.total_amount }</span></p>
          </div>
      </div>
  </body>
  </html>
  `;

  const filePath = path.join(invoiceDir, `${order.order_id}_vendor_${vendor.vendor_id}.pdf`);

  const options = {
    format: "A4",
    border: {
      top: "0.5in",
      right: "0.5in",
      bottom: "0.5in",
      left: "0.5in",
    },
  };

  await new Promise((resolve, reject) => {
    pdf.create(htmlContent, options).toFile(filePath, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
  
  return filePath;

};

const sendInvoicesToVendors = async (order_id) => {
  try {
    const order = await Order.findOne({
      where: { order_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["first_name", "last_name", "email"],
        },
        {
          model: Address,
          as: "address",
          attributes: [
            "street_address",
            "city_id",
            "state_id",
            "pincode",
            "country",
          ],
          include: [
            { model: City, as: "city", attributes: ["city_name"] },
            { model: State, as: "state", attributes: ["state_name"] },
          ],
        },
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["product_name", "selling_price", "vendor_id"],
              include: [
                { model: Vendor, as: "vendor", attributes: ["vendor_id", "first_name", "email"] },
              ],
            },
          ],
        },
      ],
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const vendors = order.orderItems.reduce((acc, item) => {
      const vendorId = item.product.vendor_id;
      if (!acc[vendorId]) {
        acc[vendorId] = item.product.vendor;
      }
      return acc;
    }, {});

    for (const vendorId in vendors) {
      const vendor = vendors[vendorId];
      await generateInvoiceForVendor(order, vendor);
    }

  } catch (error) {
    console.error("Error sending invoices to vendors:", error);
    throw new Error("Error sending invoices to vendors");
  }
};

const downloadVendorInvoice = async (req, res) => {
  const { order_id, vendor_id } = req.params;

  try {
    const order = await Order.findOne({
      where: { order_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["first_name", "last_name", "email"],
        },
        {
          model: Address,
          as: "address",
          attributes: [
            "street_address",
            "city_id",
            "state_id",
            "pincode",
            "country",
          ],
          include: [
            { model: City, as: "city", attributes: ["city_name"] },
            { model: State, as: "state", attributes: ["state_name"] },
          ],
        },
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["product_name", "selling_price", "vendor_id"],
              include: [
                { model: Vendor, as: "vendor", attributes: ["vendor_id", "first_name", "email"] },
              ],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).send("Order not found");
    }

    const vendor = order.orderItems.reduce((acc, item) => {
      if (item.product.vendor_id === parseInt(vendor_id)) {
        acc = item.product.vendor;
      }
      return acc;
    }, null);

    if (!vendor) {
      return res.status(404).send("Vendor not found for this order");
    }

    const filePath = path.join(invoiceDir, `${order_id}_vendor_${vendor_id}.pdf`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Invoice not found");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${order_id}_vendor_${vendor_id}.pdf"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on("close", () => {
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error("Error downloading vendor invoice:", error);
    res.status(500).send("Error downloading vendor invoice");
  }
};

module.exports = { downloadInvoice,sendInvoicesToVendors,downloadVendorInvoice};
