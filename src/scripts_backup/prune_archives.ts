/**
 * prune_archives.ts — One-shot script to remove redundant DB backup archives.
 * 
 * These files are confirmed stale generational copies of the canonical
 * D:\sovereign\memory\vibe-learning.db. Safe to delete.
 * 
 * Usage: npx tsx src/scripts/prune_archives.ts
 */

import { existsSync, statSync, unlinkSync } from 'fs';

const STALE_FILES = [
    'D:\\sovereign\\memory\\vibe-learning.db.bak',
    'D:\\sovereign\\archive\\memory_pre_compression.bak',
    'D:\\sovereign\\pog-coder-vibe\\vibe-learning.db',
    'D:\\sovereign\\archive\\legacy_learning_2026.db',
];

async function main() {
    console.log('🧬 Sovereign Archive Pruning');
    console.log('═'.repeat(50));

    let totalReclaimed = 0;
    let deletedCount = 0;

    for (const filePath of STALE_FILES) {
        if (!existsSync(filePath)) {
            console.log(`  ⊘ SKIP (not found): ${filePath}`);
            continue;
        }

        const sizeMB = statSync(filePath).size / (1024 * 1024);

        try {
            unlinkSync(filePath);
            totalReclaimed += sizeMB;
            deletedCount++;
            console.log(`  ✓ DELETED: ${filePath} (${sizeMB.toFixed(1)} MB)`);
        } catch (err) {
            console.error(`  ✗ FAILED: ${filePath} — ${(err as Error).message}`);
        }
    }

    console.log('═'.repeat(50));
    console.log(`\n  Pruned ${deletedCount}/${STALE_FILES.length} files.`);
    console.log(`  Total space reclaimed: ${totalReclaimed.toFixed(1)} MB (${(totalReclaimed / 1024).toFixed(2)} GB)`);
}

main();

