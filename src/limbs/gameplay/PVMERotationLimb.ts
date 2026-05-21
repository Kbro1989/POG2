import { WikiRotation } from '../../utils/WikiEnricher.js';
import { createLogger } from '../../utils/logger.js';
import { readFileSync, existsSync } from 'fs';
import * as fs from 'fs';
import { join } from 'path';

const logger = createLogger('PVMERotationLimb');

export interface PVMEBossData {
    boss: string;
    lastUpdated: string;
    bestiary: Record<string, string>;
    rotations: WikiRotation[];
}

/**
 * PVMERotationLimb
 * 
 * Manages the execution of high-fidelity combat sequences ingested from PVME.
 * Handles phase-specific transitions and rotation selection.
 */
export class PVMERotationLimb {
    private static instance: PVMERotationLimb;
    private bossData: Map<string, PVMEBossData> = new Map();
    private activeSequences: Map<string, { boss: string; rotationIdx: number; abilityIdx: number }> = new Map();
    private globalPhases: Map<string, string> = new Map();

    private constructor() {
        this.loadIngestedData();
    }

    public static getInstance(): PVMERotationLimb {
        if (!this.instance) {
            this.instance = new PVMERotationLimb();
        }
        return this.instance;
    }

    private loadIngestedData(): void {
        const dataDir = join(process.cwd(), 'data', 'pvme');
        if (!existsSync(dataDir)) return;

        const files = fs.readdirSync(dataDir);
        for (const file of files) {
            if (!file.endsWith('.json')) continue;
            const p = join(dataDir, file);
            try {
                const data = JSON.parse(readFileSync(p, 'utf8')) as PVMEBossData;
                this.bossData.set(data.boss.toLowerCase(), data);
                logger.info({ boss: data.boss, file }, 'Loaded PVME rotation data');
            } catch (err) {
                logger.error({ file, err }, 'Failed to load PVME data');
            }
        }
    }

    /**
     * Get the next ability from the PVME rotation for a given target.
     * Returns null if no PVME data exists for the target or rotation is complete.
     */
    public getNextAbility(entityId: string, bossName: string): { name: string, predicate?: string } | null {
        const data = this.bossData.get(bossName.toLowerCase());
        if (!data || data.rotations.length === 0) return null;

        let active = this.activeSequences.get(entityId);
        if (!active || active.boss !== bossName) {
            // Start a new sequence (default to first Advanced rotation if possible)
            const rotIdx = data.rotations.findIndex(r => r.label.toLowerCase().includes('advanced')) || 0;
            active = { boss: bossName, rotationIdx: rotIdx >= 0 ? rotIdx : 0, abilityIdx: 0 };
            this.activeSequences.set(entityId, active);
            logger.info({ boss: bossName, entityId, rotation: data.rotations[active.rotationIdx].label }, 'Started PVME sequence');
        }

        const rotation = data.rotations[active.rotationIdx];
        if (active.abilityIdx >= rotation.abilities.length) {
            // Rotation complete, restart or loop
            active.abilityIdx = 0;
        }

        const abilityObj = rotation.abilities[active.abilityIdx];
        active.abilityIdx++;
        
        return abilityObj;
    }

    /**
     * Get the next ability from the PVME rotation for a given target.
     * Returns null if no PVME data exists for the target or rotation is complete.
     */
    public peekNextAbility(entityId: string, bossName: string): { name: string, predicate?: string } | null {
        const data = this.bossData.get(bossName.toLowerCase());
        if (!data || data.rotations.length === 0) return null;

        let active = this.activeSequences.get(entityId);
        if (!active || active.boss !== bossName) {
            // Lazy init using global phase if available
            const phase = this.globalPhases.get(bossName.toLowerCase()) || 'default';
            let rotIdx = data.rotations.findIndex(r => r.section.toLowerCase().includes(phase.toLowerCase()));
            if (rotIdx === -1) rotIdx = 0;

            active = { boss: bossName, rotationIdx: rotIdx, abilityIdx: 0 };
            this.activeSequences.set(entityId, active);
        }

        const rotation = data.rotations[active.rotationIdx];
        const idx = active.abilityIdx >= rotation.abilities.length ? 0 : active.abilityIdx;
        
        return rotation.abilities[idx];
    }

    public getActiveRotationLabel(id: string): string | undefined {
        const active = this.activeSequences.get(id);
        if (active) {
            const data = this.bossData.get(active.boss.toLowerCase());
            return data?.rotations[active.rotationIdx]?.section || data?.rotations[active.rotationIdx]?.label;
        }

        const global = this.globalPhases.get(id.toLowerCase());
        if (global) return global;

        return undefined;
    }

    /**
     * Reset the active sequence for an entity (e.g. on target swap or death).
     */
    public resetSequence(entityId: string): void {
        this.activeSequences.delete(entityId);
    }

    /**
     * Set the specific phase/section of a rotation.
     * Can be called with a boss name (global) or entityId (specific instance).
     */
    public setPhase(id: string, sectionName: string): void {
        const key = id.toLowerCase();
        
        // Update global phase for future sequences
        if (this.bossData.has(key)) {
            this.globalPhases.set(key, sectionName);
        }

        // Update active sequence if it exists
        const active = this.activeSequences.get(id);
        if (active) {
            const data = this.bossData.get(active.boss.toLowerCase());
            if (data) {
                const newRotIdx = data.rotations.findIndex(r => r.section.toLowerCase().includes(sectionName.toLowerCase()));
                if (newRotIdx >= 0) {
                    active.rotationIdx = newRotIdx;
                    active.abilityIdx = 0;
                    logger.info({ id, section: sectionName }, 'Switched active rotation phase');
                }
            }
        }
    }
}
