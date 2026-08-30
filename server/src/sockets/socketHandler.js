/**
 * Socket.IO Connection & Room Management Hub
 */
const initSocketServer = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] New connection established: ${socket.id}`);

    // Join user-specific isolated room for targeted alerts
    socket.on('join_user_room', (userId) => {
      if (userId) {
        const roomName = `user_${userId}`;
        socket.join(roomName);
        console.log(`[Socket.IO] User ${userId} joined room: ${roomName}`);
      }
    });

    // Leave user room explicitly
    socket.on('leave_user_room', (userId) => {
      if (userId) {
        const roomName = `user_${userId}`;
        socket.leave(roomName);
        console.log(`[Socket.IO] User ${userId} left room: ${roomName}`);
      }
    });

    // Handle client disconnects
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocketServer;