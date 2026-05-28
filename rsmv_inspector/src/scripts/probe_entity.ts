import { GameCacheLoader } from "../cache/sqlite";
import { cacheMajors } from "../constants";
import { FileParser } from "../opdecoder";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function probeEntity(type: string, id: number) {
    const loader = new GameCacheLoader(CACHE_DIR);
    
    // Map type to cache major
    let major: number;
    let opcodeFile: string;
    
    switch(type.toLowerCase()) {
        case 'item': major = cacheMajors.items; opcodeFile = 'items.jsonc'; break;
        case 'npc': major = cacheMajors.npcs; opcodeFile = 'npcs.jsonc'; break;
        case 'object': major = cacheMajors.objects; opcodeFile = 'objects.jsonc'; break;
        default: throw new Error(`Unknown type: ${type}`);
    }

    // Load definition
    const defPath = path.join(__dirname, '..', 'opcodes', opcodeFile);
    const def = fs.readFileSync(defPath, 'utf-8');
    const parser = FileParser.fromJson(def);

    // Fetch and decode
    const buf = await loader.getFile(major, id, 0);
    if (!buf) {
        console.error(JSON.stringify({ error: 'Entity not found', id, type }));
        return;
    }

    const decoded = parser.read(buf, loader.engine.rawsource);
    console.log(JSON.stringify(decoded));
    loader.close();
}

const args = process.argv.slice(2);
const typeIdx = args.indexOf('--type');
const idIdx = args.indexOf('--id');

if (typeIdx === -1 || idIdx === -1) {
    console.error('Usage: ts-node probe_entity.ts --type <item|npc|object> --id <id>');
    process.exit(1);
}

const type = args[typeIdx + 1];
const id = parseInt(args[idIdx + 1]);

probeEntity(type, id).catch(err => {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
});
