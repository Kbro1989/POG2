import Database from 'better-sqlite3';
import { ok } from '../core/models.js';
import { getLearningDbPath, getSatelliteDbPaths } from './SovereignPathResolver.js';
import { createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { SovereignIgnoreManager } from './SovereignIgnoreManager.js';
import { getSystemRoot } from './SovereignPathResolver.js';
import { createLogger } from "./logger.js";
const logger = createLogger('VectorDB');
/**
 * VectorDB â€” Sovereign memory substrate using better-sqlite3.
 * NO MOCKS. Real persistence for neurological lessons and hexagram context.
 */
export class VectorDB {
    db = null;
    satellites = [];
    dbPath;
    client;
    constructor(config) {
        this.dbPath = getLearningDbPath();
        this.client = config.client;
    }
    /**
     * Functional probe for memory substrate health.
     */
    healthCheck() {
        if (!this.db) {
            return { online: false, details: 'Database not initialized.' };
        }
        try {
            let totalLessons = 0;
            const row = this.db.prepare('SELECT count(*) as count FROM lessons').get();
            totalLessons += row.count;
            for (const sat of this.satellites) {
                try {
                    const satRow = sat.prepare('SELECT count(*) as count FROM lessons').get();
                    totalLessons += satRow.count;
                }
                catch { /* ignore if corrupted/wrong schema */ }
            }
            return { online: true, details: `Memory substrate nominal. Total Federated Lessons: ${totalLessons} (${this.satellites.length} Satellites)` };
        }
        catch (err) {
            return { online: false, details: `Memory substrate error: ${err.message}` };
        }
    }
    initialize() {
        try {
            logger.info({ dbPath: this.dbPath }, 'Initializing VectorDB Substrate');
            this.db = new Database(this.dbPath);
            this.db.pragma('journal_mode = WAL');
            this.createTables();
            // Phase 28: Initialize Satellite DBs for Federated Queries
            const satPaths = getSatelliteDbPaths();
            for (const path of satPaths) {
                try {
                    const satDb = new Database(path, { readonly: true });
                    this.satellites.push(satDb);
                    logger.info({ satPath: path }, 'Federated Satellite DB Connected (Readonly)');
                }
                catch (err) {
                    logger.warn({ satPath: path, err }, 'Failed to connect satellite DB');
                }
            }
            return ok(undefined);
        }
        catch (error) {
            return { ok: false, error: error };
        }
    }
    createTables() {
        if (!this.db)
            throw new Error('Database not initialized');
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS lessons (
                id TEXT PRIMARY KEY,
                text TEXT NOT NULL,
                embedding BLOB,
                sessionId TEXT,
                projectId TEXT NOT NULL DEFAULT 'global',
                domainNamespace TEXT NOT NULL DEFAULT 'global',
                errorType TEXT,
                createdAt INTEGER NOT NULL,
                lastAccessed INTEGER,
                usageCount INTEGER DEFAULT 0,
                regretLikelihood REAL DEFAULT 0,
                metadata TEXT,
                hash TEXT,
                type TEXT
            );

            CREATE TABLE IF NOT EXISTS hexagram_context (
                line_index INTEGER NOT NULL,
                projectId TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                state INTEGER NOT NULL DEFAULT 2,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (line_index, projectId)
            );
        `);
        // Migration/Hardening: Ensure columns exist
        const columns = this.db.prepare("PRAGMA table_info(lessons)").all();
        const columnNames = columns.map(c => c.name);
        if (!columnNames.includes('domainNamespace')) {
            this.db.exec('ALTER TABLE lessons ADD COLUMN domainNamespace TEXT NOT NULL DEFAULT "global"');
        }
        if (!columnNames.includes('hash')) {
            this.db.exec('ALTER TABLE lessons ADD COLUMN hash TEXT');
        }
        if (!columnNames.includes('type')) {
            this.db.exec('ALTER TABLE lessons ADD COLUMN type TEXT');
        }
        if (!columnNames.includes('usageCount')) {
            this.db.exec('ALTER TABLE lessons ADD COLUMN usageCount INTEGER DEFAULT 0');
        }
        if (!columnNames.includes('lastAccessed')) {
            this.db.exec('ALTER TABLE lessons ADD COLUMN lastAccessed INTEGER');
        }
    }
    addLesson(lesson) {
        if (!this.db)
            return { ok: false, error: new Error('Database not initialized') };
        try {
            const query = `
                INSERT OR REPLACE INTO lessons 
                (id, text, embedding, sessionId, projectId, domainNamespace, errorType, createdAt, lastAccessed, usageCount, regretLikelihood, metadata, hash, type) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const embeddingBlob = new Uint8Array(lesson.embedding.buffer, lesson.embedding.byteOffset, lesson.embedding.byteLength);
            logger.debug({ id: lesson.id, blobSize: embeddingBlob.length }, 'Adding lesson to substrate');
            this.db.prepare(query).run(lesson.id, lesson.text, embeddingBlob, lesson.sessionId || null, lesson.projectId, lesson.domainNamespace || 'global', lesson.errorType || null, lesson.createdAt, lesson.createdAt, // initial lastAccessed
            0, // initial usageCount
            lesson.regretLikelihood || 0, JSON.stringify(lesson.metadata), lesson.hash || null, lesson.type || 'lesson');
            return ok(undefined);
        }
        catch (err) {
            logger.error({ id: lesson.id, err: err.message, stack: err.stack }, 'Failed to add lesson to substrate');
            return { ok: false, error: err };
        }
    }
    searchSimilar(queryEmbedding, limit = 5, projectId, domainNamespace) {
        if (!this.db)
            return { ok: false, error: new Error('Database not initialized') };
        try {
            let rows = this.db.prepare('SELECT * FROM lessons ORDER BY createdAt DESC LIMIT 1000').all();
            // Phase 28: Federated Search
            for (const sat of this.satellites) {
                try {
                    const satRows = sat.prepare('SELECT * FROM lessons ORDER BY createdAt DESC LIMIT 1000').all();
                    rows = rows.concat(satRows);
                }
                catch { /* ignore */ }
            }
            const lessons = rows.map((row) => {
                const embeddingBuffer = row.embedding;
                if (!embeddingBuffer)
                    return null;
                const embedding = new Float32Array(embeddingBuffer.buffer, embeddingBuffer.byteOffset, embeddingBuffer.byteLength / 4);
                const similarityValue = this.cosineSimilarity(queryEmbedding, embedding);
                // --- Phase 25: Cognitive Evolution Logic ---
                const now = Date.now();
                const ageSeconds = (now - row.createdAt) / 1000;
                const tau = 7 * 24 * 60 * 60; // 7-day half-life for memory decay (in seconds)
                const temporalDecay = Math.exp(-ageSeconds / tau);
                // Reinforcement Boost: usageCount increases relevance physics
                const usageBoost = Math.min(row.usageCount * 0.05, 0.5); // Cap boost at +0.5
                let finalSimilarity = (similarityValue * temporalDecay) + usageBoost;
                if (projectId && row.projectId === projectId)
                    finalSimilarity += 0.1;
                if (domainNamespace && row.domainNamespace && row.domainNamespace !== 'global') {
                    if (row.domainNamespace !== domainNamespace) {
                        finalSimilarity -= 0.3;
                    }
                    else {
                        finalSimilarity += 0.15;
                    }
                }
                const lesson = {
                    id: String(row.id),
                    text: String(row.text),
                    embedding,
                    sessionId: row.sessionId ? String(row.sessionId) : undefined,
                    projectId: String(row.projectId || 'global'),
                    domainNamespace: String(row.domainNamespace || 'global'),
                    errorType: row.errorType ? String(row.errorType) : undefined,
                    createdAt: Number(row.createdAt),
                    regretLikelihood: Number(row.regretLikelihood),
                    metadata: JSON.parse(String(row.metadata || '{}')),
                    similarity: finalSimilarity,
                    hash: row.hash ? String(row.hash) : undefined,
                    type: row.type ? String(row.type) : 'lesson'
                };
                return lesson;
            }).filter((l) => l !== null);
            lessons.sort((a, b) => b.similarity - a.similarity);
            return ok(lessons.slice(0, limit));
        }
        catch (err) {
            return { ok: false, error: err };
        }
    }
    getSessionLessons(sessionId) {
        if (!this.db)
            return { ok: false, error: new Error('Database not initialized') };
        try {
            let rows = this.db.prepare('SELECT id, text, sessionId, projectId, domainNamespace, errorType, createdAt, regretLikelihood, metadata, hash, type FROM lessons WHERE sessionId = ?').all(sessionId);
            // Phase 28: Federated Read
            for (const sat of this.satellites) {
                try {
                    const satRows = sat.prepare('SELECT id, text, sessionId, projectId, domainNamespace, errorType, createdAt, regretLikelihood, metadata, hash, type FROM lessons WHERE sessionId = ?').all(sessionId);
                    rows = rows.concat(satRows);
                }
                catch { /* ignore */ }
            }
            return ok(rows.map((r) => ({
                id: String(r.id),
                text: String(r.text),
                embedding: new Float32Array(), // Omit embedding for fast session retrieval
                sessionId: r.sessionId ? String(r.sessionId) : undefined,
                projectId: String(r.projectId || 'global'),
                domainNamespace: String(r.domainNamespace || 'global'),
                errorType: r.errorType ? String(r.errorType) : undefined,
                createdAt: Number(r.createdAt),
                regretLikelihood: Number(r.regretLikelihood),
                metadata: JSON.parse(String(r.metadata || '{}')),
                hash: r.hash ? String(r.hash) : undefined,
                type: r.type ? String(r.type) : 'lesson'
            })));
        }
        catch (err) {
            return { ok: false, error: err };
        }
    }
    /**
     * queryLocal - Direct metadata retrieval by ID.
     */
    queryLocal(id) {
        if (!this.db)
            return { ok: false, error: new Error('Database not initialized') };
        try {
            let row = this.db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);
            // Phase 28: Federated Read
            if (!row) {
                for (const sat of this.satellites) {
                    try {
                        row = sat.prepare('SELECT * FROM lessons WHERE id = ?').get(id);
                        if (row)
                            break;
                    }
                    catch { /* ignore */ }
                }
            }
            if (!row)
                return ok(null);
            const embeddingBuffer = row.embedding;
            const embedding = embeddingBuffer ? new Float32Array(embeddingBuffer.buffer, embeddingBuffer.byteOffset, embeddingBuffer.byteLength / 4) : new Float32Array();
            return ok({
                id: String(row.id),
                text: String(row.text),
                embedding,
                sessionId: row.sessionId ? String(row.sessionId) : undefined,
                projectId: String(row.projectId || 'global'),
                domainNamespace: String(row.domainNamespace || 'global'),
                errorType: row.errorType ? String(row.errorType) : undefined,
                createdAt: Number(row.createdAt),
                regretLikelihood: Number(row.regretLikelihood),
                metadata: JSON.parse(String(row.metadata || '{}')),
                hash: row.hash ? String(row.hash) : undefined,
                type: row.type ? String(row.type) : 'lesson'
            });
        }
        catch (err) {
            return { ok: false, error: err };
        }
    }
    deleteLessons(ids) {
        if (!this.db || ids.length === 0)
            return ok(undefined);
        try {
            const placeholders = ids.map(() => '?').join(',');
            const stmt = this.db.prepare(`DELETE FROM lessons WHERE id IN (${placeholders})`);
            stmt.run(...ids);
            return ok(undefined);
        }
        catch (err) {
            logger.error({ err }, 'Failed to delete deprecated lessons.');
            return { ok: false, error: err };
        }
    }
    /**
     * Phase 25: Reinforce a specific lesson.
     * Increases usageCount and updates lastAccessed.
     */
    reinforceLesson(id, strength = 1) {
        if (!this.db)
            return { ok: false, error: new Error('Database not initialized') };
        try {
            this.db.prepare(`
                UPDATE lessons 
                SET usageCount = usageCount + ?, lastAccessed = ? 
                WHERE id = ?
            `).run(strength, Date.now(), id);
            return ok(undefined);
        }
        catch (err) {
            logger.error({ id, err }, 'Failed to reinforce lesson');
            return { ok: false, error: err };
        }
    }
    /**
     * Phase 34: Auto-indexing logic for POG2 memory hygiene.
     * Uses real embeddings via ModelClient.
     */
    async autoIndexFile(filePath, projectId = 'global') {
        if (!this.db)
            return { ok: false, error: new Error('Database not initialized') };
        try {
            if (!existsSync(filePath))
                return { ok: false, error: new Error(`File not found: ${filePath}`) };
            // Phase 85: Universal Ignore Enforcement
            const systemRoot = getSystemRoot();
            if (SovereignIgnoreManager.isIgnored(systemRoot, filePath)) {
                logger.debug({ filePath }, 'Auto-indexing skipped: Path ignored by Sovereign Laws.');
                return ok(undefined);
            }
            const content = readFileSync(filePath, 'utf-8');
            const hash = this.getCodeItemHash(content);
            const existing = this.db.prepare('SELECT id FROM lessons WHERE hash = ?').get(hash);
            if (existing) {
                logger.debug({ filePath, hash }, 'Metabolic state unchanged (Hash Match).');
                return ok(undefined);
            }
            logger.info({ filePath, hash }, 'Auto-indexing file metadata into memory substrate.');
            if (!this.client || typeof this.client.embed !== 'function') {
                return { ok: false, error: new Error('Embedding capability (client.embed) not available on VectorDB.') };
            }
            const embedRes = await this.client.embed(content.substring(0, 4000));
            if (!embedRes.ok)
                return { ok: false, error: embedRes.error };
            return this.addLesson({
                id: `auto-${hash.substring(0, 8)}-${Date.now()}`,
                text: content.substring(0, 2000), // Summary snippet
                embedding: new Float32Array(embedRes.value),
                projectId,
                domainNamespace: 'global',
                createdAt: Date.now(),
                metadata: { source: filePath, type: 'auto-index', hash },
                hash,
                type: 'file_index'
            });
        }
        catch (error) {
            return { ok: false, error: error };
        }
    }
    getCodeItemHash(content) {
        return createHash('sha256').update(content).digest('hex');
    }
    cosineSimilarity(a, b) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        const len = Math.min(a.length, b.length);
        for (let i = 0; i < len; i++) {
            dotProduct += (a[i] ?? 0) * (b[i] ?? 0);
            normA += (a[i] ?? 0) * (a[i] ?? 0);
            normB += (b[i] ?? 0) * (b[i] ?? 0);
        }
        const den = Math.sqrt(normA) * Math.sqrt(normB);
        return den === 0 ? 0 : dotProduct / den;
    }
    /**
     * Ingests the hard-coded AnatomyRegistry into the substrate.
     * Phase 105: Ensures all species constraints are available for sensory validation.
     */
    async ingestAnatomyRegistry(registry) {
        if (!this.db)
            return { ok: false, error: new Error('Database not initialized') };
        logger.info({ count: registry.length }, 'Ingesting Anatomy Registry into substrate (Metabolic Hardening)');
        for (const spec of registry) {
            const text = `${spec.commonName} (${spec.species}) anatomy: ${JSON.stringify(spec.limits)}. Notes: ${spec.notes || 'None'}`;
            const hash = createHash('sha256').update(spec.species).digest('hex');
            const embedRes = await this.client.embed(text);
            if (!embedRes.ok || !embedRes.value)
                continue;
            this.addLesson({
                id: `anatomy-${spec.species}`,
                text,
                embedding: embedRes.value,
                projectId: 'global',
                domainNamespace: 'anatomy',
                createdAt: Date.now(),
                metadata: spec,
                hash,
                type: 'anatomy_fact'
            });
        }
        return ok(undefined);
    }
    /**
     * Ingests the 3D Model Registry into the substrate.
     * Phase 106: Links NPC names/IDs to anatomical species.
     */
    async ingestModelRegistry(registry) {
        if (!this.db)
            return { ok: false, error: new Error('Database not initialized') };
        logger.info({ count: registry.length }, 'Ingesting 3D Model Registry into substrate (Geometric Grounding)');
        for (const model of registry) {
            const text = `3D Model: ${model.name} (Species: ${model.species}). Metadata: ${JSON.stringify(model.metadata || {})}`;
            const hash = createHash('sha256').update(`model-${model.name}`).digest('hex');
            const embedRes = await this.client.embed(text);
            if (!embedRes.ok || !embedRes.value)
                continue;
            this.addLesson({
                id: `model-${model.name.toLowerCase()}`,
                text,
                embedding: embedRes.value,
                projectId: 'global',
                domainNamespace: 'anatomy',
                createdAt: Date.now(),
                metadata: { ...model, type: '3d_model_ref' },
                hash,
                type: '3d_model_fact'
            });
        }
        return ok(undefined);
    }
    /**
     * Ingests the kinetic limits for various species into the substrate.
     * Phase 107: Grounding temporal integrity in physical kinetic limits.
     */
    async ingestKineticRegistry(registry) {
        if (!this.db)
            return { ok: false, error: new Error('Database not initialized') };
        logger.info({ count: registry.length }, 'Ingesting Kinetic Registry into substrate (Kinetic Hardening)');
        for (const spec of registry) {
            const text = `Kinetic limits for ${spec.species}: Joints: ${JSON.stringify(spec.joints)}. Profiles: ${JSON.stringify(spec.profiles)}`;
            const hash = createHash('sha256').update(`kinetic-${spec.species}`).digest('hex');
            const embedRes = await this.client.embed(text);
            if (!embedRes.ok || !embedRes.value)
                continue;
            this.addLesson({
                id: `kinetic-${spec.species}`,
                text,
                embedding: embedRes.value,
                projectId: 'global',
                domainNamespace: 'anatomy',
                createdAt: Date.now(),
                metadata: spec,
                hash,
                type: 'kinetic_fact'
            });
        }
        return ok(undefined);
    }
    /**
     * Retrieves anatomical facts for a given species or entity description.
     */
    async getAnatomyFacts(query) {
        const embedRes = await this.client.embed(query);
        if (!embedRes.ok || !embedRes.value)
            return { ok: false, error: embedRes.error || new Error('Empty embedding') };
        const results = this.searchSimilar(embedRes.value, 10, 'global', 'anatomy');
        if (!results.ok || !results.value || results.value.length === 0)
            return ok(null);
        // Find anatomy_fact specifically
        const best = results.value.find(l => l.type === 'anatomy_fact');
        if (best)
            return ok(best.metadata);
        return ok(null);
    }
    /**
     * Specifically retrieves kinetic facts for a species.
     */
    async getKineticFacts(species) {
        const query = `kinetic limits search for species ${species}`;
        const embedRes = await this.client.embed(query);
        if (!embedRes.ok || !embedRes.value)
            return { ok: false, error: embedRes.error || new Error('Empty embedding') };
        const results = this.searchSimilar(embedRes.value, 15, 'global', 'anatomy');
        if (!results.ok || !results.value || results.value.length === 0)
            return ok(null);
        // Priority 1: Exact ID match
        const exactId = results.value.find(l => l.type === 'kinetic_fact' && l.id === `kinetic-${species}`);
        if (exactId)
            return ok(exactId.metadata);
        // Priority 2: Text contains species
        const best = results.value.find(l => l.type === 'kinetic_fact' && l.text.toLowerCase().includes(species.toLowerCase()));
        if (best)
            return ok(best.metadata);
        return ok(null);
    }
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
        for (const sat of this.satellites) {
            try {
                sat.close();
            }
            catch { /* ignore */ }
        }
        this.satellites = [];
    }
}
