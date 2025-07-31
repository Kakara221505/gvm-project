const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./db"); // MongoDB connection utility
const { Server } = require("socket.io");
const http = require("http");
// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;
// Enable CORS for all routes
app.use(cors());
// Import middlewares
const authenticate = require("./middlewares/authenticate");
const authorize = require("./middlewares/authorize");
const { dashLogger } = require("./utils/logger");
// Connect to MongoDB
connectDB().catch((err) => {
  console.error("MongoDB Connection Error:", err);
  process.exit(1); // Exit process if DB connection fails
});
// Set up body-parser middleware to handle JSON and urlencoded data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const variantRoutes = require('./routes/variationRoutes');
const addressRoutes = require('./routes/addressRoutes');
const couponRoutes = require('./routes/couponRoutes');
const contactUsRoutes = require('./routes/contactUsRoutes');
const bankRoutes = require('./routes/bankRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
// Register routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use('/product', productRoutes);
app.use('/category', categoryRoutes);
app.use('/sub-category', subCategoryRoutes);
app.use('/brand', brandRoutes);
app.use('/order', orderRoutes);
app.use('/cart', cartRoutes);
app.use('/payment', paymentRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/variant', variantRoutes);
app.use('/address', addressRoutes);
app.use('/coupon', couponRoutes);
app.use('/bank', bankRoutes);
app.use('/contactus', contactUsRoutes);
app.use('/rating', ratingRoutes);
app.use('/admin', adminRoutes);
app.use('/vendor', vendorRoutes);
// Serve static files
const staticPaths = [
  { path: "/UserMedia", dir: process.env.USER_MEDIA_PATH },
  { path: "/productmedia", dir: process.env.PRODUCT_MEDIA_PATH },
  { path: "/categorymedia", dir: process.env.CATEGORY_IMAGE_PATH },
  { path: "/brandmedia", dir: process.env.BRAND_IMAGE_PATH },
  { path: '/ratingmedia', dir: process.env.RATING_MEDIA_PATH },
  { path: '/bannermedia', dir: process.env.BANNER_MEDIA_PATH},
];
staticPaths.forEach(({ path, dir }) => {
  if (dir) {
    app.use(path, express.static(dir));
  } else {
    console.warn(`Warning: Static path ${path} is not set in environment variables`);
  }
});
// Serve Swagger documentation
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  dashLogger.error(
    `${err}, \nRequest: ${req.originalUrl}, \nRequest Params: ${JSON.stringify(
      req.query
    )}, \nRequest Body: ${JSON.stringify(req.body)}, \nError: ${err.stack}`
  );
  res.status(500).json({ message: "Something went wrong" });
});
// Start HTTP server with proper error handling
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
}).on("error", (err) => {
  console.error("Server Error:", err);
  process.exit(1); // Exit the process on server failure
});