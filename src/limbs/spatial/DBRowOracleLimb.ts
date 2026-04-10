import { createLogger } from "../../utils/logger.js";
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const logger = createLogger('DBRowOracleLimb');

export interface DBRow {
    id: number;
    table: number;
    unk01?: {
        cols: number;
        columndata: {
            id: number;
            flags: number;
            columns: {
                type: number;
                value: (number | string)[];
            }[];
        }[];
    };
    unk02?: any; // Standardised for new era formats
}

/**
 * DBRowOracleLimb
 * 
 * The Rosetta Stone of the Sovereign Server.
 * Translates raw RuneScape Genome data (DBTables/DBRows) into semantic gameplay logic.
 */
export class DBRowOracleLimb {
    private dbrows: Map<number, DBRow> = new Map();
    private projectRoot: string;

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
    }

    // --- ORACLE COORDINATE LOGIC ---
    public static readonly ORACLE_BIT_OFFSET = 1; // The padding offset for 66x66 -> 64x64 alignment

    /**
     * toWorld - Transforms a local padded coordinate (0..65) to world coordinates.
     */
    public static toWorld(lx: number, ly: number, rx: number, ry: number) {
        return {
            x: (rx << 6) + lx - DBRowOracleLimb.ORACLE_BIT_OFFSET,
            y: (ry << 6) + ly - DBRowOracleLimb.ORACLE_BIT_OFFSET
        };
    }

    /**
     * toPadded - Transforms a world coordinate to local padded index for 66x66 buffer access.
     */
    public static toPadded(wx: number, wy: number, rx: number, ry: number) {
        return {
            lx: (wx - (rx << 6)) + DBRowOracleLimb.ORACLE_BIT_OFFSET,
            ly: (wy - (ry << 6)) + DBRowOracleLimb.ORACLE_BIT_OFFSET
        };
    }

    public async initialize(): Promise<void> {
        logger.info('Waking Genomic Oracle...');
        
        const dbrowPath = 'D:/sovereign/atlas/system/dbrows.json';
        if (!existsSync(dbrowPath)) {
            logger.error({ path: dbrowPath }, 'Genome Substrate Missing: dbrows.json');
            return;
        }

        try {
            const data = JSON.parse(readFileSync(dbrowPath, 'utf-8'));
            if (Array.isArray(data)) {
                data.forEach(row => this.dbrows.set(row.id, row));
                logger.info({ count: this.dbrows.size }, 'Genomic Rows Indexed.');
            }
        } catch (err) {
            logger.error({ error: (err as Error).message }, 'Failed to parse DBRow catalog');
        }
    }

    /**
     * resolveRefillNeed
     * Translates a DBRow ID into a semantic Refill instruction.
     * Grounded in Table 39 (POF) and Table 1 (Standard) logic.
     */
    public resolveRefillNeed(rowId: number): string {
        const row = this.dbrows.get(rowId);
        if (!row) return "UNKNOWN_GENOME";

        // Logic Grounding for Table 39 (Pens)
        if (row.table === 39 && row.unk01) {
            const nameCol = row.unk01.columndata.find(c => c.id === 7);
            const refillCol = row.unk01.columndata.find(c => c.id === 11);

            const penName = nameCol?.columns[0]?.value[0] || "Unnamed Pen";
            const refillData = refillCol?.columns.map(c => c.value).flat() || [];

            // Refill Genome: [Ingredient, Amount, Adrenaline, ...]
            if (refillData.length >= 2) {
                const ingredient = refillData[0];
                const amount = refillData[1];
                return `${penName} requires ${amount}x Ingredient [${ingredient}] for replenishment.`;
            }

            return `${penName} state active but refill requirements undefined.`;
        }

        return `DBRow [${rowId}] resolved from Table [${row.table}]. Unmapped logic domain.`;
    }

    public healthCheck(): Promise<{ online: boolean; details: string }> {
        const isOnline = this.dbrows.size > 0;
        return Promise.resolve({
            online: isOnline,
            details: isOnline ? `Genome Active: ${this.dbrows.size} rows ready.` : 'Genome Substrate Offline.'
        });
    }
}
