
import { SovereignAvatar } from '../src/core/SovereignAvatar.js';
import { GameplaySovereigntyLimb } from '../src/limbs/spatial/GameplaySovereigntyLimb.js';

async function runTrialDeath() {
    console.log("--- STARTING TRIAL DEATH RUN ---");
    
    // 1. Setup Avatar & Inventory
    const avatar = new SovereignAvatar("PogHero");
    avatar.inventory[0] = { id: 4151, amount: 1 }; // Abyssal Whip
    avatar.inventory[1] = { id: 11283, amount: 1 }; // Draconic Visage
    avatar.inventory[2] = { id: 14484, amount: 1 }; // Dragon Claws
    avatar.inventory[3] = { id: 569, amount: 1 }; // Dragon Dagger (should be dropped)
    avatar.inventory[4] = { id: 995, amount: 10000 }; // Coins (should be dropped)

    // 2. Teleport to a death location (Edgeville Dungeon area)
    const deathCoord = { x: 3090, y: 9900, plane: 0 };
    avatar.x = deathCoord.x; 
    avatar.y = deathCoord.y;
    avatar.plane = deathCoord.plane;
    avatar.coord = { ...deathCoord };
    avatar.currentHp = 9900; // Full health

    // 3. Setup Gameplay Limb
    const limb = GameplaySovereigntyLimb.getInstance();
    // Inject our avatar into the singleton properly
    (limb as any).avatar = avatar;
    
    console.log(`[INIT] Avatar at (${avatar.x}, ${avatar.y}) with ${avatar.inventory.filter(i => i).length} items.`);

    // 4. Simulate Damage & Death
    console.log("[COMBAT] Avatar takes 10,000 damage!");
    avatar.applyDamage(10000);
    
    if (avatar.currentHp === 0) {
        // Trigger the authoritative death handler
        (limb as any).handlePlayerDeath();
    }

    // 5. Verify Respawn
    console.log(`[RESPAWN] Avatar now at (${avatar.x}, ${avatar.y}) [${avatar.currentHp} HP]`);
    console.log(`[INVENTORY] Items kept: ${avatar.inventory.filter(i => i).map(i => i?.id).join(', ')}`);

    // 6. Verify Grave
    const graveKey = "3090,9900,0";
    const grave = (limb as any).globalState.graves.get(graveKey);
    if (grave) {
        console.log(`[GRAVE] Grave Marker found at (${grave.x}, ${grave.y}) containing ${grave.items.length} items.`);
        console.log(`[GRAVE] Items inside: ${grave.items.map(i => i.id).join(', ')}`);
    } else {
        console.error("[ERROR] Grave Marker NOT SPAWNED!");
        process.exit(1);
    }

    // 7. Test Recovery (Grave-Run)
    console.log("[RUN] Walking back to grave...");
    avatar.x = 3090;
    avatar.y = 9900;
    avatar.coord = { x: 3090, y: 9900, plane: 0 };
    
    console.log("[ACTION] Recovering items from Grave...");
    const graveId = grave.id;
    limb.handleInteraction(graveId, 1); // Action 1: Pick Up

    console.log(`[FINAL] Inventory restored: ${avatar.inventory.filter(i => i).length} total items.`);
    console.log(`[FINAL] Inventory: ${avatar.inventory.filter(i => i).map(i => i?.id).join(', ')}`);
    console.log("--- TRIAL DEATH RUN COMPLETE ---");
}

runTrialDeath().catch(e => {
    console.error(e);
    process.exit(1);
});
