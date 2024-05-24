const bodyParser = require("body-parser");
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
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const addressRoutes = require('./routes/addressRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// // Timeout middleware
// app.use(timeout.handler({
//   timeout: 120000, // Timeout duration in milliseconds (e.g., 2 minutes)
//   onTimeout: (req, res) => {
//     res.status(503).send('Request Timeout');
//   },
// }));

app.use(cors());
// app.use(express.json());
app.use(express.json({ verify: (req, res, buf) => req.rawBody = buf }));


// app.use(bodyParser.raw({ type: 'application/json ' }));


app.use('/auth', authRoutes);
app.use('/location', locationRoutes);
app.use('/vendor', vendorRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/address', addressRoutes);
app.use('/order', orderRoutes);
app.use('/payment', paymentRoutes);

sequelize.sync()
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