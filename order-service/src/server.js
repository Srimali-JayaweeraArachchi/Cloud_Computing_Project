const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const dotenv = require('dotenv');
const cors = require('cors');
const dns = require('dns');

dotenv.config();

// Set DNS servers for reliability (Google Public DNS)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 8003;

app.use(cors());
app.use(express.json());

app.get('/api/order/health', (req, res) => {
  res.json({ status: 'Order Service is running!', service: 'order-service' });
});

app.get('/', (req, res) => {
  res.send('Order Service - Food Ordering App');
});

// MongoDB connection with retry logic
const connectToMongoDB = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Connecting to MongoDB (Attempt ${attempt}/${retries})...`);
      
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 10,
        minPoolSize: 2,
      });

      console.log('✅ Connected to MongoDB');
      
      // Select the orders database
      const db = mongoose.connection.useDb('orders_db');
      
      // Create models on this database
      const Order = db.model('Order', require('./models/Order'));
      
      // Set models for controllers
      require('./db').setModels({ Order });
      
      // Routes (after models are set)
      const orderRoutes = require('./routes/order');
      app.use('/api/orders', orderRoutes);
      
      // Start server
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Order Service running on port ${PORT}`);
      });
      
      return;
      
    } catch (err) {
      console.error(`❌ Attempt ${attempt} failed:`, err.message);
      
      if (attempt === retries) {
        console.error('❌ All connection attempts failed!');
        process.exit(1);
      }
      
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(`⏳ Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// Start connection
connectToMongoDB();
