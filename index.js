const express = require("express");
const bodyParser = require("body-parser");

const { outputLog, inputLog, errorLog } = require("./utils");

const query = require("./src/query");

const app = express().use(bodyParser.json());

app.listen(3300, () => {
  console.log("Webhook App is Online");
});

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
    let messagesArray = [];
    // Loop through each entry in the payload
    entry.forEach((entryItem) => {
      const entry_id = entryItem.id;
      // Loop through changes in each entry
      entryItem.changes.forEach((change) => {
        const { field, value } = change;

        // Extract metadata and message info
        const { messaging_product, metadata, contacts, messages } = value;
        const { display_phone_number } = metadata;

        // Loop through each message and store them in the array
        messages.forEach((message) => {
          const contact = contacts.find(
            (contact) => contact.wa_id === message.from
          );

          // If contact is found, create an object and store it in the array
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
              text: message.text?.body || null, // Handles text messages
            };

            // Push the message object to the messagesArray
            messagesArray.push(messageObject);
          }
        });
      });
    });

    messagesArray.forEach(async (element) => {
      const existingMessage = await query("ReceivedMessages").findFirst({
        where: {
          message_id: element.message_id,
        },
      });
      if (!existingMessage)
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
      else {
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
