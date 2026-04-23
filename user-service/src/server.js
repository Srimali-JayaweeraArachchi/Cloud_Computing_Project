const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/user/health', (req, res) => {
  res.json({ status: 'User Service is running!', service: 'user-service' });
});

app.get('/', (req, res) => {
  res.send('User Service - Food Ordering App');
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`User Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Startup] User Service failed to start:', err.message);
    process.exit(1);
  }
}

startServer();