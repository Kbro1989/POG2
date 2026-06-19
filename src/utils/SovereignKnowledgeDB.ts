import Database from 'better-sqlite3';
import { createLogger } from './logger.js';
import { SovereignDBLifecycle } from './SovereignDBLifecycle.js';

const logger = createLogger('SovereignKnowledgeDB');

export interface TileLesson {
    plane: number;
    x: number;
    y: number; // Mapping 'z' from user schema to 'y' to match internal Coord
    terrainFlags: number;
    objects: Array<{ id: number; name?: string; type: number }>;
}

/**
 * SovereignKnowledgeDB - The "MEMORY" substrate for spatial persistence.
 */
export class SovereignKnowledgeDB {
    private static instance: SovereignKnowledgeDB;
    private db: Database.Database;
    private closed = false;
    private prepared: {
        upsertTile: Database.Statement;
        getTile: Database.Statement;
        getAllTiles: Database.Statement;
        countTiles: Database.Statement;
        insertCapture: Database.Statement;
        insertMetabolism: Database.Statement;
    };

    private constructor(dbPath?: string) {
        if (!dbPath) {
            dbPath = join(getSovereignRoot(), 'learning', 'sovereign-learning.db');
        }
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');

        this.initSchema();
        this.prepared = this.prepareStatements();

        SovereignDBLifecycle.getInstance().register('SovereignKnowledgeDB', this);
        logger.info({ path: dbPath }, 'SovereignKnowledgeDB initialized.');
    }

    public static getInstance(dbPath?: string): SovereignKnowledgeDB {
        if (!SovereignKnowledgeDB.instance) {
            SovereignKnowledgeDB.instance = new SovereignKnowledgeDB(dbPath);
        }
        return SovereignKnowledgeDB.instance;
    }

    private initSchema(): void {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS spatial_lessons (
                coord_key TEXT PRIMARY KEY,
                plane INTEGER NOT NULL,
                x INTEGER NOT NULL,
                y INTEGER NOT NULL,
                terrain_flags INTEGER NOT NULL,
                objects_json TEXT,
                last_observed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS sensory_captures (
                id TEXT PRIMARY KEY,
                timestamp INTEGER NOT NULL,
                source_type TEXT NOT NULL,
                target TEXT,
                image_path TEXT,
                analysis_json TEXT,
                metadata_json TEXT
            );

            CREATE TABLE IF NOT EXISTS cognitive_metabolism (
                id TEXT PRIMARY KEY,
                timestamp INTEGER NOT NULL,
                anatomy_domain TEXT NOT NULL,
                source_model TEXT NOT NULL,
                metabolic_input TEXT NOT NULL,
                metabolic_output TEXT NOT NULL,
                metadata_json TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_plane_xy ON spatial_lessons(plane, x, y);
            CREATE INDEX IF NOT EXISTS idx_sensory_timestamp ON sensory_captures(timestamp);
            CREATE INDEX IF NOT EXISTS idx_metabolism_domain ON cognitive_metabolism(anatomy_domain);
        `);
    }

    private prepareStatements() {
        return {
            upsertTile: this.db.prepare(`
                INSERT INTO spatial_lessons (coord_key, plane, x, y, terrain_flags, objects_json, last_observed)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(coord_key) DO UPDATE SET
                    terrain_flags = EXCLUDED.terrain_flags,
                    objects_json = EXCLUDED.objects_json,
                    last_observed = CURRENT_TIMESTAMP
            `),

            getTile: this.db.prepare(`
                SELECT * FROM spatial_lessons WHERE coord_key = ?
            `),

            getAllTiles: this.db.prepare(`
                SELECT * FROM spatial_lessons ORDER BY plane, x, y
            `),

            countTiles: this.db.prepare(`
                SELECT COUNT(*) as count FROM spatial_lessons
            `),

            insertCapture: this.db.prepare(`
                INSERT INTO sensory_captures (id, timestamp, source_type, target, image_path, analysis_json, metadata_json)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `),

            insertMetabolism: this.db.prepare(`
                INSERT INTO cognitive_metabolism (id, timestamp, anatomy_domain, source_model, metabolic_input, metabolic_output, metadata_json)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `)
        };
    }

    /**
     * batchUpsert - Atomically flushes a session's lessons to the database.
     */
    public async batchUpsert(lessons: TileLesson[]): Promise<number> {
        try {
            const upsertTransaction = this.db.transaction((data: TileLesson[]) => {
                let count = 0;
                for (const lesson of data) {
                    const coordKey = `${lesson.plane}_${lesson.x}_${lesson.y}`;
                    const objectsJson = JSON.stringify(lesson.objects);

                    this.prepared.upsertTile.run(
                        coordKey,
                        lesson.plane,
                        lesson.x,
                        lesson.y,
                        lesson.terrainFlags,
                        objectsJson
                    );
                    count++;
                }
                return count;
            });

            const inserted = upsertTransaction(lessons);
            logger.info({ count: inserted }, 'Batch upserted tiles to persistent memory.');
            return inserted;
        } catch (err) {
            logger.error({ err }, 'Batch upsert failed.');
            return 0;
        }
    }

    public getTilesByPlane(plane: number): TileLesson[] {
        try {
            const rows = this.db
                .prepare('SELECT * FROM spatial_lessons WHERE plane = ? ORDER BY x, y')
                .all(plane) as any[];

            return rows.map(row => ({
                plane: row.plane,
                x: row.x,
                y: row.y,
                terrainFlags: row.terrain_flags,
                objects: JSON.parse(row.objects_json || '[]')
            }));
        } catch (err) {
            logger.error({ err, plane }, 'Query by plane failed.');
            return [];
        }
    }

    public getTileCount(): number {
        try {
            const result = this.prepared.countTiles.get() as { count: number };
            return result.count;
        } catch (err) {
            return 0;
        }
    }

    public recordCapture(id: string, timestamp: number, sourceType: string, target: string, imagePath: string | null, analysis: any, metadata: any): void {
        try {
            this.prepared.insertCapture.run(
                id,
                timestamp,
                sourceType,
                target,
                imagePath,
                JSON.stringify(analysis),
                JSON.stringify(metadata)
            );
        } catch (err) {
            logger.error({ err, id }, 'Failed to record sensory capture.');
        }
    }

    public recordMetabolism(id: string, timestamp: number, anatomyDomain: string, sourceModel: string, input: string, output: string, metadata: any): void {
        try {
            this.prepared.insertMetabolism.run(
                id,
                timestamp,
                anatomyDomain,
                sourceModel,
                input,
                output,
                JSON.stringify(metadata)
            );
            logger.debug({ anatomyDomain, sourceModel }, 'Parasitic distillation logic successfully metabolized into Sovereign DB.');
        } catch (err) {
            logger.error({ err, id, anatomyDomain }, 'Failed to record cognitive metabolism.');
        }
    }

    public close(): void {
        if (this.closed) return;
        this.closed = true;
        try {
            this.db.pragma('wal_checkpoint(TRUNCATE)');
        } catch { /* WAL may not exist */ }
        this.db.close();
        logger.info('SovereignKnowledgeDB WAL checkpointed and closed.');
    }
}

