const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  items: [{
    menuItemId: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  totalPrice: Number,
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = orderSchema;