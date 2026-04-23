const mongoose = require('mongoose');
const dns = require('dns');

const preferredDnsServers = ['8.8.8.8', '1.1.1.1'];

function configureDnsServers() {
  try {
    dns.setServers(preferredDnsServers);
  } catch (err) {
    console.error('Failed to configure DNS servers for MongoDB:', err.message);
  }
}

const connectDB = async () => {
  const mongoUri =
    process.env.MONGO_URI_RESTAURANT ||
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/restaurant_db';

  configureDnsServers();

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('MongoDB connected for Restaurant Service');
  } catch (err) {
    console.error('MongoDB connection error in Restaurant Service:', err.message);
    throw err;
  }
};

module.exports = connectDB;
