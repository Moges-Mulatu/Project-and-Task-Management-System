import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const API_URL = 'http://localhost:5003/api/v1';

const test = async () => {
    try {
        // 1. Login
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@debo.com', password: 'password123' })
        });
        const { data: { token } } = await loginRes.json();
        console.log('✅ Login successful');

        // 2. Get Users
        const usersRes = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await usersRes.json();
        console.log('👥 Users found:', users.data?.length);

        // 3. Get Projects
        const projectsRes = await fetch(`${API_URL}/projects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const projects = await projectsRes.json();
        console.log('📂 Projects found:', projects.data?.length);

    } catch (err) {
        console.error('❌ Test failed:', err.message);
    }
};

test();
