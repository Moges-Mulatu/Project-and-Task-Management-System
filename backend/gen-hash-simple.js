const bcrypt = require('bcryptjs');

const password = 'password123';
const hash = bcrypt.hashSync(password, 12);
console.log('password123 hash:', hash);
console.log('Verify:', bcrypt.compareSync(password, hash));
