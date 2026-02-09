import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

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

    // Add u3-member-001 to t1-backend-01
    const id = 'tm1-03';
    const teamId = 't1-backend-01';
    const userId = 'u3-member-001';

    // Check existing membership
    const [existing] = await conn.execute('SELECT * FROM team_members WHERE teamId = ? AND userId = ?', [teamId, userId]);
    if (existing.length === 0) {
      await conn.execute('INSERT INTO team_members (id, teamId, userId, role, assignedBy, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())', [id, teamId, userId, 'member', 'u1-admin-001', 1]);
      // Update team count
      await conn.execute('UPDATE teams SET currentMemberCount = currentMemberCount + 1, updatedAt = NOW() WHERE id = ?', [teamId]);
      console.log('Added member u3-member-001 to t1-backend-01');
    } else {
      console.log('Membership already exists');
    }

    await conn.end();
  } catch (err) {
    console.error('Add member failed:', err.message);
    process.exit(1);
  }
})();
