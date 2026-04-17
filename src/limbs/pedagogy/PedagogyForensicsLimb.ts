import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { createLogger } from '../../utils/logger.js';
import { Provenance, ProvenanceSource } from '../../core/models.js';

const logger = createLogger('PedagogyForensicsLimb');

/**
 * PedagogyForensicsLimb â€” The Instructional Substrate Auditor.
 * 
 * Manages the forensic links between pedagogical JSON instructions 
 * and the raw RS3 Cache substrate.
 */
export class PedagogyForensicsLimb {
    private static instance: PedagogyForensicsLimb;
    private readonly substratePath: string;
    private fileRegistry: Set<string> = new Set();
    private lookupMap: Map<string, string> = new Map(); // O(1) Lookup substrate

    private constructor(path: string = 'D:/sovereign/memory/pedagogy') {
        this.substratePath = path;
        this.initializeRegistry();
    }

    public static getInstance(): PedagogyForensicsLimb {
        if (!this.instance) {
            this.instance = new PedagogyForensicsLimb();
        }
        return this.instance;
    }

    /**
     * initializeRegistry - Scans the pedagogy directory for all instruction files.
     */
    private initializeRegistry() {
        try {
            if (existsSync(this.substratePath)) {
                const files = readdirSync(this.substratePath, { recursive: true }) as string[];
                files.forEach(f => {
                    if (f.endsWith('.json')) {
                        const normalized = f.replace(/\\/g, '/');
                        this.fileRegistry.add(normalized);
                        
                        // Populate lookup map for O(1) resolution
                        const fileName = normalized.split('/').pop()?.toLowerCase().replace('.json', '');
                        if (fileName) this.lookupMap.set(fileName, normalized);
                    }
                });
                console.log(`[PEDAGOGY] Registry initialized with ${this.fileRegistry.size} nodes.`);
                logger.info({ count: this.fileRegistry.size, path: this.substratePath }, 'Pedagogical File Registry initialized (O(1) mapping active).');


            }
        } catch (err) {
            logger.warn('Pedagogy substrate unavailable. Clinical tracing will be limited.');
        }
    }

    /**
     * resolvePedigree â€” Finds the specific instruction file for an entity or logic block.
     * Searches case-insensitively across normalized registry paths.
     */
    public resolvePedigree(identifier: string): string | null {
        const target = identifier.toLowerCase();
        
        // 1. O(1) Map Lookup (Optimal Path)
        const mapped = this.lookupMap.get(target);
        if (mapped) return mapped;

        // 2. Fragment match fallback (O(F) - Rare)
        for (const file of this.fileRegistry) {
            const fileName = file.split('/').pop()?.toLowerCase();
            if (fileName?.includes(target)) return file;
        }

        // 3. Systemic Logic Fallbacks
        if (target.includes('quest')) return 'logic/quest_manifest.json';
        if (target.includes('skill')) return 'logic/skill_manifest.json';
        if (target.includes('necro')) return 'logic/necromancy_logic.json';

        return null;
    }


    /**
     * buildProvenance â€” Constructs a multi-phase provenance chain.
     */
    public buildProvenance(entityId: string, substrateProv: Provenance): Provenance {
        const pedigree = this.resolvePedigree(entityId);
        
        if (!pedigree) return substrateProv;

        return {
            source: 'PEDAGOGY',
            recordId: pedigree,
            timestamp: Date.now(),
            path: join(this.substratePath, pedigree),
            ancestry: [substrateProv] // Link back to the raw global truth
        };
    }

    public healthCheck(): { online: boolean; details: string } {
        return {
            online: this.fileRegistry.size > 0,
            details: `Pedagogy Forensics active. ${this.fileRegistry.size} instruction nodes indexed.`
        };
    }
}
