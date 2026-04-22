const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'restaurant_owner', 'admin'], 
    default: 'customer' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = userSchema;