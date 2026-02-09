const bcrypt = require('bcryptjs');

const passwords = [
    'admin@debo.com',
    'pm@debo.com', 
    'member@debo.com',
    'backend@debo.com',
    'frontend@debo.com',
    'mobile@debo.com',
    'ux@debo.com',
    'pm2@debo.com',
    'member2@debo.com'
];

async function generate() {
    const hash = await bcrypt.hash('password123', 12);
    console.log('bcryptjs hash for password123:');
    console.log(hash);
    
    // Verify
    const valid = await bcrypt.compare('password123', hash);
    console.log('\nVerification test:', valid);
}

generate();
