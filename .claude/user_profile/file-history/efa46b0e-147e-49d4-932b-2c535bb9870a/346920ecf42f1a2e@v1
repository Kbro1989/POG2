import { existsSync, promises as fsPromises } from 'fs';
import { join } from 'path';
import { createLogger } from './logger.js';

const logger = createLogger('ImageArtifactCleaner');

/**
 * ImageArtifactCleaner — Global cleanup policy for POG2 image artifacts
 * 
 * Automatically prunes old PNG/JPG/GIF files from known capture locations
 * when they exceed retention thresholds. Runs on-demand or periodically.
 */
export class ImageArtifactCleaner {
    private static readonly RETENTION_LIMIT = 50;
    
    // Known POG2 image output directories
    private static readonly IMAGE_DIRS = [
        { path: 'session_dashboards/*/sovereign_eye', desc: 'SovereignEye captures' },
        { path: 'audit_output', desc: 'Chromatic audits' },
        { path: 'public/gameplay/assets/captures', desc: 'Gameplay captures' }
    ];

    /**
     * Scan all known image directories and prune old artifacts.
     * Returns summary of cleanup actions taken.
     */
    public static async sweepAllImageDirs(maxRetention: number = this.RETENTION_LIMIT): Promise<{ cleaned: boolean; summary: string }> {
        let totalDeleted = 0;
        const reports: string[] = [];

        for (const dir of this.IMAGE_DIRS) {
            const deleted = await this.pruneDirectory(dir.path, maxRetention);
            totalDeleted += deleted;
            if (deleted > 0) {
                reports.push(`${dir.desc}: deleted ${deleted} old files`);
            }
        }

        const summary = totalDeleted === 0
            ? 'No image cleanup needed; all directories within retention limits'
            : `Cleaned ${totalDeleted} stray image artifacts:\n  • ${reports.join('\n  • ')}`;

        return {
            cleaned: totalDeleted > 0,
            summary
        };
    }

    /**
     * Prune a single directory, deleting oldest files when count exceeds maxRetention.
     */
    private static async pruneDirectory(dirPattern: string, maxRetention: number): Promise<number> {
        try {
            const fullPath = join(process.cwd(), dirPattern);

            // Skip if directory doesn't exist
            if (!existsSync(fullPath)) {
                return 0;
            }

            const entries = await fsPromises.readdir(fullPath);
            const imageFiles = entries.filter(name => /\.(png|jpg|jpeg|webp|gif)$/i.test(name));

            if (imageFiles.length <= maxRetention) {
                return 0;
            }

            // Collect file stats and sort by modification time (oldest first)
            const stats = await Promise.all(
                imageFiles.map(async (name) => {
                    const filePath = join(fullPath, name);
                    const stat = await fsPromises.stat(filePath);
                    return { name, path: filePath, mtimeMs: stat.mtimeMs };
                })
            );

            stats.sort((a, b) => a.mtimeMs - b.mtimeMs);
            const deleteCount = stats.length - maxRetention;

            // Delete oldest files
            for (let i = 0; i < deleteCount; i++) {
                try {
                    await fsPromises.unlink(stats[i].path);
                } catch (err) {
                    logger.warn({ file: stats[i].name }, `Failed to delete artifact: ${(err as Error).message}`);
                }
            }

            logger.info({ location: dirPattern, deleted: deleteCount, retained: maxRetention }, 'Image artifacts pruned');
            return deleteCount;
        } catch (err) {
            logger.warn({ dirPattern, err }, 'Failed to prune directory');
            return 0;
        }
    }

    /**
     * Start a periodic cleanup job (runs every 5 minutes).
     */
    public static startPeriodicCleaner(intervalMs: number = 5 * 60 * 1000): NodeJS.Timer {
        logger.info({ intervalMs }, 'Starting periodic image artifact cleaner');

        return setInterval(async () => {
            const result = await this.sweepAllImageDirs();
            if (result.cleaned) {
                logger.info(result.summary);
            }
        }, intervalMs);
    }
}
