import * as fs from 'fs';
import * as path from 'path';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('ExamineHarvester');

interface ExamineEntry {
    id: string | number;
    name: string;
    examine: string;
    intent?: string;
}

interface ExamineAuthority {
    items: Record<string, ExamineEntry>;
    npcs: Record<string, ExamineEntry>;
    objects: Record<string, ExamineEntry>;
    principles: Record<string, ExamineEntry>;
    varbits: Record<string, ExamineEntry>;
}

const ATLAS_ROOT = 'D:\\sovereign\\atlas';
const PEDAGOGY_ROOT = 'D:\\sovereign\\memory\\pedagogy';
const OUTPUT_PATH = 'D:\\sovereign\\memory\\pedagogy\\RS3_Examine_Authority.json';

function walkDir(dir: string, callback: (filePath: string) => void) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath, callback);
        } else if (item.endsWith('.json')) {
            callback(fullPath);
        }
    }
}

async function harvest() {
    const authority: ExamineAuthority = {
        items: {},
        npcs: {},
        objects: {},
        principles: {},
        varbits: {}
    };

    logger.info('Starting RS3 Deep-Harvest (200k+ files)...');

    const processFile = (filePath: string) => {
        try {
            const fileName = path.basename(filePath);
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);
            
            // 1. Identify Entity Type
            let type: keyof ExamineAuthority | null = null;
            if (filePath.includes('atlas\\item') || fileName.startsWith('ITEM_')) type = 'items';
            else if (filePath.includes('npc') || fileName.startsWith('NPC_')) type = 'npcs';
            else if (filePath.includes('object') || fileName.startsWith('OBJ_')) type = 'objects';
            else if (fileName.startsWith('GROUP_PRINCIPLE_')) type = 'principles';
            else if (filePath.includes('varbits')) type = 'varbits';

            if (!type) return;

            // 2. Extract examine/role metadata
            const id = data.id !== undefined ? String(data.id) : (data.varid !== undefined ? String(data.varid) : null);
            if (!id) return;

            const examine = data.enrichment?.variables?.examine || 
                            data.economics?.description || 
                            data.semantics?.role || 
                            data.role ||
                            (type === 'varbits' ? `varid: ${data.varid}, bits: ${JSON.stringify(data.bits)}` : `examine ${type} #${id}`);
            
            authority[type][id] = {
                id,
                name: data.name || (type === 'varbits' ? `Varbit ${id}` : 'Unknown'),
                examine,
                intent: data.enrichment?.intent || data.semantics?.intent || data.intent
            };
        } catch (e) {
            // Ignore malformed files
        }
    };

    // 1. Deep scan of Atlas
    logger.info('Scanning Atlas Root...');
    walkDir(ATLAS_ROOT, processFile);

    // 2. Deep scan of Pedagogy
    logger.info('Scanning Pedagogy Root (High Density)...');
    walkDir(PEDAGOGY_ROOT, processFile);

    // Ensure output directory exists
    const outDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(authority, null, 2), 'utf8');

    logger.info({ 
        itemCount: Object.keys(authority.items).length,
        npcCount: Object.keys(authority.npcs).length,
        objCount: Object.keys(authority.objects).length,
        principleCount: Object.keys(authority.principles).length,
        varbitCount: Object.keys(authority.varbits).length
    }, 'RS3 Deep-Harvest Complete.');
}

harvest().catch(err => {
    logger.error({ error: err.message }, 'Harvest failed');
    process.exit(1);
});
