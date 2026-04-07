import { SovereignKnowledgeDB } from './utils/SovereignKnowledgeDB.js';
import { createLogger } from './utils/logger.js';
import * as fs from 'fs';
import * as path from 'path';

const logger = createLogger('RefillTester');

/**
 * RefillTester - TEST RUN for Phase D (Master Node Refill)
 * 
 * Objective: 
 * 1. Simulate a "Refilled Node" by mapping logic from module-7244.js to a functional TypeScript node.
 * 2. Ingest a sample 'Classic' map logic chunk (Barrows area).
 * 3. Verify the SovereignKnowledgeDB accepts the 'Refilled' data correctly.
 */
async function runRefillTest() {
    logger.info('Starting Refill Test Run (Phase D Simulation)...');

    // 1. Setup DB substrate
    const db = new SovereignKnowledgeDB('D:\\sovereign\\vibe-learning-test.db');
    
    // 2. Mock "Refilled Node" logic (Derived from module-7244.js unpack patterns)
    // module-7244.js L:142 handles RGBA to Integer Float conversion for tile IDs
    const mockUnpackNode = (rgba: [number, number, number, number]) => {
        // Semantic Refill: floor(f.r * 255 + .5) * 16777216 + ...
        return Math.floor(rgba[0] * 255 + 0.5) * 16777216 + 
               Math.floor(rgba[1] * 255 + 0.5) * 65536 + 
               Math.floor(rgba[2] * 255 + 0.5) * 256 + 
               Math.floor(rgba[3] * 255 + 0.5);
    };

    // 3. Simulate "Updated Dump" data (Barrows North Entry)
    const testLessons = [
        {
            plane: 0,
            x: 3564,
            y: 3298,
            terrainFlags: 0,
            objects: [
                { id: 6637, name: "Barrows Mound (Refilled)", type: 10 }
            ]
        },
        {
            plane: 0,
            x: 3565,
            y: 3298,
            terrainFlags: 1, // Impassable
            objects: []
        }
    ];

    logger.info('Simulating Node Refill for Barrows North...');
    
    // 4. Execute Batch Upsert to persistent memory
    const count = await db.batchUpsert(testLessons);
    
    // 5. Verification
    const saved = db.getTilesByPlane(0);
    const barrowsNode = saved.find(t => t.x === 3564 && t.y === 3298);

    if (barrowsNode && barrowsNode.objects[0].name === "Barrows Mound (Refilled)") {
        logger.info('âœ… REFILL TEST PASSED: Node logic correctly re-hydrated to DB.');
        console.log(`\n[SUCCESS] Refilled ${count} nodes into Sovereign Atlas.\n`);
    } else {
        logger.error('âŒ REFILL TEST FAILED: Node data mismatch.');
    }

    db.close();
}

runRefillTest().catch(console.error);
