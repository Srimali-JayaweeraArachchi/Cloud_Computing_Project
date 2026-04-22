const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/restaurant/health', (req, res) => {
  res.json({ status: 'Restaurant Service is running!', service: 'restaurant-service' });
});

app.get('/', (req, res) => {
  res.send('Restaurant Service - Food Ordering App');
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/foodordering')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Restaurant Service running on port ${PORT}`);
});