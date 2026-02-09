import HashUtil from './src/utils/hash.util.js';

async function generate() {
    const hash = await HashUtil.hash('password123');
    console.log('Hash for password123:', hash);
    
    const isValid = await HashUtil.compare('password123', hash);
    console.log('Validation test:', isValid);
}

generate();
