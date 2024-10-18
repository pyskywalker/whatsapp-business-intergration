const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

async function publishMessageAndUpdateDB(messageContent) {
  amqp.connect(RABBITMQ_URL, function (error0, connection) {
    if (error0) {
      console.error("Failed to connect to RabbitMQ", error0);
      return;
    }

    // Use confirm channel to get acknowledgments
    connection.createConfirmChannel(async function (error1, channel) {
      if (error1) {
        console.error("Failed to create a channel", error1);
        return;
      }

      const queue = "message_queue";

      channel.assertQueue(queue, {
        durable: true,
      });

      try {
        // Save the message to the database with status 'pending'
        const savedMessage = await prisma.message.create({
          data: {
            content: messageContent,
            status: "pending",
          },
        });

        const messageBuffer = Buffer.from(
          JSON.stringify({
            id: savedMessage.id,
            content: savedMessage.content,
          })
        );

        // Publish message with confirmation
        channel.sendToQueue(
          queue,
          messageBuffer,
          { persistent: true },
          async function (err, ok) {
            if (err) {
              console.error("Message was not acknowledged!", err);

              // Update the message status to 'failed' in the database
              await prisma.message.update({
                where: {
                  id: savedMessage.id,
                },
                data: {
                  status: "failed",
                },
              });

              console.log(
                `Message with ID ${savedMessage.id} marked as failed in DB`
              );
            } else {
              console.log("Message acknowledged by RabbitMQ");

              // Update the message status to 'delivered' in the database
              await prisma.message.update({
                where: {
                  id: savedMessage.id,
                },
                data: {
                  status: "delivered",
                },
              });

              console.log(
                `Message with ID ${savedMessage.id} marked as delivered in DB`
              );
            }

            // Close the channel and connection
            setTimeout(function () {
              channel.close();
              connection.close();
            }, 500);
          }
        );
      } catch (dbError) {
        console.error("Error saving message to DB", dbError);
        // Close the connection if there's a DB error
        channel.close();
        connection.close();
      }
    });
  });
}
