import { WikiEnricher, WikiRotation } from './WikiEnricher.js';
import { createLogger } from './logger.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const logger = createLogger('PVMEIngester');

export class PVMEIngester {
    private static DATA_DIR = join(process.cwd(), 'data', 'pvme');

    /**
     * Pull rotations for a list of bosses and save to JSON.
     */
    public static async ingestBosses(bossNames: string[]): Promise<void> {
        if (!existsSync(this.DATA_DIR)) {
            mkdirSync(this.DATA_DIR, { recursive: true });
        }

        for (const boss of bossNames) {
            try {
                logger.info({ boss }, 'Ingesting PVME data for boss');
                const rotations = await WikiEnricher.fetchRotations(boss);
                const bestiary = await WikiEnricher.fetchBestiaryData(boss);

                // Sanitize and download icons
                const iconDir = join(process.cwd(), 'web_hud', 'public', 'icons');
                for (const rot of rotations) {
                    for (const ability of rot.abilities) {
                        await WikiEnricher.downloadAsset(ability.name, iconDir);
                    }
                }

                const data = {
                    boss,
                    lastUpdated: new Date().toISOString(),
                    bestiary,
                    rotations
                };

                const filename = `${boss.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
                writeFileSync(join(this.DATA_DIR, filename), JSON.stringify(data, null, 2));
                logger.info({ boss, rotations: rotations.length }, 'Saved PVME data');
            } catch (err) {
                logger.error({ boss, err }, 'Failed to ingest boss data');
            }
        }
    }
}

