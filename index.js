const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");

const { Server: SocketIo } = require("socket.io");

const {
  outputLog,
  inputLog,
  errorLog,
  sendMessages,
  sendTemplateMessage,
} = require("./utils");

const query = require("./src/query");

const app = express().use(bodyParser.json());

const server = http.createServer(app);

const io = new SocketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

app.get("/api/:facilityCode/verification", async (req, res) => {
  let hubMode = req.query["hub.mode"];
  let hubQuery = req.query["hub.challenge"];
  let verificationToken = req.query["hub.verify_token"];

  const facilityCode = req.params.facilityCode;

  if (hubMode !== "subscribe") {
    return res.status(422).send("Invalid hub mode");
  }

  //fetch verification token
  const facility = await query("facilities").findFirst({
    where: {
      facility_code: facilityCode,
    },
  });

  if (!facility) {
    return res.status(422).send("Invalid facility code");
  }
  //

  console.log(facility);
  if (facility.verify_token === verificationToken) {
    return res.status(200).send(hubQuery);
  } else {
    return res.status(422).send("Invalid verification token");
  }
  //   })
});

const handleRequest = (body) => {};

app.post("/api/:facilityCode/verification", async (req, res) => {
  try {
    const { object, entry } = req.body;
    const facilityCode = req.params.facilityCode;
    inputLog("REQUEST OUTPUT");
    inputLog(JSON.stringify(req.body));
    let messagesArray = [];
    // Loop through each entry in the payload
    entry.forEach((entryItem) => {
      const entry_id = entryItem.id;
      // Loop through changes in each entry
      entryItem.changes.forEach((change) => {
        const { field, value } = change;

        const { messaging_product, metadata, contacts, messages } = value;
        const { display_phone_number } = metadata;

        messages.forEach((message) => {
          const contact = contacts.find(
            (contact) => contact.wa_id === message.from
          );

          if (contact) {
            const messageObject = {
              entry_id,
              field,
              messaging_product,
              display_phone_number,
              name: contact.profile.name,
              wa_id: contact.wa_id,
              message_id: message.id,
              timestamp: message.timestamp,
              facility_code: facilityCode,
              type: message.type,
              text: message.text?.body || null,
            };

            // Push the message object to the messagesArray
            messagesArray.push(messageObject);
          }
        });
      });
    });
    const io = req.app.get("io");
    messagesArray.forEach(async (element) => {
      const existingMessage = await query("ReceivedMessages").findFirst({
        where: {
          message_id: element.message_id,
        },
      });
      if (!existingMessage) {
        query("ReceivedMessages")
          .create({
            data: element,
          })
          .catch((e) =>
            errorLog(
              "INSERTION ERROR:  " +
                JSON.stringify(e) +
                "Request:  " +
                JSON.stringify(element)
            )
          );
        io.to(`${facilityCode}-${element.display_phone_number}`).emit(
          "receive_messages",
          { ...messagesArray, status: "receive" }
        );
      } else {
        errorLog("Message ID already exists:" + element.message_id);
      }
    });

    res.status(200).json({
      message: "Messages received and stored successfully",
      stored_messages: messagesArray.length,
    });
  } catch (error) {
    errorLog("Error processing messages:   " + error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/:facilityCode/send-message", async (req, res) => {
  const {
    whatsappBusinessPhoneNumberId,
    accessToken,
    recipientPhoneNumber,
    messageBody,
    previewUrl,
    facilityCode,
  } = req.body;

  // Validate required fields
  if (
    !whatsappBusinessPhoneNumberId ||
    !accessToken ||
    !recipientPhoneNumber ||
    !messageBody ||
    !facilityCode
  ) {
    return res.status(422).json({ error: "Missing required fields." });
  }

  let sentMessage;

  try {
    // Save WhatsApp message
    const messageData = {
      whatsappBusinessPhoneNumberId,
      recipientPhoneNumber,
      messageBody,
      previewUrl,
      facilityCode,
    };

    sentMessage = await query("SentMessages").create({ data: messageData });

    // Send WhatsApp message
    const response = await sendMessages(
      whatsappBusinessPhoneNumberId,
      accessToken,
      recipientPhoneNumber,
      messageBody,
      previewUrl
    );

    // Process response
    await handleWhatsAppResponse(response, sentMessage.id);

    res.status(200).json({
      message: "Message sent successfully.",
      data: sentMessage,
    });
  } catch (error) {
    handleError(res, error, sentMessage?.id);
  }
});

app.post("/api/:facilityCode/send-template-message", async (req, res) => {
  const {
    whatsappBusinessPhoneNumberId,
    accessToken,
    recipientPhoneNumber,
    patientName,
    facilityCode,
    hospitalName,
  } = req.body;

  // Validate required fields

  if (
    !whatsappBusinessPhoneNumberId ||
    !accessToken ||
    !recipientPhoneNumber ||
    !hospitalName ||
    !facilityCode ||
    !patientName
  ) {
    return res.status(422).json({ error: "Missing required fields." });
  }

  try {
    // Save WhatsApp message
    const messageData = {
      whatsappBusinessPhoneNumberId,
      recipientPhoneNumber,
      hospitalName,
      accessToken,
      patientName,
      facilityCode,
    };

    sendTemplateMessage(
      whatsappBusinessPhoneNumberId,
      accessToken,
      recipientPhoneNumber,
      hospitalName,
      patientName
    );

    res.status(200).json({
      message: "Message received.",
      data: messageData,
    });
  } catch (error) {
    errorLog(JSON.stringify(error));
  }
});

function handleError(res, error, messageId) {
  console.error("Error:", error);

  if (messageId) {
    const { message, type, code, error_subcode, fbtrace_id } = error;
    query("SentMessages").update({
      where: { id: messageId },
      data: {
        error_message: message,
        error_code: code,
        error_subcode: error_subcode,
        fbtrace_id,
        error_type: type,
        status: "failed",
      },
    });
  }

  return res.status(500).json({
    message: "Failed to send message.",
    error: error.message,
  });
}

async function handleWhatsAppResponse(response, messageId) {
  if (response?.messaging_product === "whatsapp") {
    const wa_id = response.contacts?.[0]?.wa_id || null;
    const message_id = response.messages?.[0]?.id || null;

    if (wa_id && message_id && messageId) {
      await query("SentMessages").update({
        where: { id: messageId },
        data: {
          message_id,
          wa_id,
          status: "sent",
        },
      });
    }
  } else {
    throw new Error("Invalid WhatsApp response.");
  }
}

// app.post("/api/:facilityCode/verification", async (req, res) => {
//   try {
//     const { object, entry } = req.body;
//     const facilityCode = req.params.facilityCode;
//     inputLog("REQUEST OUTPUT");
//     inputLog(JSON.stringify(req.body));
//     let messagesArray = [];
//     // Loop through each entry in the payload
//     entry.forEach((entryItem) => {
//       const entry_id = entryItem.id;
//       // Loop through changes in each entry
//       entryItem.changes.forEach((change) => {
//         const { field, value } = change;

//         const { messaging_product, metadata, contacts, messages } = value;
//         const { display_phone_number } = metadata;

//         messages.forEach((message) => {
//           const contact = contacts.find(
//             (contact) => contact.wa_id === message.from
//           );

//           if (contact) {
//             const messageObject = {
//               entry_id,
//               field,
//               messaging_product,
//               display_phone_number,
//               name: contact.profile.name,
//               wa_id: contact.wa_id,
//               message_id: message.id,
//               timestamp: message.timestamp,
//               facility_code: facilityCode,
//               type: message.type,
//               text: message.text?.body || null,
//             };

//             // Push the message object to the messagesArray
//             messagesArray.push(messageObject);
//           }
//         });
//       });
//     });

//     messagesArray.forEach(async (element) => {
//       const existingMessage = await query("ReceivedMessages").findFirst({
//         where: {
//           message_id: element.message_id,
//         },
//       });
//       if (!existingMessage)
//         query("ReceivedMessages")
//           .create({
//             data: element,
//           })
//           .catch((e) =>
//             errorLog(
//               "INSERTION ERROR:  " +
//                 JSON.stringify(e) +
//                 "Request:  " +
//                 JSON.stringify(element)
//             )
//           );
//       else {
//         errorLog("Message ID already exists:" + element.message_id);
//       }
//     });
//     res.status(200).json({
//       message: "Messages received and stored successfully",
//       stored_messages: messagesArray.length,
//     });
//   } catch (error) {
//     errorLog("Error processing messages:   " + error);
//     res.status(500).send("Internal Server Error");
//   }
// });

io.on("connection", (socket) => {
  console.log(`USER CONNECTED : ${socket.id}`);

  socket.on("join_chat", (data) => {
    socket.join(data);
    console.log(`USER WITH ID: ${socket.id} joined chat: ${data}`);
  });

  socket.on("send_message", (data) => {
    console.log(data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3300, () => {
  console.log("Webhook App is Online");
});
