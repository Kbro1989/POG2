import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { type Result, ok, err, YaoState } from '../../core/models.js';
import { HEXAGRAM_REGISTRY } from '../../core/HexagramDefinitions.js';
import { createLogger } from "../../utils/logger.js";
import { HexagramManager } from '../../routing/HexagramManager.js';
import { schema } from './EntitySchema.js';
import { getSovereignRoot } from '../../utils/SovereignPathResolver.js';

const logger = createLogger('EntityLimb');

/**
 * EntityLimb - Persistent Actor Management (Attention & Reinforcement Edition)
 * Manages identity, pedagogy, and dynamic behavioral bias through weighted experiences.
 */
export class EntityLimb {
    private static instance: EntityLimb | undefined;
    private db: Database.Database;

    public static getInstance(): EntityLimb {
        if (!this.instance) {
            this.instance = new EntityLimb();
        }
        return this.instance;
    }

    public static resetInstance(): void {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('resetInstance is forbidden in production');
        }
        this.instance = undefined;
    }

    private constructor() {
        if (EntityLimb.instance) {
            throw new Error('Singleton violation: use EntityLimb.getInstance()');
        }
        const root = getSovereignRoot();
        const dbPath = path.join(root, 'memory', 'memory.db');
        const dbDir = path.dirname(dbPath);

        try {
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }
            this.db = new Database(dbPath);
            this.db.exec(schema);

            // Migration: Add reinforcement column if it doesn't exist
            try {
                this.db.exec(`ALTER TABLE memories ADD COLUMN reinforcement REAL DEFAULT 1.0`);
                logger.info('Schema migration: Added reinforcement column.');
            } catch (e) {
                // Ignore if column already exists
            }

            // Migration: Add player_identity table
            try {
                this.db.exec(`
                    CREATE TABLE IF NOT EXISTS player_identity (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        stats_json TEXT,
                        model_path TEXT,
                        updated_at INTEGER
                    );
                `);
            } catch (e) {
                logger.error({ e }, 'Failed to create player_identity table.');
            }

            logger.info({ dbPath }, 'Entity persistence layer initialized.');
        } catch (err: any) {
            logger.error({ err }, 'Failed to initialize entity database.');
            throw err;
        }
    }

    /**
     * registerEntity - Anchors identity and pedagogy profile to the persistent substrate.
     */
    public async registerEntity(profile: any): Promise<Result<string>> {
        const now = Date.now();
        const id = profile.id;

        try {
            const registerStmt = this.db.prepare(`
                INSERT INTO entities (id, type, name, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    updated_at=excluded.updated_at
            `);

            const pedagogyStmt = this.db.prepare(`
                INSERT INTO pedagogy (entity_id, profile_json, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(entity_id) DO UPDATE SET
                    profile_json=excluded.profile_json,
                    updated_at=excluded.updated_at
            `);

            this.db.transaction(() => {
                registerStmt.run(id, profile.type, profile.name ?? null, now, now);
                pedagogyStmt.run(id, JSON.stringify(profile), now);
            })();

            logger.info({ id }, 'Entity registered successfully.');
            return ok(id);
        } catch (err: any) {
            logger.error({ err, id }, 'Failed to register entity.');
            return err(new Error(`REGISTRATION_FAILED: ${err.message}`));
        }
    }

    /**
     * addMemory - Injects a new memory and triggers pattern reinforcement.
     */
    public async addMemory(id: string, memory: any): Promise<Result<number>> {
        try {
            const contentStr = JSON.stringify(memory.content);
            const stmt = this.db.prepare(`
                INSERT INTO memories (entity_id, timestamp, type, content, weight, reinforcement)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            const info = stmt.run(
                id,
                memory.timestamp ?? Date.now(),
                memory.type ?? 'observation',
                contentStr,
                memory.weight ?? 1.0,
                1.0
            );

            const rowId = Number(info.lastInsertRowid);

            // Reinforce similar past memories (Pattern Learning)
            // Use high-signal prefix for cheap clustering
            const pattern = contentStr.slice(0, 50);
            this.reinforceMemory(id, memory.type ?? 'observation', pattern);

            return ok(rowId);
        } catch (err: any) {
            logger.error({ err, id }, 'Failed to add memory.');
            return err(new Error(`MEMORY_INSERT_FAILED: ${err.message}`));
        }
    }

    /**
     * reinforceMemory - Strengthens the weight of repeated event patterns (unsupervised learning).
     */
    public reinforceMemory(id: string, type: string, pattern: string): Result<void> {
        try {
            const stmt = this.db.prepare(`
                UPDATE memories
                SET reinforcement = MIN(reinforcement + 0.25, 5.0)
                WHERE entity_id = ?
                  AND type = ?
                  AND content LIKE ?
            `);
            stmt.run(id, type, `%${pattern}%`);
            return ok(undefined);
        } catch (err: any) {
            logger.error({ err, id }, 'Failed to reinforce memory.');
            return err(new Error(`REINFORCE_FAILED: ${err.message}`));
        }
    }

    /**
     * getTopMemories - Returns the most relevant experiences (Attention Engine).
     */
    private getTopMemories(id: string, limit = 20): any[] {
        const rows = this.db.prepare(`SELECT * FROM memories WHERE entity_id = ?`).all(id) as any[];
        const now = Date.now();

        return rows
            .map(m => {
                const ageMs = now - m.timestamp;
                const decay = Math.exp(ageMs / (1000 * 60 * 60 * 24)); // Daily decay
                const score = ((m.weight ?? 1.0) * (m.reinforcement ?? 1.0)) / decay;
                
                return {
                    ...m,
                    content: JSON.parse(m.content),
                    score
                };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    /**
     * updateVibeFromMemory - Mutates the entity's emotional state based on interaction type.
     */
    public async updateVibeFromMemory(id: string, memory: any): Promise<Result<any>> {
        const now = Date.now();
        try {
            const existing = this.db.prepare(`SELECT state_json FROM vibe_state WHERE entity_id = ?`).get(id) as any;
            const vibe = existing 
                ? JSON.parse(existing.state_json) 
                : { aggression: 0, affinity: 0, fear: 0, curiosity: 0, greed: 0, fatigue: 0 };

            const weight = memory.weight ?? 1.0;

            let yaoState = YaoState.YoungYin;
            let msg = '';

            switch (memory.type) {
                case 'combat':
                    vibe.aggression = Math.min((vibe.aggression || 0) + 0.1 * weight, 5.0);
                    vibe.fatigue = Math.min((vibe.fatigue || 0) + 0.05 * weight, 5.0);
                    yaoState = YaoState.OldYang;
                    msg = `Entity [${id}] exhibited combat/aggression vibe shift.`;
                    break;
                case 'skilling':
                case 'mining':
                case 'fishing':
                    vibe.curiosity = Math.min((vibe.curiosity || 0) + 0.15 * weight, 5.0);
                    vibe.fatigue = Math.min((vibe.fatigue || 0) + 0.1 * weight, 5.0);
                    yaoState = YaoState.YoungYang;
                    msg = `Entity [${id}] exhibited constructive skilling vibe shift.`;
                    break;
                case 'drop':
                case 'reward':
                    vibe.greed = Math.min((vibe.greed || 0) + 0.2 * weight, 5.0);
                    vibe.affinity = Math.min((vibe.affinity || 0) + 0.1 * weight, 5.0);
                    yaoState = YaoState.YoungYin;
                    msg = `Entity [${id}] received a drop/reward vibe shift.`;
                    break;
                case 'threat':
                    vibe.fear = Math.min((vibe.fear || 0) + 0.15 * weight, 5.0);
                    yaoState = YaoState.OldYang;
                    msg = `Entity [${id}] exhibited aggressive/threat vibe shift.`;
                    break;
            }

            if (msg) {
                const hexManager = HexagramManager.getInstance();
                await hexManager.pushLine({
                    lineIndex: 0,
                    importance: weight,
                    title: `Vibe Resonance: ${id}`,
                    content: msg,
                    state: yaoState
                });
            }

            // Passive metabolic recovery in idle/rest is handled by decay or explicit rest actions
            // but we can add a small passive recovery here if needed.

            this.db.prepare(`
                INSERT INTO vibe_state (entity_id, state_json, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(entity_id) DO UPDATE SET
                    state_json = excluded.state_json,
                    updated_at = excluded.updated_at
            `).run(id, JSON.stringify(vibe), now);

            return ok(vibe);
        } catch (err: any) {
            logger.error({ err, id }, 'Failed to update vibe state.');
            return err(new Error(`VIBE_UPDATE_FAILED: ${err.message}`));
        }
    }

    /**
     * getEntityState - Retrieves the integrated snapshot dominated by Attention and Vibe.
     */
    public async getEntityState(id: string): Promise<Result<any>> {
        try {
            const entity = this.db.prepare(`SELECT * FROM entities WHERE id = ?`).get(id);
            if (!entity) return err(new Error(`ENTITY_NOT_FOUND: ${id}`));

            const pedagogy = this.db.prepare(`SELECT profile_json FROM pedagogy WHERE entity_id = ?`).get(id);
            const memories = this.getTopMemories(id, 20);
            const vibeSnapshot = this.db.prepare(`SELECT state_json FROM vibe_state WHERE entity_id = ?`).get(id) as any;

            return ok({
                entity,
                pedagogy: pedagogy ? JSON.parse((pedagogy as any).profile_json) : null,
                attention: memories, // Prioritized over history
                vibe: vibeSnapshot ? JSON.parse(vibeSnapshot.state_json) : { aggression: 0, affinity: 0, fear: 0, curiosity: 0, greed: 0, fatigue: 0 }
            });
        } catch (err: any) {
            logger.error({ err, id }, 'Failed to retrieve entity state.');
            return err(new Error(`STATE_RETRIEVAL_FAILED: ${err.message}`));
        }
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        if (!this.db) return { online: false, details: 'Entity Database not initialized.' };
        try {
            const row = this.db.prepare('SELECT count(*) as count FROM entities').get() as { count: number };
            return { online: true, details: `Entity Substrate: ONLINE (${row.count} active entities)` };
        } catch (e) {
            return { online: false, details: `Entity Substrate ERROR: ${(e as Error).message}` };
        }
    }

    /**
     * decideAction - Core Behavioral Engine.
     * Maps the entity's vibe state and prioritized memories to a specific action and Yao state.
     */
    public async decideAction(id: string): Promise<Result<{ action: string, yao: YaoState, reasoning: string }>> {
        const stateRes = await this.getEntityState(id);
        if (!stateRes.ok) return err(stateRes.error);

        const { vibe, attention } = stateRes.value;
        let action = 'idle';
        let yao = YaoState.YoungYin; // Default: Meditation/Reflection
        let reasoning = 'Maintaining baseline stability.';

        // 1. Check for Critical Fatigue (Old Yin)
        if (vibe.fatigue > 3.0) {
            action = 'metabolic_rest';
            yao = YaoState.OldYin; // Deep recovery
            reasoning = `High fatigue (${vibe.fatigue.toFixed(2)}) detected. Initiating metabolic rest cycle.`;
        }
        // 2. Check for Economic Drive (Young Yang -> Old Yang if extreme)
        else if (vibe.greed > 1.5) {
            action = 'profit_hunt';
            yao = vibe.greed > 3.0 ? YaoState.OldYang : YaoState.YoungYang;
            reasoning = 'High wealth potential detected. Prioritizing economic gain.';
        }
        // 3. Check for Skill Growth (Young Yang)
        else if (vibe.curiosity > 1.0) {
            action = 'skilling_loop';
            yao = YaoState.YoungYang;
            reasoning = 'Skill curiosity peak. Engaging developmental loops.';
        }
        // 4. Check for Aggressive Bias (Old Yang)
        else if (vibe.aggression > 1.5) {
            action = 'combat_grind';
            yao = YaoState.OldYang;
            reasoning = 'Aggression levels maintained. Kinetic expansion favored.';
        } 
        // 5. Factor in specific "Attention" memories for state switching
        const recentProfit = attention.some((m: any) => m.type === 'drop');
        if (recentProfit && vibe.greed > 1.0 && action === 'skilling_loop') {
            action = 'profit_hunt';
            reasoning = 'Recent profit event detected. Diverting from skills to wealth maximization.';
        }

        return ok({ action, yao, reasoning });
    }

    /**
     * executeAction - Closes the cognitive loop.
     * Records the action taken as a memory, reinforcing the behavioral pattern.
     */
    public async executeAction(id: string, action: string): Promise<Result<void>> {
        const timestamp = Date.now();
        const type = 'action';
        const pattern = `ACTION_TAKEN:${action.toUpperCase()}`;
        
        // Log the decision as a new memory
        const addRes = await this.addMemory(id, { type, content: pattern, weight: 1.2 });
        if (!addRes.ok) return err(addRes.error);

        // Characterize and reinforce the habit
        // Every time an action is taken, it becomes slightly more "natural" to repeat.
        return this.reinforceMemory(id, type, pattern);
    }

    /**
     * updatePlayerIdentity - Sets or updates the player's bound in-game profile.
     */
    public async updatePlayerIdentity(id: string, update: { name?: string, stats?: any, modelPath?: string }): Promise<Result<void>> {
        const now = Date.now();
        try {
            const existing = this.db.prepare(`SELECT * FROM player_identity WHERE id = ?`).get(id) as any;
            const name = update.name ?? (existing ? existing.name : 'Unknown');
            const statsJson = update.stats ? JSON.stringify(update.stats) : (existing ? existing.stats_json : (existing ? existing.stats_json : null));
            const modelPath = update.modelPath ?? (existing ? existing.model_path : null);

            this.db.prepare(`
                INSERT INTO player_identity (id, name, stats_json, model_path, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name,
                    stats_json = excluded.stats_json,
                    model_path = excluded.model_path,
                    updated_at = excluded.updated_at
            `).run(id, name, statsJson, modelPath, now);

            return ok(undefined);
        } catch (err: any) {
            logger.error({ err, id }, 'Failed to update player identity.');
            return err(new Error(`IDENTITY_UPDATE_FAILED: ${err.message}`));
        }
    }

    /**
     * getPlayerIdentity - Retrieves the bound identity for a player entity.
     */
    public async getPlayerIdentity(id: string): Promise<Result<any>> {
        try {
            const row = this.db.prepare(`SELECT * FROM player_identity WHERE id = ?`).get(id) as any;
            if (!row) return ok(null);

            return ok({
                ...row,
                stats: row.stats_json ? JSON.parse(row.stats_json) : null
            });
        } catch (err: any) {
            return err(new Error(`IDENTITY_RETRIEVAL_FAILED: ${err.message}`));
        }
    }
}

