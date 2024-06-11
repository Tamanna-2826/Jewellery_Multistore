const express = require("express");
const Sequelize = require("sequelize");
const sequelizeConfig = require("./config/config.js");
const sequelize = new Sequelize(sequelizeConfig.development);
const cors = require("cors");
// const timeout = require('express-timeout-handler');

const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const addressRoutes = require("./routes/addressRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const couponRouts = require("./routes/couponRoutes");
const customerRoutes = require("./routes/customerRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const websiteReviweRoutes = require("./routes/websiteReviewRoutes");
const countRoutes = require("./routes/countRoutes");


const app = express();

app.use(cors());
app.use(express.json({ verify: (req, res, buf) => (req.rawBody = buf) }));

app.use("/auth", authRoutes);
app.use("/location", locationRoutes);
app.use("/vendor", vendorRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/address", addressRoutes);
app.use("/order", orderRoutes);
app.use("/payment", paymentRoutes);
app.use("/reviews", reviewRoutes);
app.use("/coupon", couponRouts);
app.use("/customer", customerRoutes);
app.use("/banner", bannerRoutes);
app.use("/invoice", invoiceRoutes);
app.use("/website-reviews", websiteReviweRoutes);
app.use("/count", countRoutes);


sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
