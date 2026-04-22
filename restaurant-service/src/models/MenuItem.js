const menuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  name: String,
  price: Number,
  isAvailable: { type: Boolean, default: true }
});
module.exports = mongoose.model('MenuItem', menuItemSchema);