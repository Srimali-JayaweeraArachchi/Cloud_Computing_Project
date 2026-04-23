const amqp = require('amqplib');

const startConsumer = async () => {
  const rabbitMqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

  try {
    const connection = await amqp.connect(rabbitMqUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue('notifications', { durable: true });

    console.log('Notification Service waiting for messages...');

    channel.consume('notifications', (msg) => {
      const content = JSON.parse(msg.content.toString());
      console.log('Received notification:', content);

      channel.ack(msg);
    });
  } catch (err) {
    console.error('RabbitMQ Consumer Error:', err.message);
  }
};

module.exports = startConsumer;
