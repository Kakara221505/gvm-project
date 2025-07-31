const winston = require("winston");
require("winston-daily-rotate-file");

// const dashLog = new winston.transports.DailyRotateFile({
//   filename: "./logs/error-%DATE%.log",
//   datePattern: "YYYY-MM-DD",
//   zippedArchive: true,
//   maxSize: "20m",
// });

// const dash = winston.createLogger({
//   transports: [
//     dashLog,
//     new winston.transports.Console({
//       colorize: true,
//     }),
//   ],
// });


// Define the logger configuration
const logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
      return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
    })
  ),
  transports: [
    new winston.transports.Console({ colorize: true, }), // Log to the console
    new winston.transports.DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m", // Optional: Max size of each log file
      maxFiles: "30d", // Optional: Number of days to keep logs
      level: "error", // Log only errors and higher
      // zippedArchive: true,
    }),
  ],
});

module.exports = {
  dashLogger: logger
};
