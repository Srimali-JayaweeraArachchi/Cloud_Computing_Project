const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

app.use(cors());
app.use(express.json());

const restaurantRoutes = require('./routes/restaurant');
app.use('/api/restaurant', restaurantRoutes);

app.get('/api/restaurant/health', (req, res) => {
  res.json({ status: 'Restaurant Service is running!', service: 'restaurant-service' });
});

app.get('/', (req, res) => {
  res.send('Restaurant Service - Food Ordering App');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Select the restaurant database
    const db = mongoose.connection.useDb('restaurant_db');
    
    // Create models on this database
    const Restaurant = db.model('Restaurant', require('./models/Restaurant'));
    const MenuItem = db.model('MenuItem', require('./models/MenuItem'));
    
    // Set models for controllers
    require('./db').setModels({ Restaurant, MenuItem });
    
    // Routes (after models are set)
    const restaurantRoutes = require('./routes/restaurant');
    app.use('/api/restaurant', restaurantRoutes);
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Restaurant Service running on port ${PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
