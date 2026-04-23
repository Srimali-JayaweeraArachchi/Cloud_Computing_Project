const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  registerRestaurant,
  getRestaurants,
  getAllRestaurants,
  getRestaurant,
  addMenuItem,
  getMenu,
  updateRestaurantApproval
} = require('../controllers/restaurantController');

// Register a new restaurant (owner only)
router.post('/register', authenticate, authorize(['restaurant_owner']), registerRestaurant);

// Get all approved restaurants
router.get('/restaurants', getRestaurants);

// Admin management routes
router.get('/admin/restaurants', authenticate, authorize(['admin']), getAllRestaurants);
router.put('/admin/restaurants/:restaurantId/approval', authenticate, authorize(['admin']), updateRestaurantApproval);

// Get a specific restaurant
router.get('/:restaurantId', getRestaurant);

// Add menu item (restaurant owner only)
router.post('/menu', authenticate, authorize(['restaurant_owner']), addMenuItem);

// Get menu for a restaurant
router.get('/menu/:restaurantId', getMenu);

module.exports = router;
