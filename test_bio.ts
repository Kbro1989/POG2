import { BioIntelligenceLimb } from './src/limbs/spatial/BioIntelligenceLimb.js';

async function test() {
    const bio = new BioIntelligenceLimb();
    
    console.log("NPC 15516 Classification:", bio.classifyNPC(15516));
    console.log("NPC 15580 Classification:", bio.classifyNPC(15580));
    console.log("NPC 15516 Phase Logic:", JSON.stringify(bio.getPhaseLogic(15516), null, 2));
}

test();
