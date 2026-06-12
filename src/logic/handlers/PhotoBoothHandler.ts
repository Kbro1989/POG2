import { createLogger } from '../../utils/logger.js';
import { type Result, ok, err } from '../../core/models.js';
import { RSMVController } from '../../vision/RSMVController.js';
import { EntityLimb } from '../../limbs/technical/EntityLimb.js';
import { HiScoreLimb, type StatsSnapshot } from '../../limbs/technical/HiScoreLimb.js';
import { join } from 'path';

const logger = createLogger('PhotoBoothHandler');

/**
 * PhotoBoothHandler - Orchestrates the "Snapshot" clinical logic.
 * Bridges 3D Avatar capture (Vision) with Persistent Identity (Technical).
 */
export class PhotoBoothHandler {
    private static instance: PhotoBoothHandler | undefined;

    public static getInstance(): PhotoBoothHandler {
        if (!this.instance) {
            this.instance = new PhotoBoothHandler();
        }
        return this.instance;
    }

    /**
     * takeSnapshot - Captures the full 3D and statistical identity of a player.
     * Mirrors the RS3 "Photo Booth" interaction.
     */
    public async takeSnapshot(playerName: string): Promise<Result<{
        id: string,
        stats: StatsSnapshot,
        modelPath: string
    }>> {
        logger.info({ playerName }, 'Initiating Clinical Snapshot Sequence...');

        const entityLimb = EntityLimb.getInstance();
        const rsmv = RSMVController.getInstance();
        const hiscore = new HiScoreLimb();
        const entityId = `player:${playerName.toLowerCase().replace(/ /g, '_')}`;

        try {
            // 1. Capture 3D Identity (Vision)
            // Headless export to GLTF
            const modelFilename = `${entityId}_snapshot.glb`;
            const exportRes = await rsmv.exportGltf(entityId, modelFilename);
            if (!exportRes.ok) {
                return err(new Error(`SNAPSHOT_3D_CAPTURE_FAILED: ${exportRes.error?.message}`));
            }

            // 2. Capture Statistical Identity (Technical)
            const statsRes = await hiscore.fetchStats(playerName);
            if (!statsRes.ok) {
                logger.warn({ playerName }, 'HiScore fetch failed for snapshot; using model-only identity.');
            }
            const stats = statsRes.ok ? statsRes.value : ({} as StatsSnapshot);

            // 3. Bind Identity to Substrate
            const identityUpdate = {
                name: playerName,
                stats: statsRes.ok ? statsRes.value : undefined,
                modelPath: modelFilename
            };

            const bindRes = await entityLimb.updatePlayerIdentity(entityId, identityUpdate);
            if (!bindRes.ok) {
                return err(new Error(`SNAPSHOT_BINDING_FAILED: ${bindRes.error?.message}`));
            }

            // 4. Inject Memory of the Snapshot
            await entityLimb.addMemory(entityId, {
                type: 'identity_snapshot',
                content: {
                    event: 'PLAYER_SNAPSHOT_TAKEN',
                    timestamp: Date.now(),
                    total_skill: stats.totalskill ?? 0,
                    combat_level: stats.combatlevel ?? 0
                },
                weight: 1.5
            });

            logger.info({ entityId }, 'Clinical Snapshot successful.');

            return ok({
                id: entityId,
                stats,
                modelPath: modelFilename
            });

        } catch (error: any) {
            logger.error({ playerName, error }, 'Snapshot sequence encounterd a critical fault.');
            return err(new Error(`SNAPSHOT_SEQUENCER_CRUSHED: ${error.message}`));
        }
    }
}

