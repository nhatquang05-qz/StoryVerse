const app = require('./src/app');
const { connectDB, closeDB } = require('./src/db/connection');
const { PORT } = require('./src/config/appConfig');

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
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
    process.exit();
});