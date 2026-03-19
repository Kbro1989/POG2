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
interface CacheEntry {
    id: number;
    name: string;
}
interface SearchResult {
    id: number;
    name: string;
    type: 'npc' | 'item' | 'object';
    matchScore: number;
}
interface SearchOutput {
    query: string;
    type: string;
    mode: 'exact' | 'partial' | 'regex';
    totalResults: number;
    results: SearchResult[];
    timestamp: string;
}
declare function loadEntries(type: string): CacheEntry[];
declare function scoreMatch(name: string, query: string, mode: 'exact' | 'partial' | 'regex'): number;
declare function search(types: string[], query: string, mode?: 'exact' | 'partial' | 'regex', limit?: number): SearchResult[];
export { search, loadEntries, scoreMatch };
export type { SearchResult, SearchOutput, CacheEntry };
