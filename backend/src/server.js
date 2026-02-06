import dotenv from 'dotenv';
import app from './app.js';
import { initializeDatabase } from './config/db.config.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // 1. Initialize Database
        await initializeDatabase();
        console.log('📦 Database initialized successfully');

        // 2. Start Express Server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📡 Health Check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
