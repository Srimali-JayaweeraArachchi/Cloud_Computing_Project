const Order = require('../models/Order');
const axios = require('axios');
const amqp = require('amqplib');

const publishToNotification = async (message) => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    const channel = await connection.createChannel();
    await channel.assertQueue('notifications');
    channel.sendToQueue('notifications', Buffer.from(JSON.stringify(message)));
    console.log('Notification published:', message);
    await channel.close();
    await connection.close();
  } catch (err) {
    console.error('RabbitMQ error (optional):', err);
  }
};

const placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, totalPrice } = req.body;
    const customerId = req.user.id;

    // Verify user exists
    const userResponse = await axios.get(`http://localhost:3001/api/auth/verify/${customerId}`);
    if (!userResponse.data.valid) {
      return res.status(400).json({ message: 'Invalid user' });
    }

    // Verify restaurant exists and is approved
    const restaurantResponse = await axios.get(`http://localhost:3002/api/restaurant/${restaurantId}`);
    if (!restaurantResponse.data) {
      return res.status(400).json({ message: 'Invalid restaurant' });
    }

    const order = new Order({
      customerId,
      restaurantId,
      items,
      totalPrice
    });

    await order.save();

    // Publish notification to restaurant (optional)
    await publishToNotification({
      event: 'new_order',
      orderId: order._id,
      restaurantId,
      message: 'A new order has been placed!'
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error placing order', error: error.message });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'admin' && req.path === '/admin/all') {
      filter = {};
    } else if ((req.user.role === 'restaurant_owner' || req.user.role === 'admin') && req.params.restaurantId) {
      filter = { restaurantId: req.params.restaurantId };
    } else {
      filter = { customerId: req.user.id };
    }

    const orders = await Order.find(filter).populate('restaurantId', 'name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order history', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('restaurantId', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

module.exports = { placeOrder, getOrderHistory, updateOrderStatus, getOrder };
