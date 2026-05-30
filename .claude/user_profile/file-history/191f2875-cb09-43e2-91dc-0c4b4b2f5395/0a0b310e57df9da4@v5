import { Result, ok, err } from '../core/models.js';
import { createLogger } from '../utils/logger.js';
import manifestData from '../assets/manifests/authentic_spawn_manifest.json';
import interactionVocabulary from '../../public/interaction_vocabulary.json';

const logger = createLogger('SovereignEntityResolver');

// ── Authentic Anchor Registry ──────────────────────────────────────
const AUTHENTIC_ANCHORS = new Set([
  'Banker', 'Bank booth', 'Guard', 'General Store assistant',
  'Shop assistant', 'Shop keeper', 'Grand Exchange clerk',
  'Fairy ring', 'Spirit tree', 'Lodestone', 'Portal',
  'Stairs', 'Ladder', 'Door', 'Gate'
]);

// ── Vocabulary Frequency Map ────────────────────────────────────────
const VOCAB_MAP: Map<string, number> = new Map(
  (interactionVocabulary.actions as [string, number][])
    .map(([action, freq]) => [action.toLowerCase(), freq])
);

function getActionFrequency(action: string): number {
  return VOCAB_MAP.get(action.toLowerCase().trim()) || 0;
}

// ── Context Inference Rules ───────────────────────────────────────
const CONTEXT_RULES: Array<{ pattern: RegExp; context: string; priority: number }> = [
  { pattern: /^(Bank|Withdraw|Deposit|Store|Fetch-from-bank|Unnote item)/i, context: 'bank', priority: 100 },
  { pattern: /^(Note produce|Note)/i, context: 'bank', priority: 95 },
  { pattern: /^(Buy|Sell|Purchase|Shop|Open shop|Open Store|Value)/i, context: 'shop', priority: 100 },
  { pattern: /^(Trade|Exchange|Offer|Merge with)/i, context: 'trade', priority: 90 },
  { pattern: /^(Wield|Wear|Equip|Remove|Custom-fit)/i, context: 'wield', priority: 100 },
  { pattern: /^(Pick up|Take|Pick-up|Take-from|Loot)/i, context: 'ground', priority: 100 },
  { pattern: /^(Drop|Destroy|Empty|Clear)/i, context: 'inventory', priority: 80 },
  { pattern: /^(Talk to|Talk|Talk-At|Chat|Speak-with)/i, context: 'npc_dialogue', priority: 100 },
  { pattern: /^(Chop|Mine|Fish|Cook|Craft|Fletch|Smith|Runecraft|Thieve|Pickpocket|Hunt)/i, context: 'skill_action', priority: 70 },
];


interface ManifestEntity {
    id: string;
    title: string;
    entityId: number;
    actions: string[];
    meta: Record<string, any>;
}

interface Manifest {
    version: string;
    entities: ManifestEntity[];
}

export interface EntityHUDData {
    name: string;
    type: 'npc' | 'item' | 'object' | 'loc';
    sovereignId: string;
    stats: {
        combat?: number;
        level?: number;
        requirements?: Record<string, number>;
        degradation?: { charges: number; max: number };
    };
    actionables: Array<{
        action: string;
        requirements: string[];
        effect: string;
    }>;
    pedagogy: {
        description: string;
        examine: string;
    };
    emotionalWeight: Record<string, number>;
    hexagramPin: {
        id: number;
        name: string;
        line: number;
    };
}

/**
 * SovereignEntityResolver
 *
 * Bridges raw entity IDs to the "Sovereign Truth" (Manifests) and
 * "Cached Truth" (R2/KV mirror of the game cache).
 *
 * Refactored for DO compatibility:
 * 1. No subprocesses (spawn).
 * 2. No local filesystem (fs).
 * 3. Uses bundled JSON for manifest and environment bindings for cache data.
 */
export class SovereignEntityResolver {
    private static instance: SovereignEntityResolver;
    private manifest: Manifest;
    private env: any = null;

    public static getInstance(): SovereignEntityResolver {
        if (!SovereignEntityResolver.instance) {
            SovereignEntityResolver.instance = new SovereignEntityResolver();
        }
        return SovereignEntityResolver.instance;
    }

    private constructor() {
        this.manifest = manifestData;
        logger.info(`Sovereign Manifest Initialized: ${this.manifest.entities.length} entities grounded.`);
    }

    /**
     * initialize - Binds the Durable Object environment (KV, R2).
     */
    public initialize(env: any): void {
        this.env = env;
        logger.info('SovereignEntityResolver bound to DO environment.');
    }

