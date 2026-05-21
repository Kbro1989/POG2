import { HUDForensicsLimb } from '../src/limbs/spatial/HUDForensicsLimb.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    const forensics = new HUDForensicsLimb();
    const res = await forensics.getCharacterCreation();
    
    if (res.ok) {
        fs.writeFileSync(
            path.join(process.cwd(), 'scratch', 'interface_1420_dump.json'), 
            JSON.stringify(res.value, null, 2)
        );
        console.log("Dumped 1420 to interface_1420_dump.json");
    } else {
        console.error("Failed to dump 1420", res.error);
    }
}

main().catch(console.error);
