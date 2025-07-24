const {
  format,
  createLogger,
  transports
} = require("winston");
const { LOG_LEVEL } = require("../../config/index");

// 2025-06-06 22:22:22 INFO: [email:ddd] [location: ddd] [procType: fff] [log:{}]
const formats = format.combine(
  format.timestamp({ format: "YYY-MM-DD HH:mm:ss.SSS" }),
  format.simple(),
  format.splat(),
  format.printf(
    (info) =>
      `${info.timestamp} ${info.level.toUpperCase()}: [email: ${
        info.message.email
      }] [location: ${info.message.location}] [procType:${info.message.proc_type}] [log:${info.message.log}]`
  )
);

const logger = createLogger({
  level: LOG_LEVEL,
  transports: [new transports.Console({ format: formats })],
});

module.exports = logger;
