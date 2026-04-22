const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/notification/health', (req, res) => {
  res.json({ status: 'Notification Service is running!', service: 'notification-service' });
});

app.get('/', (req, res) => {
  res.send('Notification Service - Food Ordering App');
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/foodordering')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Notification Service running on port ${PORT}`);
});