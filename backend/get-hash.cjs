const HashUtil = require('./src/utils/hash.util.js').default;

async function main() {
    const password = 'password123';
    const hash = await HashUtil.hash(password);
    console.log('HASH:', hash);
    
    const valid = await HashUtil.compare(password, hash);
    console.log('VALID:', valid);
}

main().catch(console.error);
