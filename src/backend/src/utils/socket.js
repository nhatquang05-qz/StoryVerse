const { Server } = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

    io = new Server(httpServer, {
      cors: {
        origin: corsOrigin, 

        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};