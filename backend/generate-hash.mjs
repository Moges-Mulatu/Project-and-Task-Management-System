// ESM module to generate password hash using backend's HashUtil
import HashUtil from './src/utils/hash.util.js';

async function generate() {
    const password = 'password123';
    const hash = await HashUtil.hash(password);
    console.log('=================================');
    console.log('PASSWORD: password123');
    console.log('HASH:', hash);
    console.log('=================================');
    
    // Verify it works
    const valid = await HashUtil.compare(password, hash);
    console.log('VERIFICATION:', valid);
    console.log('=================================');
}

generate();
