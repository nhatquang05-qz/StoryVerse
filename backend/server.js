require('dotenv').config();
const app = require('./src/app');
const http = require('http'); 
const socket = require('./src/utils/socket');
const { connectDB, closeDB } = require('./src/db/connection');
const { PORT } = require('./src/config/appConfig');

const startServer = async () => {
    try {
        await connectDB();
        
        const server = http.createServer(app);
        const io = socket.init(server);

        io.on('connection', (clientSocket) => {
            console.log('Client connected:', clientSocket.id);

            clientSocket.on('join_room', (room) => {
                clientSocket.join(room);
                console.log(`User ${clientSocket.id} joined room: ${room}`);
            });

            clientSocket.on('leave_room', (room) => {
                clientSocket.leave(room);
                console.log(`User ${clientSocket.id} left room: ${room}`);
            });
            
            clientSocket.on('disconnect', () => {
                console.log('Client disconnected:', clientSocket.id);
            });
        });

        // [UPDATE] Sử dụng server.listen thay vì app.listen
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

process.on('SIGINT', async () => {
    await closeDB();
    console.log('Server shutting down.');
    process.exit(0);
});