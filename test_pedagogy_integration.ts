import { PedagogyLimb } from './src/limbs/technical/PedagogyLimb.js';
import { YaoState } from './src/core/models.js';

async function main() {
    console.log('🧠 Booting PedagogyLimb for Integration Test...');
    const pedagogy = new PedagogyLimb();
    
    console.log(pedagogy.healthCheck().details);

    console.log('\n--- 🧪 Testing KBD (ID 50) ---');
    const resultKbd = await pedagogy.analyzeNpc(50, YaoState.OldYang);
    if (resultKbd.ok) {
        console.log('✅ KBD Pedagogy Profile Generated:');
        console.log(JSON.stringify(resultKbd.value, null, 2));
    } else {
        console.error('❌ Failed to analyze KBD:', resultKbd.error);
    }

    console.log('\n--- 🧪 Testing Player Template (ID 15516) ---');
    const resultPlayer = await pedagogy.analyzeNpc(15516, YaoState.YoungYin);
    if (resultPlayer.ok) {
        console.log('✅ Player Template Pedagogy Profile Generated:');
        console.log(JSON.stringify(resultPlayer.value, null, 2));
    } else {
        console.error('❌ Failed to analyze Player Template:', resultPlayer.error);
    }

    console.log('\nIntegration test complete.');
    process.exit(0);
}

main().catch(console.error);
