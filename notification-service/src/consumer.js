const amqp = require('amqplib');

const startConsumer = async () => {
  try {
    const connection = await amqp.connect('amqp://rabbitmq');
    const channel = await connection.createChannel();
    await channel.assertQueue('notifications', { durable: true });

    console.log('Notification Service waiting for messages...');

    channel.consume('notifications', (msg) => {
      const content = JSON.parse(msg.content.toString());
      console.log('Received notification:', content);
      
      // TODO: Send email, push notification, or in-app notification here
      // For now, just log it. You can integrate nodemailer, Firebase, etc.

      channel.ack(msg);
    });
  } catch (err) {
    console.error('RabbitMQ Consumer Error:', err);
  }
};

module.exports = startConsumer;