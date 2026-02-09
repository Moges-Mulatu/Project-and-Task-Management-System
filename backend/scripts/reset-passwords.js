import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

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

    const hash = await bcrypt.hash('password123', 12);
    const [res] = await conn.execute('UPDATE users SET password = ?', [hash]);
    console.log('Updated users password hash to password123 for all rows.');
    await conn.end();
  } catch (err) {
    console.error('Reset passwords failed:', err.message);
    process.exit(1);
  }
})();
