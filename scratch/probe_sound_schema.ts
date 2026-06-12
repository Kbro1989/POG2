
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
        console.log(`Index ${major} not found in either location.`);
        return;
    }

    console.log(`\n=== PROBING INDEX ${major}: ${finalPath} ===`);
    try {
        const db = new Database(finalPath, { readonly: true });

        // List all tables
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
        console.log(`Tables found: ${tables.map(t => t.name).join(', ')}`);

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
    // NPCs (Index 3)
    await probeIndex(3, [
        "SELECT name FROM sqlite_master WHERE type='table'",
        "PRAGMA table_info('npc_definitions')",
        "SELECT * FROM npc_definitions WHERE id = 50 LIMIT 1",
        "SELECT id, name FROM npc_definitions WHERE id IS NOT NULL LIMIT 5"
    ]);

    // Items/Objects (Index 1)
    await probeIndex(1, [
        "SELECT name FROM sqlite_master WHERE type='table'",
        "PRAGMA table_info('item_definitions')",
        "PRAGMA table_info('object_definitions')",
        "SELECT * FROM item_definitions LIMIT 5"
    ]);

    // Animations (Index 12/20)
    await probeIndex(12, [
        "SELECT name FROM sqlite_master WHERE type='table'",
        "PRAGMA table_info('sequence_definitions')",
        "PRAGMA table_info('animation_definitions')"
    ]);

    // Sounds (Index 14)
    await probeIndex(14, [
        "SELECT name FROM sqlite_master WHERE type='table'",
        "PRAGMA table_info('cache')",
        "SELECT * FROM cache LIMIT 5"
    ]);
}

run();
