require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('User Service Running'));

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));