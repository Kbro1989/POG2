/**
 * Lightweight Deep Kinematics Extraction Test
 */
import { TernaryRouter } from './src/routing/TernaryRouter.js';
import { ModelClient } from './src/clients/ModelClient.js';
import { VectorDB } from './src/utils/VectorDB.js';
import { KinematicsLimb } from './src/limbs/technical/KinematicsLimb.js';
import { loadConfig } from './src/config/SovereignConfig.js';
import { HexagramManager } from './src/routing/HexagramManager.js';
import { setProjectRoot } from './src/utils/SovereignPathResolver.js';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_FILE = join(homedir(), '.POG2-cli', 'config.json');
const config = loadConfig(CONFIG_FILE);

setProjectRoot(process.cwd());
const hexagram = new HexagramManager(null, process.cwd());
await hexagram.initialize();

const router = new TernaryRouter(config);
const client = new ModelClient(config, router);
router.setModelClient(client);

const vectorDB = new VectorDB({ client });
const limb = new KinematicsLimb(router, vectorDB, client);

console.log('🔬 DEEP Kinematics Extraction — Sequence 70');
console.log('━'.repeat(50));

const res = await limb.extractKinematics(70);

if (res.ok) {
    console.log('✅ Deep Kinematic Profile Extracted:');
    console.log(JSON.stringify(res.value, null, 2));
} else {
    console.error('❌ Extraction failed:', res.error?.message);
}

// Ensure the cache loader closes
limb.close();
process.exit(0);
