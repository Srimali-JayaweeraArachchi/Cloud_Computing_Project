const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  registerRestaurant,
  getRestaurants,
  getRestaurant,
  addMenuItem,
  getMenu,
  acceptOrder,
  rejectOrder
} = require('../controllers/restaurantController');

// Register a new restaurant (owner only)
router.post('/register', authenticate, authorize(['owner']), registerRestaurant);

// Get all approved restaurants
router.get('/restaurants', getRestaurants);

// Get a specific restaurant
router.get('/:restaurantId', getRestaurant);

// Add menu item (restaurant owner only)
router.post('/menu', authenticate, authorize(['owner']), addMenuItem);

// Get menu for a restaurant
router.get('/menu/:restaurantId', getMenu);

// Accept order (restaurant owner only)
router.post('/orders/:orderId/accept', authenticate, authorize(['owner']), acceptOrder);

// Reject order (restaurant owner only)
router.post('/orders/:orderId/reject', authenticate, authorize(['owner']), rejectOrder);

module.exports = router;