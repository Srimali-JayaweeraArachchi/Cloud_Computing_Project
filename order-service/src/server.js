const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.get('/api/order/health', (req, res) => {
  res.json({ status: 'Order Service is running!', service: 'order-service' });
});

app.get('/', (req, res) => {
  res.send('Order Service - Food Ordering App');
});

// Routes
const orderRoutes = require('./routes/order');
app.use('/api/orders', orderRoutes);

// Simple RabbitMQ connection (async)
async function connectRabbitMQ() {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    console.log('✅ Connected to RabbitMQ');
  } catch (err) {
    console.error('❌ RabbitMQ connection error:', err);
  }
}

connectRabbitMQ();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/foodordering')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Order Service running on port ${PORT}`);
});