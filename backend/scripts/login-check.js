import dotenv from 'dotenv';
import AuthService from '../src/services/auth.service.js';

dotenv.config({ path: './.env' });

(async () => {
  try {
    const result = await AuthService.login('admin@debo.com', 'password123');
    console.log('Login result:', result);
  } catch (err) {
    console.error('Login failed:', err.message);
    process.exit(1);
  }
})();
