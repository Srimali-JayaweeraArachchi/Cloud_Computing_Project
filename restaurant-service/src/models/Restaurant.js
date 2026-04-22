const mongoose = require('mongoose');
const restaurantSchema = new mongoose.Schema({
  name: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: String,
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = restaurantSchema;