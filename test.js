const { sendMessages } = require("./utils");

require("dotenv").config();
const axios = require("axios");

// const sendMessages = () => {
//   const url = `https://graph.facebook.com/v20.0/459515070570744/messages`;
//   axios
//     .post(
//       url,
//       {
//         messaging_product: "whatsapp",
//         to: "255755071969",
//         type: "template",
//         template: {
//           name: "test_test",
//           language: { code: "en_US" },
//           components: [
//             {
//               type: "body",
//               parameters: [
//                 {
//                   type: "text",
//                   text: "Event Name", // This replaces {{1}}
//                 },
//                 {
//                   type: "text",
//                   text: "RSVP Status", // This replaces {{2}}
//                 },
//                 {
//                   type: "text",
//                   text: "Location", // This replaces {{3}}
//                 },
//                 {
//                   type: "text",
//                   text: "Time", // This replaces {{4}}
//                 },
//               ],
//             },
//           ],
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, // Example for bearer token
//           "Content-Type": "application/json",
//         },
//       }
//     )
//     .then((response) => console.log(response.data))
//     .catch((error) =>
//       error.response
//         ? console.log(error.response.data)
//         : console.log(error.message)
//     );
// };

// sendMessages();

sendMessages(
  process.env.TEST_PHONE_NUMBER_ID,
  process.env.WHATSAPP_ACCESS_TOKEN,
  "255755071969",
  "This is the actual deliverable of this journey"
);
