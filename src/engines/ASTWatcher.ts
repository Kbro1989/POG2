import { EventEmitter } from 'events';
import * as chokidar from 'chokidar';
import { readFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { SovereignIgnoreManager } from '../utils/SovereignIgnoreManager.js';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('ASTWatcher');

export interface WatcherEvents {
    fileChanged: (data: { filePath: string; hasStructuralChange: boolean }) => void;
    watchError: (data: { error: Error }) => void;
}

/**
 * ASTWatcher - File system monitoring with structural change detection.
 */
export class ASTWatcher extends EventEmitter {
    private watcher?: chokidar.FSWatcher;
    private readonly fileHashes: Map<string, string> = new Map();

    constructor(private readonly projectRoot: string) {
        super();
    }

    async setProjectRoot(newRoot: string): Promise<void> {
        logger.info({ newRoot }, 'Updating AST Watcher root');
        if (this.watcher) await this.watcher.close();
        this.initialize();
    }

    initialize(): void {
        try {
            this.watcher = chokidar.watch(this.projectRoot, {
                ignored: (path: string) => {
                    return SovereignIgnoreManager.isIgnored(this.projectRoot, path);
                },
                persistent: true,
                ignoreInitial: false
            });

            this.watcher
                .on('add', (filePath: string) => this.handleFileChange(filePath, false))
                .on('change', (filePath: string) => this.handleFileChange(filePath, true))
                .on('error', (err: unknown) => {
                    const error = err instanceof Error ? err : new Error(String(err));
                    logger.error({ error }, 'TSC watch error');
                });

        } catch (error) {
            logger.error({ error }, 'Failed to initialize watcher');
        }
    }

    private handleFileChange(filePath: string, isUpdate: boolean): void {
        try {
            if (!existsSync(filePath)) return;
            const content = readFileSync(filePath, 'utf-8');
            const hash = createHash('md5').update(content).digest('hex');
            const prev = this.fileHashes.get(filePath);

            if (hash === prev) return;
            this.fileHashes.set(filePath, hash);

            if (isUpdate) {
                this.emit('fileChanged', { filePath, hasStructuralChange: true });
            }
        } catch { /* ignore read failures */ }
    }

    async stop(): Promise<void> {
        if (this.watcher) await this.watcher.close();
        this.removeAllListeners();
    }

    public healthCheck(): { online: boolean; details: string } {
        return {
            online: !!this.watcher,
            details: this.watcher ? `ASTWatcher active; monitoring ${this.fileHashes.size} files.` : 'ASTWatcher inactive.'
        };
    }
}
