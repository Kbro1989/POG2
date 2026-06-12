/**
 * NpcCollector.ts
 *
 * Dedicated pipeline for NPC/Monster data enrichment.
 * Routes through Bestiary API for combat stats and Wiki for drop tables.
 *
 * Sovereign Substrate: NPC/Monster Data Layer
 */

import { createLogger } from './logger.js';
import { CanonicalClock } from './CanonicalClock.js';
import { BestiaryApi, BestiaryBeastData } from './BestiaryApi.js';
import { WikiEquipmentEnricher, WikiMonsterMeta, WikiDropTable } from './WikiEquipmentEnricher.js';
import { EventBus } from '../events/EventBus.js';
import { LearningFidelity, TruthClass } from '../core/models.js';
import { SovereignSubstrate } from './SovereignSubstrate.js';

const logger = createLogger('NpcCollector');

export interface NpcData {
    name: string;
    beastData: BestiaryBeastData | null;
    dropTables: WikiDropTable[];
    cacheData: any;
    fetchedAt: number;
}

export class NpcCollector {
    private static instance: NpcCollector;
    private wikiEnricher: WikiEquipmentEnricher;
    private eventBus: EventBus;

    private constructor() {
        this.wikiEnricher = WikiEquipmentEnricher.getInstance();
        this.eventBus = EventBus.getInstance();
    }

    public static getInstance(): NpcCollector {
        if (!this.instance) {
            this.instance = new NpcCollector();
        }
        return this.instance;
    }

    public async collect(name: string): Promise<NpcData | null> {
        logger.info({ name }, 'Collecting NPC data...');

        // 0. Resolve ID from Bestiary or cache to allow forensic extraction
        const beastData = await BestiaryApi.enrichByName(name);
        const npcId = beastData?.id || 0; // Simplified ID resolution

        // 1. Resolve Dynamic Data via Substrate Forensics
        const cacheData = npcId > 0 ? await SovereignSubstrate.extractEntityData('probe_entity.ts', 'npc', npcId) : null;


        // 2. Resolve Wiki Data (Drops, Variables)
        const dropTables = await this.wikiEnricher.parseDropTables(name);

        const data: NpcData = {
            name: beastData?.name || name,
            beastData,
            dropTables,
            cacheData,
            fetchedAt: CanonicalClock.getInstance().simulatedNow()
        };

        // 3. Publish to training pipeline
        this.eventBus.publish({
            type: 'cognitive.learning',
            source: 'NpcCollector',
            payload: {
                tick: -1, 
                timestamp: CanonicalClock.getInstance().simulatedNow(),
                fidelity: LearningFidelity.PEDAGOGY,
                resolution: data,
                tags: ['npc_enrichment', 'bestiary_verified', 'substrate_forensic']
            }
        });

        return data;
    }
}

