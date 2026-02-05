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

        // ENSURE ADMIN EXISTS (Force Reset for consistency)
        try {
            const User = (await import('./models/user.model.js')).default;
            const pool = (await import('./config/db.config.js')).getDBConnection();

            // Delete and recreate to ensure fresh hash and correct role
            await pool.query('DELETE FROM users WHERE email = ?', ['admin@debo.com']);

            console.log('🛡️ Provisioning master admin user...');
            await User.create({
                firstName: 'System',
                lastName: 'Admin',
                email: 'admin@debo.com',
                password: 'password123',
                role: 'admin',
                department: 'Management',
                isActive: 1
            });
            console.log('✅ Admin provisioned: admin@debo.com / password123');
        } catch (e) {
            console.error('⚠️ Could not provision admin:', e.message);
        }

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
