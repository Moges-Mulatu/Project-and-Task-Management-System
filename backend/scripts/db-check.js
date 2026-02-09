import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3308,
      database: process.env.DB_NAME || 'project_management'
    });

    const [rows] = await conn.execute('SELECT id, email, password, role, isActive FROM users WHERE email = ?', ['admin@debo.com']);
    console.log('DB rows:', JSON.stringify(rows, null, 2));
    await conn.end();
  } catch (err) {
    console.error('DB check failed:', err.message);
    process.exit(1);
  }
})();
