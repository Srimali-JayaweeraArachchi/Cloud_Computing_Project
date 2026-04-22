require('dotenv').config();
const express = require('express');
const startConsumer = require('./consumer');

const app = express();

startConsumer();

app.get('/', (req, res) => res.send('Notification Service Running'));

const PORT = process.env.PORT || 8004;
app.listen(PORT, () => console.log(`Notification Service on port ${PORT}`));