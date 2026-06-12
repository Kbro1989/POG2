import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';
const RSMV_PATH = 'D:/rsmv_inspector';

let GameCacheLoader: any;
let parse: any;

try {
    ({ GameCacheLoader } = require(path.join(RSMV_PATH, 'src', 'cache', 'sqlite.ts')));
    ({ parse } = require(path.join(RSMV_PATH, 'src', 'opdecoder.ts')));
} catch (e) {
    console.error('Failed to load RSMV modules:', (e as Error).message);
    process.exit(1);
}

function makeState(cache: any, buf: Buffer) {
    return {
        isWrite: false,
        buffer: buf,
        stack: [],
        hiddenstack: [],
        scan: 0,
        endoffset: buf.byteLength,
        args: { ...cache.getDecodeArgs(), clientVersion: 1149 }
    };
}

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    try {
        const dbRowsArchive = await cache.getArchiveById(2, 41);
        console.log(`Archive 2:41 (DBRows): ${dbRowsArchive.length} files`);
        
        let foundRows = [];
        let allStrings = new Set();
        
        for (const sub of dbRowsArchive) {
            if (!sub.buffer || sub.buffer.byteLength < 4) continue;
            try {
                const state = makeState(cache, sub.buffer);
                const result = parse.dbrows.parser.read(state);
                
                let hasSkillName = false;
                
                if (result.column_data) {
                    for (const col of result.column_data) {
                        for (const val of col.values) {
                            if (typeof val === 'string') {
                                allStrings.add(val.toLowerCase());
                                if (['necromancy', 'invention', 'archaeology', 'dungeoneering'].includes(val.toLowerCase())) {
                                    hasSkillName = true;
                                }
                            }
                        }
                    }
                }
                
                if (hasSkillName) {
                    foundRows.push({ id: sub.fileid, data: result });
                }
            } catch (e) {}
        }
        
        console.log(`Found ${foundRows.length} DBRows containing skill names`);
        
        // Find which table these belong to
        const tables = new Set();
        for (const r of foundRows) {
            if (r.data.tableId) tables.add(r.data.tableId);
        }
        console.log(`Tables involved: ${Array.from(tables).join(', ')}`);
        
        // Let's filter the rows that belong to those tables to see if there's a 30th skill
        for (const tableId of tables) {
            const rowsForTable = foundRows.filter(r => r.data.tableId === tableId);
            console.log(`\nTable ${tableId} has ${rowsForTable.length} rows with skill names.`);
            // Let's see what other names are in this table
            let allNames = [];
            
            for (const sub of dbRowsArchive) {
                if (!sub.buffer || sub.buffer.byteLength < 4) continue;
                try {
                    const state = makeState(cache, sub.buffer);
                    const result = parse.dbrows.parser.read(state);
                    if (result.tableId === tableId && result.column_data) {
                        for (const col of result.column_data) {
                            for (const val of col.values) {
                                if (typeof val === 'string' && val.length > 2) {
                                    allNames.push(val);
                                }
                            }
                        }
                    }
                } catch(e) {}
            }
            console.log(`Names in Table ${tableId}:`);
            console.log(allNames.filter((v, i, a) => a.indexOf(v) === i).join(', '));
        }
        
    } catch (e) {
        console.error(e);
    }
}

main().catch(console.error);
