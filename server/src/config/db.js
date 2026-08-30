const mongoose = require('mongoose');

/**
 * Connects to MongoDB with connection pooling and event listeners.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
      socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Active Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

// Monitor ongoing Mongoose connection events
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Warning: Database disconnected. Attempting reconnection...');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Database reconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB Runtime Error]: ${err.message}`);
});

module.exports = connectDB;