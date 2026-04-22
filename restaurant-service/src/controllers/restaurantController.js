const amqp = require('amqplib');

const publishToNotification = async (message) => {
  try {
    const connection = await amqp.connect('amqp://rabbitmq');
    const channel = await connection.createChannel();
    await channel.assertQueue('notifications');
    channel.sendToQueue('notifications', Buffer.from(JSON.stringify(message)));
    console.log('Notification published:', message);
  } catch (err) {
    console.error('RabbitMQ error:', err);
  }
};

// When restaurant accepts order
const acceptOrder = async (req, res) => {
  // ... logic to update order status via call to Order Service or shared logic
  await publishToNotification({
    event: 'order_accepted',
    orderId: req.params.orderId,
    message: 'Your order has been accepted by the restaurant!'
  });
  res.json({ message: 'Order accepted' });
};