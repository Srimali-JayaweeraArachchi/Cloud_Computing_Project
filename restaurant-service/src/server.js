const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/api/restaurant/health', (req, res) => {
  res.json({ status: 'Restaurant Service is running!', service: 'restaurant-service' });
});

const restaurantRoutes = require('./routes/restaurant');
app.use('/api/restaurant', restaurantRoutes);

app.get('/', (req, res) => {
  res.send('Restaurant Service - Food Ordering App');
});

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Restaurant Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Startup] Restaurant Service failed to start:', err.message);
    process.exit(1);
  }
}

startServer();