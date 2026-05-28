/**
 * PlayerStateExporter.ts
 *
 * Exporter for POG2 sovereign state.
 * Converts simulation state into a compact, canonical string format.
 * Enables progress injection and deterministic state snapshots.
 */

import { HydratedPlayerConfig } from '../engines/gameplay/PlayerStateHydrator.js';
import { createLogger } from './logger.js';

const logger = createLogger('PlayerStateExporter');

export class PlayerStateExporter {
    /**
     * Converts a hydrated player config into a serialized snapshot string.
     * Format: v<version>:<tick>:<serialized_data>
     * Serialization: Base64 compressed JSON or custom compact format.
     */
    public static serialize(config: HydratedPlayerConfig): string {
        const snapshot = {
            t: config.savedAtTick,
            h: config.currentHp,
            a: config.adrenaline,
            p: config.prayer,
            s: config.skills,
            e: config.equipment,
            c: config.spawnCoord,
            ab: config.actionBarSlots
        };

        const json = JSON.stringify(snapshot);
        // Compact for the "string save format" requirement
        const compressed = Buffer.from(json).toString('base64');
        return `v1:${config.savedAtTick}:${compressed}`;
    }

    public static deserialize(snapshotStr: string): any {
        const [version, tick, data] = snapshotStr.split(':');
        if (version !== 'v1') throw new Error('Unsupported save version');

        const json = Buffer.from(data, 'base64').toString('utf8');
        return JSON.parse(json);
    }
}
