
import { GameplaySovereigntyLimb } from "../src/limbs/spatial/GameplaySovereigntyLimb.js";

async function dumpLiveNpcs() {
    const gameplay = GameplaySovereigntyLimb.getInstance();
    const npcs = Array.from(gameplay.globalState.npcMap.values());
    
    console.log(`📡 Current Global State NPC Count: ${npcs.length}`);
    npcs.forEach(npc => {
        console.log(`   - [ID: ${npc.id}] ${npc.name || 'Unknown'} at (${npc.x}, ${npc.y}, ${npc.plane})`);
    });

    const player = gameplay.avatar;
    console.log(`👤 Player Position: (${player.coord.x}, ${player.coord.y}, ${player.coord.plane})`);
}

dumpLiveNpcs().catch(console.error);
