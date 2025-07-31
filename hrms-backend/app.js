const express = require("express");
const cors = require("cors");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./db"); // MongoDB connection utility
const winston = require("winston"); // Logging
const { Server } = require("socket.io");
const http = require("http");
const cron = require("node-cron");
const schedule = require("node-schedule");

// Enable CORS for all routes
app.use(cors());

require("dotenv").config();
const port = process.env.PORT || 3000; // Set the port to 3000 or use the environment variable
const socketPort = process.env.SOCKETPORT || 9010;

// socket.io
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend's origin for better security
    methods: ["GET", "POST"],
  },
});

server.listen(socketPort, () => {
  console.log(`Socket.IO server running on port ${socketPort}`);
});

// Map to track connected users
const connectedUsers = new Map();

// Handle Socket.IO connections
io.on("connection", (socket) => {
  connectedUsers.set(socket.id, socket.id);
  console.log("connected user ", connectedUsers);

  // socket.on("registerUser", (userId, role) => {
  //   connectedUsers.set(socket.id, socket.id); // Map user ID to socket ID
  //   // connectedUsers.set(userId, { role, socketId: socket.id });
  //   console.log("connected user ", connectedUsers);
  // });

  // Listen for disconnect
  socket.on("disconnect", () => {
    // Remove the user from connectedUsers
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Export `io` to use it in other modules
module.exports = { io, connectedUsers };

// Import middlewares
const authenticate = require("./middlewares/authenticate");
const authorize = require("./middlewares/authorize");

const { dashLogger } = require("./utils/logger");

// Connect to MongoDB
connectDB();
const Employee = require("./models/Employee"); // Add this line

// Set up body-parser middleware to handle JSON and urlencoded data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const authRoutes = require("./routes/authRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const workFromHomeRoutes = require("./routes/workFromHomeRoutes");
const holidaysRoutes = require("./routes/holidayRoutes");
const eventRoutes = require("./routes/eventRoutes");
const desigantionRoutes = require("./routes/designationRoutes");
const employeeAttendanceRoutes = require("./routes/employeeAttendanceRoutes");
const dashboardRoutes = require("./routes/dashBoardRoutes");
const {
  sendBirthdayNotifications,
  sendAnniversaryNotifications,
  leaveReminder,
  wfhReminder,
  wfhCodePushReminder,
  leaveCodePushReminder,
} = require("./controllers/notificationController");
const { sendScheduleMail } = require("./controllers/dashBoardController");
const {
  getEmployeeAttendanceDatewise,
  leaveBalanceCron,
} = require("./controllers/employeeAttendanceController");

app.use("/employee", authRoutes);
app.use("/leave", authenticate, leaveRoutes);
app.use("/notification", authenticate, notificationRoutes);
app.use("/work-from-home", authenticate, workFromHomeRoutes);
app.use("/holidays", authenticate, holidaysRoutes);
app.use("/event", authenticate, eventRoutes);
app.use("/desigantion", authenticate, desigantionRoutes);
app.use("/attendance", authenticate, employeeAttendanceRoutes);
app.use("/dashboard", authenticate, dashboardRoutes);

app.get("/", (req, res) => {
  if (req.connection.localPort == 9018) {
    res.status(200).json({ message: "Socket is connected" });
  } else {
    res.status(200).json({ message: "API is running!" });
  }
});

// Serve static files
const staticPaths = [
  { path: "/EmployeeMedia", dir: process.env.EMPLOYEE_MEDIA_PATH },
  { path: "/ExcelFile", dir: process.env.EXCEL_UPLOAD_PATH },
];

staticPaths.forEach((staticPath) => {
  app.use(staticPath.path, express.static(staticPath.dir));
});

// Serve Swagger documentation at /doc route
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  // const lineNumber = err.stack.split('\n')[1].trim().split(':')[1];
  // console.error(lineNumber);
  dashLogger.error(
    `${err}, \nRequest: ${req.originalUrl}, \nRequest Params: ${JSON.stringify(
      req.query
    )}, \nRequest Body: ${JSON.stringify(req.body)}, \nError: ${err.stack}`
  );
  res.status(500).json({ message: "Something went wrong" });
});

// Start the server and listen to the port
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// run cron for birthday & anniversary notifications at 10 am every day
schedule.scheduleJob({ hour: 10, minute: 0, tz: "Asia/Kolkata" }, () => {
  console.log("Running birthday & anniversary notification cron job...");
  sendBirthdayNotifications();
  sendAnniversaryNotifications();
  console.log("cron job completed today for birthday & work anniversary...");
});

// run cron for leave and whf request reminder to pm and hr at 10:30 am every day
schedule.scheduleJob({ hour: 10, minute: 30, tz: "Asia/Kolkata" }, () => {
  console.log("Running leave & WFH notification cron job for reminder to PM and HR...");
  leaveReminder();
  wfhReminder();
  console.log("Cron job completed today for leave & WFH request reminder to PM and HR...");
});

// run cron for leave and whf request to reminder empployee to push and commit code at 11:30 am every day
schedule.scheduleJob({ hour: 11, minute: 30, tz: "Asia/Kolkata" }, () => { 
  console.log("Running leave & WFH notification cron job...");
  wfhCodePushReminder();
  leaveCodePushReminder();
  console.log("Cron job completed today for leave & WFH request...");
});

// cron for schedular mail in IST Time.
schedule.scheduleJob("*/1 * * * *", () => { // runs every min
  sendScheduleMail();
});

// cron for punch out
schedule.scheduleJob({ hour: 23, minute: 30, tz: "Asia/Kolkata" }, () => {
  console.log("Cron job started for punch out (IST Time)...");
  getEmployeeAttendanceDatewise();
  console.log("Cron job completed for punch out...");
});

// cron to update leave balance on every 1st Jan of year at 12:30 am
schedule.scheduleJob({ month: 1, date: 12, hour: 0, minute: 30, tz: "Asia/Kolkata" }, () => {
  console.log("Cron job started to update leave balance...");
  leaveBalanceCron();
  console.log("Cron job completed for leave balance...");
});
