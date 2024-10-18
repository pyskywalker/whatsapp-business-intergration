// messageQueue.js

const amqp = require("amqplib");
const query = require("../query");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

// Function to publish messages to RabbitMQ
async function publishToQueue(facilityCode, data) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createConfirmChannel();

    const queue = facilityCode; // Replace with your queue name

    await channel.assertQueue(queue, { durable: true });

    const messageBuffer = Buffer.from(JSON.stringify(data));

    await new Promise((resolve, reject) => {
      channel.sendToQueue(
        queue,
        messageBuffer,
        { persistent: true },
        async (err, ok) => {
          if (err) {
            console.error("Message was not acknowledged!", err);

            // Update the message status to 'failed' in the database
            await query("receivedMessages").updateMany({
              where: { message_id: data.message_id },
              data: { status: "failed" },
            });

            console.log(
              `Message with ID ${data.message_id} marked as failed in DB`
            );
            reject(err);
          } else {
            console.log("Message acknowledged by RabbitMQ");

            // Update the message status to 'delivered' in the database
            await query("receivedMessages").updateMany({
              where: { message_id: data.message_id },
              data: { status: "delivered" },
            });

            console.log(
              `Message with ID ${data.message_id} marked as delivered in DB`
            );
            resolve();
          }

          // Close the channel and connection
          setTimeout(async () => {
            await channel.close();
            await connection.close();
          }, 500);
        }
      );
    });
  } catch (error) {
    console.error("Error in publishToQueue:", error);
  }
}

// Function to handle acknowledgments and consume messages from RabbitMQ
async function acknowledgeResponse(facilityCode) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    const queue = facilityCode; // Replace with your queue name

    await channel.assertQueue(queue, { durable: true });

    channel.consume(
      queue,
      async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          const data = JSON.parse(messageContent);

          console.log("Received message:", data);

          // Process the message (e.g., update database)
          await prisma.receivedMessages.updateMany({
            where: { message_id: data.message_id },
            data: { status: "processed" },
          });
          console.log(`Message with ID ${data.message_id} processed`);

          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Error in acknowledgeResponse:", error);
  }
}

module.exports = {
  publishToQueue,
  acknowledgeResponse,
};
