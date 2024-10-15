const fs = require("fs");
const path = require("path");

const axios = require("axios");

const sendMessages = async (
  whatsappBusinessPhoneNumberId,
  accessToken,
  recipientPhoneNumber,
  messageBody,
  previewUrl = false
) => {
  const url = `https://graph.facebook.com/v21.0/${whatsappBusinessPhoneNumberId}/messages`;

  const postData = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhoneNumber,
    type: "text",
    text: {
      preview_url: previewUrl,
      body: messageBody,
    },
  };

  try {
    const response = await axios.post(url, postData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("Message sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error sending message:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

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
  sendMessages,
};