    /**
     * resolve - Maps a raw entityId to a high-fidelity HUD data object.
     */
    public async resolve(entityId: number): Promise<Result<EntityHUDData>> {
        // 1. Find Ground Truth in bundled manifest
        const truth = this.manifest.entities.find(e => e.entityId === entityId);

        // 2. Fetch raw cache la-Sovereign data from the environment (R2/KV)
        // In a DO, we no longer call a subprocess. We fetch pre-extracted JSON dumps.
        const rawData = await this.fetchRawCacheData(entityId);

        // 3. Map to HUD format
        const type = this.determineType(rawData);
        return ok(this.mapToHUD(rawData, type, truth, entityId));
    }

    private async fetchRawCacheData(entityId: number): Promise<any> {
        if (!this.env || !this.env.SOVEREIGN_CACHE) {
            logger.warn('No cache binding found. Using empty raw data.');
            return {};
        }

        try {
            // We assume the cache has been dumped to KV/R2 as "cache:npc:<id>", etc.
            // This is the "Sovereign Mirror" pattern.
            const data = await this.env.SOVEREIGN_CACHE.get(`entity:${entityId}`);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            logger.error({ err: e }, `Failed to fetch cache data for ${entityId}`);
            return {};
        }
    }

    private determineType(raw: any): EntityHUDData['type'] {
        if (raw.combatLevel !== undefined || raw.npc) return 'npc';
        if (raw.isEquippable || raw.equipSlotId !== undefined) return 'item';
        if (raw.sizeX !== undefined || raw.object) return 'object';
        return 'loc';
    }

    private mapToHUD(raw: any, type: EntityHUDData['type'], truth: ManifestEntity | undefined, fallbackId?: number): EntityHUDData {
        const id = truth?.id || `S-${type.toUpperCase()}-${raw.id || fallbackId}`;

        return {
            name: truth?.title || raw.name || `Entity ${fallbackId}`,
            type,
            sovereignId: id,
            stats: {
                combat: raw.combatLevel || 0,
                level: raw.combatLevel || 0,
                requirements: {}, // To be filled by PedagogyBridge
                degradation: this.parseDegradation(raw.extra)
            },
            actionables: (truth?.actions || raw.actions || []).map(act => ({
                action: act,
                requirements: this.inferRequirements(act, raw),
                effect: this.inferActionEffect(act)
            })),
            pedagogy: {
                description: truth?.meta?.description || 'No pedagogical grounding available.',
                examine: truth?.meta?.examine || 'Observation inconclusive.'
            },
            emotionalWeight: {}, // To be filled by PedagogyBridge
            hexagramPin: {
                id: 0,
                name: 'The Void',
                line: 0
            }
        };
    }

    private parseDegradation(extra: any): { charges: number, max: number } {
        if (!extra || !Array.isArray(extra)) return { charges: 0, max: 0 };

        const chargesProp = extra.find((e: any) => e.prop === 7479);
        const variantProp = extra.find((e: any) => e.prop === 7480);

        const charges = chargesProp?.intvalue || 0;

        let max = 100000; // Standard trimmed masterwork
        if (variantProp?.intvalue === 1) max = 200000; // Custom-fit

        return { charges, max };
    }

    private inferActionEffect(action: string): string {
        const lower = action.toLowerCase();
        if (lower.includes('attack') || lower.includes('strike')) return 'initiate_combat';
        if (lower.includes('talk') || lower.includes('chat')) return 'open_dialogue';
        if (lower.includes('pickpocket') || lower.includes('steal')) return 'attempt_thieving';
        if (lower.includes('capture')) return 'initiate_capture';
        if (lower.includes('check') || lower.includes('inspect')) return 'display_status';
        if (lower.includes('remove') || lower.includes('unequip')) return 'unequip_item';
        if (lower.includes('wield') || lower.includes('equip')) return 'equip_item';
        if (lower.includes('use') || lower.includes('activate')) return 'interact_object';
        if (lower.includes('examine') || lower.includes('look')) return 'perform_inspection';
        return 'generic_interaction';
    }

    private inferRequirements(action: string, raw: any): string[] {
        const lower = action.toLowerCase();
        const reqs: string[] = [];

        if (lower.includes('attack') || lower.includes('strike')) {
            if (raw.combatLevel) reqs.push(`combat >= ${raw.combatLevel}`);
        }
        if (lower.includes('wield') || lower.includes('equip')) {
            if (raw.combatLevel) reqs.push(`level >= ${raw.combatLevel}`);
        }

        return reqs;
    }
}
