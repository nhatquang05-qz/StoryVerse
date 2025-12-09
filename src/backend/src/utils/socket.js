const { Server } = require("socket.io");

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: [
            "https://localhost:5173",
        ],
        methods: ["GET", "POST"],
        allowedHeaders: ["Authorization"],
        credentials: true 
      },
      transports: ['websocket', 'polling'] 
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io chưa được khởi tạo!');
    }
    return io;
  }
};