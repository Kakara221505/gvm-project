const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./db"); // MongoDB connection utility
const { Server } = require("socket.io");
const { connectSocket } = require("./socket/socket");
const http = require("http");
const { startCron } = require("./cron/cron");
const crypto = require("crypto");

// Initialize Express app
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

connectSocket(server);
startCron();

// Enable CORS for all routes
app.use(cors("*"));

const { dashLogger } = require("./utils/logger");
// Connect to MongoDB
connectDB().catch((err) => {
  console.error("MongoDB Connection Error:", err);
  process.exit(1); // Exit process if DB connection fails
});

// Set up body-parser middleware to handle JSON and urlencoded data
app.use(express.json({ limit: "2.5gb" }));
app.use(express.urlencoded({ limit: "2.5gb", extended: true }));

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const groupRoutes = require("./routes/groupRoutes");
const messageRoutes = require("./routes/messageRoutes");
const channelRoutes = require("./routes/channelRoutes");
const settingRoutes = require("./routes/settingRoutes");

// Register routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/chat", chatRoutes);
app.use("/group", groupRoutes);
app.use("/messages", messageRoutes);
app.use("/channel", channelRoutes);
app.use("/setting", settingRoutes);

// Serve static files
const staticPaths = [
  { path: "/UserMedia", dir: process.env.USER_MEDIA_PATH },
  { path: "/messageMedia", dir: process.env.MESSAGE_MEDIA_PATH },
];
staticPaths.forEach(({ path, dir }) => {
  if (dir) {
    app.use(path, express.static(dir));
  } else {
    console.warn(
      `Warning: Static path ${path} is not set in environment variables`
    );
  }
});
app.use("/uploads", express.static("uploads"));
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

// Start both HTTP server and WebSocket server on the same port
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
