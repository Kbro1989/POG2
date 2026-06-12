import { HUDForensicsLimb } from '../src/limbs/spatial/HUDForensicsLimb.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    const forensics = new HUDForensicsLimb();
    const res = await forensics.getEquipmentWardrobe(); // 1797
    
    if (res.ok) {
        fs.writeFileSync(
            path.join(process.cwd(), 'scratch', 'interface_1797_dump.json'), 
            JSON.stringify(res.value, null, 2)
        );
        console.log("Dumped 1797 to interface_1797_dump.json");
    } else {
        console.error("Failed to dump 1797", res.error);
    }
}

main().catch(console.error);
