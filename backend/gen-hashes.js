const bcrypt = require('bcryptjs');

const password = 'password123';

async function generateHashes() {
    const users = [
        { id: 'u1-admin-001', email: 'admin@debo.com', role: 'admin' },
        { id: 'u2-pm-001', email: 'pm@debo.com', role: 'project_manager' },
        { id: 'u3-member-001', email: 'member@debo.com', role: 'team_member' },
        { id: 'u4-backend-001', email: 'backend@debo.com', role: 'team_member' },
        { id: 'u5-frontend-001', email: 'frontend@debo.com', role: 'team_member' },
        { id: 'u6-mobile-001', email: 'mobile@debo.com', role: 'team_member' },
        { id: 'u7-ux-001', email: 'ux@debo.com', role: 'team_member' },
        { id: 'u8-pm-002', email: 'pm2@debo.com', role: 'project_manager' },
        { id: 'u9-member-002', email: 'member2@debo.com', role: 'team_member' }
    ];

    for (const user of users) {
        const hash = await bcrypt.hash(password, 12);
        console.log(`${user.email}: ${hash}`);
    }
}

generateHashes();
