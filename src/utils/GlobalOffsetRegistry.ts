import * as fs from 'fs';
import * as path from 'path';
import { createLogger } from './logger.js';
import { Result, ok, err } from '../core/models.js';

const logger = createLogger('GlobalOffsetRegistry');
const OFFSET_STORAGE_PATH = path.join(process.cwd(), 'memory', 'global_offset.json');

export interface Offset {
    dx: number;
    dy: number;
    dz: number;
    heightPx: number; // For Bone Index 8 skeletal alignment
    timestamp: number;
}

/**
 * GlobalOffsetRegistry - The authoritative drift correction table.
 * Resolves the "Uncanny Gap" between 2017 legacy data and 2026 splats.
 */
export class GlobalOffsetRegistry {
    private static instance: GlobalOffsetRegistry;
    private currentOffset: Offset = { dx: 0, dy: 0, dz: 0, heightPx: 120, timestamp: 0 };
    private regionOffsets: Map<string, Offset> = new Map();

    private constructor() {
        this.loadState();
    }

    public static getInstance(): GlobalOffsetRegistry {
        if (!GlobalOffsetRegistry.instance) {
            GlobalOffsetRegistry.instance = new GlobalOffsetRegistry();
        }
        return GlobalOffsetRegistry.instance;
    }

    /**
     * updateOffset - Sets the current global offset calculated by the ForensicReconciler.
     */
    public updateOffset(dx: number, dy: number, dz: number, regionKey?: string): void {
        const newOffset: Offset = {
            dx,
            dy,
            dz,
            heightPx: 120, // Authoritative Beta Height for Bone 8
            timestamp: Date.now()
        };

        this.currentOffset = newOffset;
        if (regionKey) {
            this.regionOffsets.set(regionKey, newOffset);
        }

        logger.info({ dx: dx.toFixed(3), dy: dy.toFixed(3), regionKey }, '[OFFSET] Sovereignty Anchored.');
        this.saveState();
    }

    public getCurrentOffset(): Offset {
        return this.currentOffset;
    }

    /**
     * applyOffset - Applies the calculated drift to a legacy coordinate.
     */
    public applyOffset(x: number, y: number, plane: number): { x: number, y: number, plane: number } {
        return {
            x: x + this.currentOffset.dx,
            y: y + this.currentOffset.dy,
            plane: plane + this.currentOffset.dz
        };
    }

    /**
     * ground - Static convenience to ground a legacy coordinate.
     */
    public static ground(x: number, y: number, plane: number = 0): { x: number, y: number, plane: number } {
        return this.getInstance().applyOffset(x, y, plane);
    }

    /**
     * getRaycastHeight - Returns the dynamic height offset for skeletal interaction.
     */
    public getRaycastHeight(): number {
        return this.currentOffset.heightPx;
    }

    /**
     * reset - Simulates a total loss of grounding (e.g., world hop or cache corruption).
     */
    public reset(): void {
        this.currentOffset = { dx: 0, dy: 0, dz: 0, heightPx: 120, timestamp: Date.now() };
        this.regionOffsets.clear();
        logger.warn('[OFFSET] Grounding state purged. Adversarial reset initiated.');
    }

    /**
     * pop - Force a vertical displacement to clear collision mesh entombment.
     * $Z_{new} = Z_{current} + 1.0$
     * 
     * Refined: Now substrate-aware. Attempts to find the nearest walkable plane.
     */
    public async pop(x?: number, y?: number, currentPlane?: number): Promise<Result<{ newZ: number, offsetChange: number }>> {
        const oldZ = this.currentOffset.dz;
        
        if (x !== undefined && y !== undefined && currentPlane !== undefined) {
            try {
                // Dynamic import to avoid potential circularity in future expansions
                const { SpatialSovereigntyLimb } = await import('../limbs/spatial/SpatialSovereigntyLimb.js');
                const spatial = SpatialSovereigntyLimb.getInstance();
                await spatial.initialize();
                await spatial.ensureMapsquare(x, y);

                let targetPlane = -1;
                // Scan HIGHER planes for walkability to ensure displacement
                for (let p = currentPlane + 1; p < 4; p++) {
                    if (spatial.isWalkable(p, x, y)) {
                        targetPlane = p;
                        break;
                    }
                }

                if (targetPlane !== -1) {
                    this.currentOffset.dz = targetPlane - currentPlane;
                    logger.info({ targetPlane, dz: this.currentOffset.dz }, '[OFFSET] Vertical Pop Snapped to Walkable Surface.');
                    this.currentOffset.timestamp = Date.now();
                    this.saveState();
                    return ok({ newZ: this.currentOffset.dz, offsetChange: this.currentOffset.dz - oldZ });
                }
            } catch (error) {
                logger.error({ error }, '[OFFSET] Failed to resolve substrate during pop. Falling back to blind increment.');
            }
        }

        // Blind Fallback: Force a floor jump
        this.currentOffset.dz += 1.0;
        this.currentOffset.timestamp = Date.now();
        logger.warn({ newZ: this.currentOffset.dz }, '[OFFSET] Vertical Pop Triggered (Blind Increment).');
        this.saveState();
        return ok({ newZ: this.currentOffset.dz, offsetChange: 1.0 });
    }

    /**
     * setManualOffset - Direct override for forensic grounding calibration.
     */
    public setManualOffset(dx: number, dy: number, dz: number): void {
        this.currentOffset = { dx, dy, dz, heightPx: 120, timestamp: Date.now() };
        logger.info({ dx, dy, dz }, '[OFFSET] Manual Forensic Anchor Set.');
        this.saveState();
    }

    private saveState(): void {
        try {
            const dir = path.dirname(OFFSET_STORAGE_PATH);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(OFFSET_STORAGE_PATH, JSON.stringify(this.currentOffset, null, 2));
            logger.debug('[OFFSET] Persistent state saved.');
        } catch (err) {
            logger.error({ err }, 'Failed to save GlobalOffsetRegistry state.');
        }
    }

    private loadState(): void {
        try {
            if (fs.existsSync(OFFSET_STORAGE_PATH)) {
                const data = JSON.parse(fs.readFileSync(OFFSET_STORAGE_PATH, 'utf8'));
                this.currentOffset = data;
                logger.info({ offset: data }, '[OFFSET] Persistent state hydrated from substrate.');
            }
        } catch (err) {
            logger.warn({ err }, 'Failed to load GlobalOffsetRegistry state; using defaults.');
        }
    }
}
