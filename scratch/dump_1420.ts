import { HUDForensicsLimb } from '../src/limbs/spatial/HUDForensicsLimb.js';
import * as fs from 'fs';

async function main() {
    const limb = new HUDForensicsLimb("C:\\ProgramData\\Jagex\\RuneScape-BETA");
    const res = await limb.getInterface(1420);
    if (res.ok) {
        fs.writeFileSync("scratch/interface_1420.json", JSON.stringify(res.value, null, 2));
        console.log("Decompiled 1420 to scratch/interface_1420.json");
    } else {
        console.error("Failed to decompile 1420:", res.error);
    }
}

main().catch(console.error);
