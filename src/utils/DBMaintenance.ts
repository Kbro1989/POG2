import sqlite3 from 'sqlite3';
import { type Result } from '../core/models.js';
import { getLearningDbPath } from './SovereignPathResolver.js';
import * as fs from 'fs';
import { join, dirname } from 'path';
import { createLogger } from "./logger.js";

const logger = createLogger('DBMaintenance');

/**
 * DBMaintenance - Utilities for SQLite long-term health.
 */
export class DBMaintenance {
    private readonly dbPath: string;

    constructor() {
        this.dbPath = getLearningDbPath();
    }

    /**
     * Inspects the database for integrity and provides a row count.
     */
    async inspect(): Promise<Result<{ tables: string[]; rowCount: number }>> {
        if (!fs.existsSync(this.dbPath)) {
            return { ok: true, value: { tables: [], rowCount: 0 } };
        }
        return new Promise((resolve) => {
            const db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READONLY, (err) => {
                if (err) return resolve({ ok: false, error: err });

                db.all("SELECT name FROM sqlite_master WHERE type='table'", (tableErr, tables: any[]) => {
                    if (tableErr) {
                        db.close();
                        return resolve({ ok: false, error: tableErr });
                    }

                    const tableNames = tables.map(t => t.name);
                    let totalRows = 0;
                    let processed = 0;

                    if (tableNames.length === 0) {
                        db.close();
                        return resolve({ ok: true, value: { tables: [], rowCount: 0 } });
                    }

                    tableNames.forEach(name => {
                        db.get(`SELECT COUNT(*) as count FROM ${name}`, (countErr, row: any) => {
                            if (!countErr && row) totalRows += row.count;
                            processed++;
                            if (processed === tableNames.length) {
                                db.close();
                                resolve({ ok: true, value: { tables: tableNames, rowCount: totalRows } });
                            }
                        });
                    });
                });
            });
        });
    }

    /**
     * Attempts to repair the database by vacuuming into a fresh file if corruption is suspected.
     * Simple repair: just VACUUM. Complex: .dump and .read.
     */
    async repair(): Promise<Result<void>> {
        if (!fs.existsSync(this.dbPath)) {
            return { ok: true, value: undefined };
        }
        return new Promise((resolve) => {
            const db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) return resolve({ ok: false, error: err });

                db.run('VACUUM', (vErr) => {
                    db.close();
                    if (vErr) {
                        logger.error({ vErr }, 'DB Repair (VACUUM) failed');
                        resolve({ ok: false, error: vErr });
                    } else {
                        logger.info('DB Repair (VACUUM) complete');
                        resolve({ ok: true, value: undefined });
                    }
                });
            });
        });
    }

    /**
     * Compresses the database by removing old lessons or deduplicating.
     * Implementation depends on the specific cleanup strategy needed.
     */
    async compress(daysToKeep = 30): Promise<Result<number>> {
        if (!fs.existsSync(this.dbPath)) {
            return { ok: true, value: 0 };
        }
        return new Promise((resolve) => {
            const db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) return resolve({ ok: false, error: err });

                const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

                db.serialize(() => {
                    db.run('DELETE FROM lessons WHERE createdAt < ?', [cutoff], function (this: any, dErr) {
                        if (dErr) {
                            db.close();
                            return resolve({ ok: false, error: dErr });
                        }
                        const deleted = this.changes;
                        db.run('VACUUM', () => {
                            db.close();
                            logger.info({ deleted }, 'DB Compression complete');
                            resolve({ ok: true, value: deleted });
                        });
                    });
                });
            });
        });
    }

    /**
     * Backup the database to a secondary location.
     */
    async backup(): Promise<Result<string>> {
        try {
            if (!fs.existsSync(this.dbPath)) {
                return { ok: false, error: new Error('Cannot backup: learning memory is completely empty.') };
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupDir = join(dirname(this.dbPath), 'backups');
            if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

            const backupPath = join(backupDir, `learning-backup-${timestamp}.db`);
            fs.copyFileSync(this.dbPath, backupPath);
            return { ok: true, value: backupPath };
        } catch (error) {
            return { ok: false, error: error as Error };
        }
    }
    public healthCheck(): { online: boolean; details: string } {
        const exists = fs.existsSync(this.dbPath);
        return {
            online: exists,
            details: exists ? `Database found: ${this.dbPath}` : `Database substrate missing: ${this.dbPath}`
        };
    }
}

