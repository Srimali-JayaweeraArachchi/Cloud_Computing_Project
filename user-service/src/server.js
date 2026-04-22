const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Select the users database
    const db = mongoose.connection.useDb('users_db');
    
    // Create models on this database
    const User = db.model('User', require('./models/User'));
    
    // Set models for controllers
    require('./db').setModels({ User });
    
    // Routes (after models are set)
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 User Service running on port ${PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));