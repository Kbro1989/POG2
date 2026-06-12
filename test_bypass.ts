
import { GutenbergLimb } from './src/limbs/creative/GutenbergLimb.js';
import { StoryboardLimbV2 } from './src/limbs/creative/StoryboardLimbV2.ts'; // Wait, need to check extension
import { ModelClient } from './src/clients/ModelClient.js';
import { VectorDB } from './src/utils/VectorDB.js';
import { HexagramManager } from './src/routing/HexagramManager.js';
import { BioIntelligenceLimb } from './src/limbs/spatial/BioIntelligenceLimb.js';
import { PedagogyLimb } from './src/limbs/technical/PedagogyLimb.js';
import { KinematicsLimb } from './src/limbs/technical/KinematicsLimb.js';
import { CacheForensicsLimb } from './src/limbs/spatial/CacheForensicsLimb.js';
import { TernaryRouter } from './src/routing/TernaryRouter.js';

async function test() {
    console.log("--- INITIALIZING TEST ---");
    const client = new ModelClient();
    const vectorDB = new VectorDB({ client });
    const gutenberg = new GutenbergLimb(client, vectorDB);

    console.log(`Gutenberg initial bypass state: ${gutenberg.isBypassed()}`);

    HexagramManager.initializeMock();
    const hexagram = HexagramManager.getInstance();
    const router = new TernaryRouter();
    const bioIntel = new BioIntelligenceLimb();
    const pedagogy = new PedagogyLimb(router, vectorDB, client);
    const kinematics = new KinematicsLimb(router, vectorDB, client);
    const forensics = CacheForensicsLimb.getInstance();

    console.log("--- INSTANTIATING STORYBOARD ---");
    const storyboard = new StoryboardLimbV2(
        client, 
        gutenberg, 
        hexagram, 
        vectorDB, 
        bioIntel, 
        pedagogy, 
        kinematics, 
        forensics
    );

    console.log(`Gutenberg bypass state after Storyboard instantiation: ${gutenberg.isBypassed()}`);
    
    if (!gutenberg.isBypassed()) {
        console.log("SUCCESS: Gutenberg correctly enabled by StoryboardLimbV2.");
    } else {
        console.log("FAILURE: Gutenberg still bypassed.");
    }
}

test().catch(console.error);
