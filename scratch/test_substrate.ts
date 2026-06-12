import { GutenbergLimb } from './src/limbs/creative/GutenbergLimb.js';
import { PedagogyLimb } from './src/limbs/technical/PedagogyLimb.js';
import { SovereignConfig } from './src/core/models.js';
import { TernaryRouter } from './src/core/TernaryRouter.js';
import { VectorDB } from './src/utils/VectorDB.js';
import { ModelClient } from './src/core/ModelClient.js';
import { createLogger } from './src/utils/logger.js';

const config: SovereignConfig = {
    projectId: 'test',
    masterLocalModel: 'ollama',
    orchestratorModel: 'ollama',
    huggingfaceFallbackModel: 'ollama',
    wsPort: 8788
} as any;

const client = new ModelClient(config);
const vectorDB = new VectorDB({ client });
const router = new TernaryRouter(config, client, vectorDB);

async function test() {
    console.log('--- Substrate Alignment Test ---');
    
    const pedagogy = new PedagogyLimb(router, vectorDB, client);
    console.log('Initializing PedagogyLimb...');
    const pedInit = await pedagogy.initialize();
    console.log('Pedagogy Init:', pedInit.ok ? 'SUCCESS' : `FAILED: ${pedInit.error?.message}`);
    
    if (pedInit.ok) {
        const health = await pedagogy.healthCheck();
        console.log('Pedagogy Health:', health.details);
    }

    const gutenberg = new GutenbergLimb(router, vectorDB, client);
    gutenberg.enable();
    console.log('GutenbergLimb Enabled.');
    
    const gutHealth = await gutenberg.healthCheck();
    console.log('Gutenberg Health:', gutHealth.details);
    
    console.log('Attempting ingestion of Book 1 (Declaration of Independence)...');
    const ingestRes = await gutenberg.ingestBook(1, "The Declaration of Independence", "Thomas Jefferson", "history");
    console.log('Ingestion Result:', ingestRes.ok ? 'SUCCESS' : `FAILED: ${ingestRes.error?.message}`);
}

test().catch(console.error);
