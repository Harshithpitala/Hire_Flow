require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const initSocketServer = require('./sockets/socketHandler');
const dns=require('dns');
dns.setServers(['1.1.1.1','8.8.8.8'])
const PORT = process.env.PORT || 5000;

// Create HTTP server instance wrapping Express
const server = http.createServer(app);

// Initialize Socket.IO instance attached to HTTP server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Initialize Socket listeners & room logic
initSocketServer(io);

// Expose io instance on app for controllers & services
app.set('io', io);

/**
 * Start Server Lifecycle
 */
const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`========================================`);
    console.log(` HireFlow Server running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Client URL:  ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`========================================`);
  });
};

startServer();

// Graceful process teardown
const gracefulShutdown = (signal) => {
  console.log(`\n[${signal}] Received. Closing HTTP server and database connections...`);
  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    try {
      await mongoose.connection.close(false);
      console.log('[MongoDB] Database connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('[Error] Error closing DB connection:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down immediately...', err);
  process.exit(1);
});