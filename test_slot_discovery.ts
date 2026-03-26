import { CacheForensicsLimb } from './src/limbs/spatial/CacheForensicsLimb.js';
import { setProjectRoot } from './src/utils/SovereignPathResolver.js';

setProjectRoot(process.cwd());

async function test() {
    const forensics = new CacheForensicsLimb();
    console.log('--- CacheForensicsLimb Health ---');
    console.log(await forensics.healthCheck());

    const slot = forensics.findItemSlot(35); // Excalibur
    console.log('--- findItemSlot(35) [Excalibur] ---');
    console.log('Detected Slot:', slot);

    if (slot === 'weapon') {
        console.log('SUCCESS: Slot correctly identified.');
    } else {
        console.log('FAILURE: Slot mismatch.');
    }
}

test();
