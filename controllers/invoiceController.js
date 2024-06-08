const fs = require("fs");
const puppeteer = require("puppeteer");
const {
  Order,
  OrderItem,
  Product,
  User,
  Address,
  City,
  State,
} = require("../models");

const generateInvoiceHTML = (order) => {
  console.log("Invoice HTML");

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
                <p> <b>Order ID <t style="margin-left:3.5%">: </t></b> <span style="margin-left:2%">${order.order_id}</span></p>
            <p><b>Customer <t style="margin-left:2%">:</b> <t style="margin-left:2%">${order.user.first_name} ${order.user.last_name}</p>
            <p><b>Email<t style="margin-left:7.5%">:</b> <t style="margin-left:2%"> ${order.user.email}</p>
                <p><b>Order Date <t style="margin-left:1%">:</b> <span style="margin-left:2%">${new Date(order.order_date).toLocaleDateString('en-GB')}</span></p>
            <p><b>Address <t style="margin-left:4%">: </b> <t style="margin-left:2%">${address.street_address}, ${address.city.city_name}, ${address.state.state_name}, ${address.pincode}, ${address.country}</p>
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
                 <p><span>Subtotal:</span> <span class="value">${order.subtotal}</span></p>
                ${order.discount_value > 0 ? `<p><span>Discount:</span> <span class="value">${order.discount_value}</span></p>` : ""}
                <p><span style="display: inline-block; width: 150px; margin-right:9%">GST:</span> <span class="value">3%</span></p>
                <p class="total"><span>Total:</span> <span class="value">${order.total_amount}</span></p>
        </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

const generateInvoice = async (order_id) => {
  console.log("Generate Invoice ");

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
    console.log("After Generate HTML");

    const browser = await puppeteer.launch({ headless: false, timeout: 120000 });
    console.log("browser : ", browser);

    const page = await browser.newPage();
    console.log("page : ", page);

    await page.setContent(htmlContent, { timeout: 120000 });
    // await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 60000 });

    console.log("After Set Content");

    const filePath = `./invoices/${order_id}.pdf`;
    console.log("filePath : ", filePath);
    
    await page.pdf({ path: filePath, format: "A4" });
    await browser.close();
    console.log("After Close");

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

    // Set headers to download the file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${order_id}.pdf"`
    );
    // Send the file as a response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Remove the file after sending
    fileStream.on("close", () => {
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("Error downloading invoice:", error);
    res.status(500).send("Error downloading invoice");
  }
};

module.exports = { downloadInvoice };
