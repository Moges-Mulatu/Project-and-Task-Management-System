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

    const [rows] = await conn.execute('SELECT password FROM users WHERE email = ?', ['admin@debo.com']);
    if (!rows || rows.length === 0) {
      console.error('No admin row found');
      process.exit(1);
    }
    const hash = rows[0].password;
    console.log('Stored hash:', hash);

    const ok = await bcrypt.compare('password123', hash);
    console.log('bcrypt.compare result for password123:', ok);

    await conn.end();
  } catch (err) {
    console.error('Hash check failed:', err.message);
    process.exit(1);
  }
})();
