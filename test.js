const { sendMessages, sendTemplateMessage } = require("./utils");

require("dotenv").config();
const axios = require("axios");

// sendMessages();

sendTemplateMessage(
  process.env.TEST_PHONE_NUMBER_ID,
  process.env.WHATSAPP_ACCESS_TOKEN,
  "255653244710",
  "G-Hospital",
  "Mussa Lucas Machera"
);
