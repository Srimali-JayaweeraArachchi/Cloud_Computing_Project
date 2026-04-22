const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const amqp = require('amqplib');
const axios = require('axios');

const publishToNotification = async (message) => {
  try {
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();
    await channel.assertQueue('notifications');
    channel.sendToQueue('notifications', Buffer.from(JSON.stringify(message)));
    console.log('Notification published:', message);
  } catch (err) {
    console.error('RabbitMQ error:', err);
  }
};

// Register a new restaurant
const registerRestaurant = async (req, res) => {
  try {
    const { name, location } = req.body;
    const ownerId = req.user.id;

    const restaurant = new Restaurant({
      name,
      ownerId,
      location
    });

    await restaurant.save();
    res.status(201).json({ message: 'Restaurant registered successfully', restaurant });
  } catch (error) {
    res.status(500).json({ message: 'Error registering restaurant', error: error.message });
  }
};

// Get all approved restaurants
const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isApproved: true }).populate('ownerId', 'name');
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurants', error: error.message });
  }
};

// Get a specific restaurant
const getRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId).populate('ownerId', 'name');
    if (!restaurant || !restaurant.isApproved) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurant', error: error.message });
  }
};

// Add menu item
const addMenuItem = async (req, res) => {
  try {
    const { name, price } = req.body;
    const ownerId = req.user.id;

    // Find restaurant owned by this user
    const restaurant = await Restaurant.findOne({ ownerId, isApproved: true });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found or not approved' });
    }

    const menuItem = new MenuItem({
      restaurantId: restaurant._id,
      name,
      price
    });

    await menuItem.save();
    res.status(201).json({ message: 'Menu item added successfully', menuItem });
  } catch (error) {
    res.status(500).json({ message: 'Error adding menu item', error: error.message });
  }
};

// Get menu for a restaurant
const getMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const menuItems = await MenuItem.find({ restaurantId, isAvailable: true });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu', error: error.message });
  }
};

// Accept order
const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const ownerId = req.user.id;

    // Verify restaurant ownership by calling order service
    const orderResponse = await axios.get(`http://localhost:3003/api/orders/${orderId}`);
    if (orderResponse.data.restaurantId !== ownerId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update order status via order service
    await axios.put(`http://localhost:3003/api/orders/${orderId}/status`, { status: 'accepted' });

    // Optional: Publish notification (commented out for testing without RabbitMQ)
    // await publishToNotification({
    //   event: 'order_accepted',
    //   orderId,
    //   message: 'Your order has been accepted by the restaurant!'
    // });
    res.json({ message: 'Order accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting order', error: error.message });
  }
};

// Reject order
const rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const ownerId = req.user.id;

    // Verify restaurant ownership (this would need integration with order service)

    // Optional: Publish notification (commented out for testing without RabbitMQ)
    // await publishToNotification({
    //   event: 'order_rejected',
    //   orderId,
    //   message: 'Your order has been rejected by the restaurant.'
    // });
    res.json({ message: 'Order rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting order', error: error.message });
  }
};

module.exports = {
  registerRestaurant,
  getRestaurants,
  getRestaurant,
  addMenuItem,
  getMenu,
  acceptOrder,
  rejectOrder
};