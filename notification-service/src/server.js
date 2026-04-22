const express = require('express');
const amqp = require('amqplib');
const dotenv = require('dotenv');
const cors = require('cors');
const startConsumer = require('./consumer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.get('/api/notification/health', (req, res) => {
  res.json({ status: 'Notification Service is running!', service: 'notification-service' });
});

app.get('/', (req, res) => {
  res.send('Notification Service - Food Ordering App');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Notification Service running on port ${PORT}`);
  startConsumer();
});