const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
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
    const restaurants = await Restaurant.find({ isApproved: true });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurants', error: error.message });
  }
};

const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurants', error: error.message });
  }
};

// Get a specific restaurant
const getRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
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

const updateRestaurantApproval = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { isApproved } = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { isApproved: Boolean(isApproved) },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json({ message: 'Restaurant approval updated', restaurant });
  } catch (error) {
    res.status(500).json({ message: 'Error updating restaurant approval', error: error.message });
  }
};

module.exports = {
  registerRestaurant,
  getRestaurants,
  getAllRestaurants,
  getRestaurant,
  addMenuItem,
  getMenu,
  updateRestaurantApproval
};
