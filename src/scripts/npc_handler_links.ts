import { GameCacheLoader } from "rsmv/cache/sqlite";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const OUTPUT_FILE = "D:\\sovereign\\atlas\\spatial\\system_taxonomy\\npc_handler_links.json";

async function run() {
    console.log("🚀 Sovereign NPC Handler Extraction — Major 18 Param Scrutiny");
    const source = new GameCacheLoader(CACHE_DIR);

    const npcIndex = await source.getCacheIndex(18);
    const handlerLinks: Record<number, any> = {};

    for (const group of npcIndex) {
        if (!group) continue;
        const arch = await source.getFileArchive(group);
        for (const file of arch) {
            const buf = file.buffer;
            const npcId = group.minor * 128 + file.fileid;

            // Forensic Opcode Scan for Param Map (Opcode 249)
            // Format: [Opcode 249 (byte)] [Count (byte)] [ {ParamID (24-bit), ValueType (byte), Value (var)} ... ]
            // We'll search for the byte 0xF9 (249)
            const paramIdx = buf.indexOf(0xF9);
            if (paramIdx !== -1) {
                handlerLinks[npcId] = { id: npcId, params: buf.slice(paramIdx).toString('hex') };
            }
        }
    }

    if (!fs.existsSync(path.dirname(OUTPUT_FILE))) fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(handlerLinks, null, 2));
    console.log(`✅ Extraction Complete. Found params for ${Object.keys(handlerLinks).length} NPCs.`);
}

run().catch(console.error);
