const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/user/health', (req, res) => {
  res.json({ status: 'User Service is running!', service: 'user-service' });
});

app.get('/', (req, res) => {
  res.send('User Services - Food Ordering Apps');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/foodordering')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 User Service running on port ${PORT}`);
});