const express = require('express');
const { placeOrder, getOrderHistory, updateOrderStatus, getOrder } = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, placeOrder);
router.get('/history', authenticate, getOrderHistory);
router.get('/restaurant/:restaurantId', authenticate, authorize(['restaurant_owner', 'admin']), getOrderHistory);
router.get('/admin/all', authenticate, authorize(['admin']), getOrderHistory);
router.get('/:orderId', authenticate, getOrder);
router.put('/:orderId/status', authenticate, authorize(['restaurant_owner', 'admin']), updateOrderStatus);

module.exports = router;
