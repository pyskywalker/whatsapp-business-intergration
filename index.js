const express = require("express");
const bodyParser = require("body-parser");

const query = require("./src/query");

const app = express().use(bodyParser.json());

app.listen(3300, () => {
  console.log("Webhook App is Online");
});

app.get("/:facilityCode/verification", async (req, res) => {
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
