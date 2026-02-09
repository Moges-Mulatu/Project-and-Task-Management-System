import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api/v1`;

(async () => {
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'New', lastName: 'User',
        email: `newuser${Date.now()}@debo.com`,
        password: 'password123',
        role: 'admin'
      })
    });
    const body = await res.json();
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(body, null, 2));
  } catch (err) {
    console.error('Reg check failed:', err.message);
    process.exit(1);
  }
})();
