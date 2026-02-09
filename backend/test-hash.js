const bcrypt = require('bcryptjs');

const storedHash = '$2b$10$tPx.U/xWd/B.Mh.iK8L3j.O30qGvOsg5uU6YyO6z.0P1uY.vOks.O';
const password = 'password123';

async function test() {
    const result = await bcrypt.compare(password, storedHash);
    console.log('Password match:', result);
    
    // Generate new hash with bcryptjs
    const newHash = await bcrypt.hash(password, 12);
    console.log('New hash:', newHash);
}

test();
