/**
 * cache_name_search.ts - Forensic Name Search Proof-of-Work
 * 
 * CLI-driven name search across NPC, Item, and Object JSON exports.
 * Usage: npx tsx cache_name_search.ts --type npc --query "King Black Dragon"
 *        npx tsx cache_name_search.ts --type item --query "mask"
 *        npx tsx cache_name_search.ts --type all --query "dragon"
 * 
 * Substrate hook: Results feed EntityLimb.resolveByName() and
 * PedagogyLimb for contextual learning ("What IS a King Black Dragon?")
 */

import * as fs from 'fs';
import * as path from 'path';
import { getCachePedagogyFile } from './src/utils/SovereignPathResolver.js';

// ─── Types ───
interface CacheEntry {
    id: number;
    name: string;
}

interface SearchResult {
    id: number;
    name: string;
    type: 'npc' | 'item' | 'object';
    matchScore: number; // 1.0 = exact, 0.5 = partial, 0.0 = no match
}

interface SearchOutput {
    query: string;
    type: string;
    mode: 'exact' | 'partial' | 'regex';
    totalResults: number;
    results: SearchResult[];
    timestamp: string;
}

// ─── Config ───
const FILES: Record<string, string> = {
    npc: getCachePedagogyFile('npcs.json'),
    item: getCachePedagogyFile('items.json'),
    object: getCachePedagogyFile('objects.json'),
};

// ─── Search Engine ───
function loadEntries(type: string): CacheEntry[] {
    const filePath = FILES[type];
    if (!filePath || !fs.existsSync(filePath)) {
        console.error(`[ERROR] File not found for type '${type}': ${filePath}`);
        return [];
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function scoreMatch(name: string, query: string, mode: 'exact' | 'partial' | 'regex'): number {
    const lowerName = name.toLowerCase();
    const lowerQuery = query.toLowerCase();

    if (mode === 'exact') {
        return lowerName === lowerQuery ? 1.0 : 0.0;
    }
    if (mode === 'regex') {
        try {
            return new RegExp(query, 'i').test(name) ? 0.8 : 0.0;
        } catch {
            return 0.0;
        }
    }
    // Partial match
    if (lowerName === lowerQuery) return 1.0;
    if (lowerName.includes(lowerQuery)) return 0.7;
    return 0.0;
}

function search(
    types: string[],
    query: string,
    mode: 'exact' | 'partial' | 'regex' = 'partial',
    limit: number = 50
): SearchResult[] {
    const results: SearchResult[] = [];

    for (const type of types) {
        const entries = loadEntries(type);
        for (const entry of entries) {
            const score = scoreMatch(entry.name, query, mode);
            if (score > 0) {
                results.push({
                    id: entry.id,
                    name: entry.name,
                    type: type as 'npc' | 'item' | 'object',
                    matchScore: score,
                });
            }
        }
    }

    // Sort by score desc, then by ID asc
    results.sort((a, b) => b.matchScore - a.matchScore || a.id - b.id);
    return results.slice(0, limit);
}

// ─── CLI ───
function parseArgs(): { type: string; query: string; mode: 'exact' | 'partial' | 'regex'; limit: number; outputFile?: string } {
    const args = process.argv.slice(2);
    let type = 'all';
    let query = '';
    let mode: 'exact' | 'partial' | 'regex' = 'partial';
    let limit = 50;
    let outputFile: string | undefined;

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--type': type = args[++i]; break;
            case '--query': case '-q': query = args[++i]; break;
            case '--mode': mode = args[++i] as any; break;
            case '--limit': limit = parseInt(args[++i], 10); break;
            case '--output': case '-o': outputFile = args[++i]; break;
        }
    }

    if (!query) {
        console.log('Usage: npx tsx cache_name_search.ts --type [npc|item|object|all] --query "search term"');
        console.log('Options:');
        console.log('  --type   npc, item, object, or all (default: all)');
        console.log('  --query  Search term (required)');
        console.log('  --mode   exact, partial, or regex (default: partial)');
        console.log('  --limit  Max results (default: 50)');
        console.log('  --output Output file path (optional, defaults to stdout)');
        process.exit(1);
    }

    return { type, query, mode, limit, outputFile };
}

// ─── Main ───
async function main() {
    const { type, query, mode, limit, outputFile } = parseArgs();
    const types = type === 'all' ? ['npc', 'item', 'object'] : [type];

    console.log(`\n🔬 Cache Forensic Name Search`);
    console.log(`   Query: "${query}" | Type: ${type} | Mode: ${mode} | Limit: ${limit}\n`);

    const results = search(types, query, mode, limit);

    const output: SearchOutput = {
        query,
        type,
        mode,
        totalResults: results.length,
        results,
        timestamp: new Date().toISOString(),
    };

    // Console table output
    if (results.length === 0) {
        console.log('  No results found.');
    } else {
        console.log(`  Found ${results.length} matches:\n`);
        console.log('  ┌─────────┬──────────┬────────────────────────────────────────────┬───────┐');
        console.log('  │ Type    │ ID       │ Name                                       │ Score │');
        console.log('  ├─────────┼──────────┼────────────────────────────────────────────┼───────┤');
        for (const r of results) {
            const typeStr = r.type.padEnd(7);
            const idStr = String(r.id).padStart(8);
            const nameStr = r.name.padEnd(42).slice(0, 42);
            const scoreStr = r.matchScore.toFixed(1).padStart(5);
            console.log(`  │ ${typeStr} │ ${idStr} │ ${nameStr} │ ${scoreStr} │`);
        }
        console.log('  └─────────┴──────────┴────────────────────────────────────────────┴───────┘');
    }

    // File output
    if (outputFile) {
        fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
        console.log(`\n  → Results saved to ${outputFile}`);
    }

    // Also export for substrate import
    const pedagogyHint = results.slice(0, 5).map(r =>
        `${r.type}:${r.id} "${r.name}" [score=${r.matchScore}]`
    ).join('\n    ');
    console.log(`\n  🧠 Pedagogy Hint (top ${Math.min(5, results.length)}):`);
    console.log(`    ${pedagogyHint}`);
    console.log();
}

import { fileURLToPath } from 'url';
if (import.meta.url.startsWith('file:') && process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch(console.error);
}

// ─── Substrate Export ───
export { search, loadEntries, scoreMatch };
export type { SearchResult, SearchOutput, CacheEntry };
