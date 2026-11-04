const mongoose = require('mongoose');

let isConnected = false;

// connect to mongodb atlas or fallback safely if ip is not whitelisted
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[Database] MONGODB_URI not found in server/.env. Using local fallback store.');
    return;
  }

  try {
    // 5 second timeout to check Atlas connection
    await mongoose.connect(uri, {
      dbName: 'stockflow',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('[Database] MongoDB connected successfully to database: stockflow');
  } catch (error) {
    isConnected = false;
    console.warn('\n----------------------------------------------------------------------');
    console.warn('[Database] Could not reach MongoDB Atlas (IP not whitelisted or network timeout).');
    console.warn('To connect Atlas: Go to MongoDB Atlas -> Network Access -> Add IP -> 0.0.0.0/0');
    console.warn('Running with automatic fallback store so your app stays online and usable!');
    console.warn('----------------------------------------------------------------------\n');
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
