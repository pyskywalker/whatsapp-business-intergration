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
        throw "Internal Server Error";
      }
      console.log("Body logged to receive.log");
      throw "Request body logged";
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
        throw "Internal Server Error";
      }
      console.log("Body logged to receive.log");
      throw "Request body logged";
    }
  );
};

module.exports = {
  inputLog,
  outputLog,
};
