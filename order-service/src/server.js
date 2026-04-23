const express = require('express');
const amqp = require('amqplib');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

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

const orderRoutes = require('./routes/order');
app.use('/api/orders', orderRoutes);

async function connectRabbitMQ() {
  try {
    await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    console.log('RabbitMQ connected for Order Service');
  } catch (err) {
    console.error('RabbitMQ connection error in Order Service:', err.message);
  }
}

async function startServer() {
  try {
    await connectDB();
    await connectRabbitMQ();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Order Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Startup] Order Service failed to start:', err.message);
    process.exit(1);
  }
}

startServer();
