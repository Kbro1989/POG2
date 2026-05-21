import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function searchNPC(id: number) {
    try {
        const { stdout } = await execAsync(`npx tsx src/utils/rsmv_bridge.ts npc ${id}`);
        const data = JSON.parse(stdout);
        if (data.name && data.name.toLowerCase().includes('vorkath')) {
            return data;
        }
    } catch { }
    return null;
}

async function main() {
    console.log("Searching for Vorkath in NPC index...");
    // Check in reasonable ranges
    for (let i = 28000; i < 35000; i++) {
        const found = await searchNPC(i);
        if (found) {
            console.log(`FOUND Vorkath at ID: ${i} (${found.name})`);
        }
        if (i % 500 === 0) console.log(`Searching... up to ${i}`);
    }
}

main();
