const bcrypt = require('bcryptjs');

const password = 'password123';
const saltRounds = 12;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('HASH:', hash);
    
    bcrypt.compare(password, hash, function(err, result) {
        console.log('MATCH:', result);
    });
});
