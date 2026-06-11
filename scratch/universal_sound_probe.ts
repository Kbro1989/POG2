
import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync } from 'fs';

const CACHE_DIR = 'C:\\ProgramData\\Jagex\\RuneScape';
const BACKUP_DIR = 'D:\\D-sovereign-\\cache_pedagogy\\RuneScape-BETA-Backup';

async function probeIndex(major: number, queries: string[]) {
    const path = join(CACHE_DIR, `js5-${major}.jcache`);
    const backupPath = join(BACKUP_DIR, `js5-${major}.jcache`);
    const finalPath = existsSync(path) ? path : (existsSync(backupPath) ? backupPath : null);

    if (!finalPath) {
        console.log(`\n[!] Index ${major} not found in either location.`);
        return;
    }

    console.log(`\n=== PROBING INDEX ${major}: ${finalPath} ===`);
    try {
        const db = new Database(finalPath, { readonly: true });

        // Always list tables first to ensure we are querying the right things
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
        console.log(`Tables: ${tables.map(t => t.name).join(', ')}`);

        for (const query of queries) {
            try {
                console.log(`\nExecuting: ${query}`);
                const results = db.prepare(query).all();
                console.log(JSON.stringify(results, null, 2));
            } catch (e: any) {
                console.error(`Query failed: ${e.message}`);
            }
        }
        db.close();
    } catch (e: any) {
        console.error(`Database error: ${e.message}`);
    }
}

async function run() {
    // Index 3: NPCs
    await probeIndex(3, [
        "PRAGMA table_info('npc_definitions')",
        "SELECT id, name FROM npc_definitions WHERE id = 50 LIMIT 1",
        "SELECT * FROM npc_definitions WHERE id = 50 LIMIT 1"
    ]);

    // Index 1: Items/Objects
    await probeIndex(1, [
        "PRAGMA table_info('item_definitions')",
        "PRAGMA table_info('object_definitions')",
        "SELECT * FROM item_definitions LIMIT 5"
    ]);

    // Index 12/20: Animations
    await probeIndex(12, [
        "PRAGMA table_info('sequence_definitions')",
        "PRAGMA table_info('animation_definitions')",
        "SELECT * FROM sequence_definitions LIMIT 5"
    ]);
    await probeIndex(20, [
        "PRAGMA table_info('sequence_definitions')",
        "PRAGMA table_info('animation_definitions')",
        "SELECT * FROM sequence_definitions LIMIT 5"
    ]);

    // Index 14: Sound Effects
    await probeIndex(14, [
        "PRAGMA table_info('archives')",
        "SELECT * FROM archives WHERE idx = 14 LIMIT 5",
        "SELECT name FROM sqlite_master WHERE type='table'"
    ]);

    // Index 2: Enums/Skill Mappings
    await probeIndex(2, [
        "SELECT name FROM sqlite_master WHERE type='table'",
        "SELECT * FROM enums WHERE name LIKE '%99%' OR name LIKE '%skill%' LIMIT 10"
    ]);

    // Index 5: Map/Region
    await probeIndex(5, [
        "SELECT name FROM sqlite_master WHERE type='table'",
        "SELECT * FROM archives WHERE idx = 5 LIMIT 5"
    ]);
}

run().catch(console.error);
