const Order = require('../models/Order');
const axios = require('axios');
const amqp = require('amqplib');

const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const restaurantServiceUrl = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:8002';

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

function getAxiosErrorDetails(error) {
  if (!error.response) {
    return null;
  }

  return {
    status: error.response.status,
    data: error.response.data
  };
}

async function enrichOrdersWithRestaurantDetails(orders) {
  const orderList = Array.isArray(orders) ? orders : [orders];

  const enrichedOrders = await Promise.all(
    orderList.map(async (orderDoc) => {
      const order = orderDoc.toObject ? orderDoc.toObject() : orderDoc;

      try {
        const restaurantResponse = await axios.get(
          `${restaurantServiceUrl}/api/restaurant/${order.restaurantId}`
        );

        return {
          ...order,
          restaurantId: restaurantResponse.data
        };
      } catch (error) {
        return order;
      }
    })
  );

  return Array.isArray(orders) ? enrichedOrders : enrichedOrders[0];
}

const placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, totalPrice } = req.body;
    const customerId = req.user.id;

    // Verify user exists
    const userResponse = await axios.get(`${userServiceUrl}/api/auth/verify/${customerId}`);
    if (!userResponse.data.valid) {
      return res.status(400).json({ message: 'Invalid user' });
    }

    // Verify restaurant exists and is approved
    const restaurantResponse = await axios.get(`${restaurantServiceUrl}/api/restaurant/${restaurantId}`);
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
    const upstreamError = getAxiosErrorDetails(error);

    console.error('Error placing order:', {
      message: error.message,
      userServiceUrl,
      restaurantServiceUrl,
      upstreamError
    });

    if (upstreamError) {
      return res.status(upstreamError.status).json({
        message: 'Error placing order',
        error: upstreamError.data?.message || error.message
      });
    }

    res.status(500).json({ message: 'Error placing order', error: error.message || 'Unknown error' });
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

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    const enrichedOrders = await enrichOrdersWithRestaurantDetails(orders);
    res.json(enrichedOrders);
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
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const enrichedOrder = await enrichOrdersWithRestaurantDetails(order);
    res.json(enrichedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

module.exports = { placeOrder, getOrderHistory, updateOrderStatus, getOrder };
