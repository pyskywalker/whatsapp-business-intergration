const fs = require("fs");
const path = require("path");

const inputLog = (message) => {
  const logFilePath = path.join(__dirname, "receive.log");

  fs.appendFile(
    logFilePath,
    `[ ${new Date().toISOString()} ] -  ${message}\n`,
    (err) => {
      if (err) {
        console.error("Failed to write to log file", err);
        console.log("Internal Server Error");
      }
      console.log("Body logged to receive.log");
      console.log("Request body logged");
    }
  );
};

const outputLog = (message) => {
  const logFilePath = path.join(__dirname, "send.log");

  fs.appendFile(
    logFilePath,
    `[ ${new Date().toISOString()} ] -  ${message}\n`,
    (err) => {
      if (err) {
        console.error("Failed to write to log file", err);
        console.log("Internal Server Error");
      }
      console.log("Body logged to send.log");
      console.log("Request body logged");
    }
  );
};

const errorLog = (message) => {
  const logFilePath = path.join(__dirname, "error.log");

  fs.appendFile(
    logFilePath,
    `[ ${new Date().toISOString()} ] -  ${message}\n`,
    (err) => {
      if (err) {
        console.error("Failed to write to log file", err);
        console.log("Internal Server Error");
      }
      console.log("Error logged to error.log");
      console.log("Request body logged");
    }
  );
};

module.exports = {
  inputLog,
  outputLog,
  errorLog,
};
