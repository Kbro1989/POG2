/**
 * ItemCollector.ts
 *
 * Dedicated pipeline for Item data enrichment.
 * Routes through GeApi for authoritative price data and Wiki for meta/bonuses.
 *
 * Sovereign Substrate: Item Data Layer
 */

import { createLogger } from './logger.js';
import { GeApi } from './GeApi.js';
import { WikiEquipmentEnricher, WikiItemMeta, WikiEquipmentBonuses } from './WikiEquipmentEnricher.js';
import { CacheForensicsLimb } from '../limbs/spatial/CacheForensicsLimb.js';
import { EventBus } from '../events/EventBus.js';
import { LearningFidelity, TruthClass } from '../core/models.js';

const logger = createLogger('ItemCollector');

export interface ItemData {
    name: string;
    meta: WikiItemMeta | null;
    bonuses: WikiEquipmentBonuses | null;
    fetchedAt: number;
}

export class ItemCollector {
    private static instance: ItemCollector;
    private wikiEnricher: WikiEquipmentEnricher;
    private eventBus: EventBus;

    private constructor() {
        this.wikiEnricher = WikiEquipmentEnricher.getInstance();
        this.eventBus = EventBus.getInstance();
    }

    public static getInstance(): ItemCollector {
        if (!this.instance) {
            this.instance = new ItemCollector();
        }
        return this.instance;
    }

    public async collect(name: string): Promise<ItemData | null> {
        logger.info({ name }, 'Collecting Item data...');

        // 1. Resolve Wiki Meta and Bonuses
        const meta = await this.wikiEnricher.parseItemMeta(name);
        const bonuses = await this.wikiEnricher.parseEquipmentBonuses(name);

        // 2. Enrich with authoritative GE data
        if (meta) {
            // Need to ensure we use the ID for GeApi if possible
            const resolution = await CacheForensicsLimb.getInstance().resolveWikiTitle(name);
            const identifier = resolution.primaryId ? Number(resolution.primaryId) : name;
            const gePrice = await GeApi.getLatestPrice(identifier as any); 
            if (gePrice) {
                meta.geValue = gePrice.price;
                meta._geSource = gePrice.source;
                meta._geTimestamp = gePrice.timestamp;
            }
        }

        const data: ItemData = {
            name: meta?.name || name,
            meta,
            bonuses,
            fetchedAt: Date.now()
        };

        // 3. Publish to training pipeline
        this.eventBus.publish({
            type: 'cognitive.learning',
            source: 'ItemCollector',
            payload: {
                tick: -1,
                timestamp: Date.now(),
                fidelity: LearningFidelity.PEDAGOGY,
                resolution: data,
                tags: ['item_enrichment', 'ge_verified']
            }
        });

        return data;
    }
}

