import * as fs from "fs";
import * as path from "path";

const HANDLER_LINKS = "D:\\sovereign\\atlas\\spatial\\system_taxonomy\\npc_handler_links.json";
const OUTPUT_FILE = "D:\\sovereign\\atlas\\spatial\\system_taxonomy\\npc_script_mapping.json";

function run() {
    console.log("🧬 Decoding Sovereign NPC Handlers...");
    const rawData = JSON.parse(fs.readFileSync(HANDLER_LINKS, "utf-8"));
    
    const mapping: Record<number, any> = {};

    Object.keys(rawData).forEach(id => {
        const entry = rawData[id];
        const buf = Buffer.from(entry.params, 'hex');
        
        // Skip the opcode 0xF9 (249)
        const count = buf[1];
        const scripts: any[] = [];
        
        let offset = 2;
        for (let i = 0; i < count; i++) {
            if (offset + 4 > buf.length) break;
            const paramId = buf.readUIntBE(offset, 3);
            const type = buf[offset + 3];
            offset += 4;

            let value: any = null;
            if (type === 1) { // String
                const end = buf.indexOf(0, offset);
                if (end === -1) break; 
                value = buf.toString('utf-8', offset, end);
                offset = end + 1;
            } else { // Integer
                if (offset + 4 > buf.length) break;
                value = buf.readInt32BE(offset);
                offset += 4;
            }

            // Param IDs typically used for interaction scripts (Legacy list, needs forensic update)
            if ([4, 11, 21, 249].includes(paramId) || (value > 1000 && value < 50000 && type === 0)) {
                scripts.push({ paramId, value });
            }
        }

        if (scripts.length > 0) {
            (mapping as any)[id] = { id: Number(id), scripts };
        }
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mapping, null, 2));
    console.log(`✅ Success. Mapped scripts for ${Object.keys(mapping).length} NPCs.`);
}

run();
