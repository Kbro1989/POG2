import { rsmvBridge } from './src/utils/RSMVBridge.js';

async function test() {
    console.log('Probing rsmvBridge health...');
    const result = await rsmvBridge.healthCheck();
    if (result.ok) {
        console.log('✅ Bridge Online!');
        console.log(JSON.stringify(result.value, null, 2));

        console.log('Fetching Object 1...');
        const obj = await rsmvBridge.getObject(1);
        if (obj.ok) {
            console.log('✅ Object 1 found:', obj.value.name);
        } else {
            console.error('❌ Object 1 failed:', obj.error.message);
        }
    } else {
        console.error('❌ Bridge Offline:', result.error.message);
    }
}

test();
