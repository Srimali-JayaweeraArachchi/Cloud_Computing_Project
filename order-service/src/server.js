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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
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
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));