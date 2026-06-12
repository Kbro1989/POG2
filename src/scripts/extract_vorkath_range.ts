import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';

const execAsync = promisify(exec);

async function extractNPC(id: number) {
    try {
        const { stdout } = await execAsync(`npx tsx src/utils/rsmv_bridge.ts npc ${id}`);
        return JSON.parse(stdout);
    } catch {
        return null;
    }
}

async function main() {
    const start = 15516;
    const end = 15582;
    const results = [];

    console.log(`Extracting NPCs ${start}-${end}...`);
    for (let id = start; id <= end; id++) {
        const npc = await extractNPC(id);
        if (npc) {
            results.push(npc);
            console.log(`[${id}] ${npc.name || 'Unknown'}`);
        }
    }

    const outputPath = 'D:\\sovereign\\atlas\\system\\vorkath_range_raw.json';
    await writeFile(outputPath, JSON.stringify(results, null, 2));
    console.log(`Success: Extracted ${results.length} NPCs to ${outputPath}`);
}

main();

