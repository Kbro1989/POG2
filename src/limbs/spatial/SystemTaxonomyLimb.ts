import { createRequire } from 'module';
import * as path from 'path';
const require = createRequire(import.meta.url);
let GameCacheLoader: any = null;
let parse: any = null;

import { Result, ok, err } from '../../core/models.js';
import { createLogger } from "../../utils/logger.js";
import { getRSMVCachePath, getCachePedagogyPath, getRSMVSubstratePath } from '../../utils/SovereignPathResolver.js';

const RSMV = getRSMVSubstratePath();
try { ({ GameCacheLoader } = require(path.join(RSMV, 'src', 'cache', 'sqlite.js'))); } catch {}
try { ({ parse } = require(path.join(RSMV, 'src', 'opdecoder.js'))); } catch {}
import * as fs from 'fs';

const logger = createLogger('SystemTaxonomyLimb');

/**
 * SystemTaxonomyLimb - Extractor for systemic relational layers.
 * Extracts Cache Major 2, Minors 40 (dbtables) and 41 (dbrows) to anchor
 * deeply relational datastores (e.g. Archaeology paths, Currency values) 
 * into the Sovereign Atlas.
 */
export class SystemTaxonomyLimb {
    private readonly cachePath = getRSMVCachePath();
    private readonly outDir = getCachePedagogyPath();
    private cache: any | null = null;
    
    constructor() {
        try {
            if (GameCacheLoader) {
                this.cache = new GameCacheLoader(this.cachePath);
                logger.info({ path: this.cachePath }, 'SystemTaxonomyLimb connected to substrate.');
            } else {
                logger.warn('SystemTaxonomyLimb: GameCacheLoader not available.');
            }
        } catch (e) {
            logger.error({ error: (e as Error).message }, 'Failed to connect GameCacheLoader.');
        }
    }

    /**
     * Extracts DB Tables and DB Rows into a cohesive relational JSON.
     */
    public async extractSystemTaxonomy(): Promise<Result<boolean>> {
        if (!this.cache) return err(new Error('Cache connection offline.'));
        if (!parse || !parse.dbtables || !parse.dbrows) return err(new Error('Required RS3 parsers (dbtables/dbrows) not available.'));

        try {
            logger.info('Commencing System Taxonomy Extraction (Major 2, Page 40/41)...');
            const MAJOR_CONFIG = 2;
            const ARCHIVE_DBTABLES = 40;
            const ARCHIVE_DBROWS = 41;

            const tablesArchive = await this.cache.getArchiveById(MAJOR_CONFIG, ARCHIVE_DBTABLES);
            const tables: Record<number, any> = {};
            for (const f of tablesArchive) {
                try {
                    tables[f.fileid] = parse.dbtables.read(f.buffer, this.cache);
                    tables[f.fileid].id = f.fileid;
                } catch (e) {
                    // skip malformed entries
                }
            }

            const rowsArchive = await this.cache.getArchiveById(MAJOR_CONFIG, ARCHIVE_DBROWS);
            const rows: Record<number, any> = {};
            for (const f of rowsArchive) {
                try {
                    rows[f.fileid] = parse.dbrows.read(f.buffer, this.cache);
                    rows[f.fileid].id = f.fileid;
                } catch (e) {
                    // skip malformed entries
                }
            }

            const payload = {
                metadata: {
                    extractedAt: new Date().toISOString(),
                    tableCount: Object.keys(tables).length,
                    rowCount: Object.keys(rows).length
                },
                tables,
                rows
            };

            const outPath = path.join(this.outDir, 'dbtables.json');
            fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));

            logger.info({ path: outPath, tables: payload.metadata.tableCount }, 'System Taxonomy successfully anchored.');
            return ok(true);
        } catch (error) {
            logger.error({ error: (error as Error).message }, 'System Taxonomy Extraction Failed.');
            return err(error as Error);
        }
    }

    public healthCheck(): { online: boolean; details: string; status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' } {
        const cacheExists = this.cache !== null;
        let status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' = 'ONLINE';
        let details = `Systax: ${cacheExists ? 'NOMINAL' : 'OFFLINE'}`;

        if (!cacheExists) {
            status = 'OFFLINE';
        }
        return { online: cacheExists, details, status };
    }

    public close() {
        if (this.cache) {
            try {
                this.cache.close();
                this.cache = null;
                logger.info('SystemTaxonomyLimb cache connection closed.');
            } catch (e) {}
        }
    }
}
