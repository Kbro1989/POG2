import { OBJECT_INTERACTION_STORE, getInteractionResult } from '../../forensics/ObjectBinaryStore.js';

export type ProbeState = 'IDLE' | 'TRACE' | 'BUMP_DETECTED' | 'INTERACTING' | 'TRANSITING';

export interface ProbeSimulationState {
    probeId: number;
    entityId: number; // 3597 or 7015
    state: ProbeState;
    coords: { x: number, z: number, plane: number };
    targetCoords?: { x: number, z: number, plane: number };
    lastBumpedObjectId?: number;
}

/**
 * Sovereign Interaction Limb
 * Neural controller for autonomous spatial probes.
 */
export class SovereignInteractionLimb {
    private activeProbes: Map<number, ProbeSimulationState> = new Map();

    constructor() {
        console.log("SovereignInteractionLimb: Neural Interaction initialized.");
    }

    /**
     * Registers a new probe for autonomous archaeology.
     */
    public registerProbe(probeId: number, entityId: number, startCoords: { x: number, z: number, plane: number }) {
        this.activeProbes.set(probeId, {
            probeId,
            entityId,
            state: 'IDLE',
            coords: startCoords
        });
        console.log(`Probe Registered: ${probeId} (Entity: ${entityId}) at ${JSON.stringify(startCoords)}`);
    }

    /**
     * Core Simulation Tick: Drives probe decision logic.
     */
    public onTick() {
        for (const [id, probe] of this.activeProbes) {
            this.processProbeLogic(probe);
        }
    }

    private processProbeLogic(probe: ProbeSimulationState) {
        switch (probe.state) {
            case 'IDLE':
                this.initiateTrace(probe);
                break;
            case 'BUMP_DETECTED':
                this.handleBump(probe);
                break;
            case 'INTERACTING':
                this.finalizeInteraction(probe);
                break;
            default:
                // No-op for TRACE and TRANSITING (handled by spatial limb)
                break;
        }
    }

    private initiateTrace(probe: ProbeSimulationState) {
        // AI Logic: Find an unmapped direction
        probe.state = 'TRACE';
        console.log(`Probe ${probe.probeId}: Initiating trace...`);
    }

    private handleBump(probe: ProbeSimulationState) {
        if (!probe.lastBumpedObjectId) {
            probe.state = 'IDLE';
            return;
        }

        const interaction = getInteractionResult(probe.lastBumpedObjectId);
        if (interaction) {
            console.log(`Probe ${probe.probeId}: Interaction Link found for Object ${probe.lastBumpedObjectId} -> ${interaction.action}`);
            probe.state = 'INTERACTING';
        } else {
            console.log(`Probe ${probe.probeId}: No Interaction Link for Object ${probe.lastBumpedObjectId}. Turning...`);
            probe.state = 'IDLE'; // AI fallback
        }
    }

    private finalizeInteraction(probe: ProbeSimulationState) {
        // Logic: Simulate the result of the interaction (e.g. door opening)
        // This would be synchronized with the local WorldSubstrate.
        probe.state = 'TRACE';
        console.log(`Probe ${probe.probeId}: Interaction complete. Path cleared.`);
    }

    /**
     * External Trigger: Called by the Spatial Limb when a collision occurs.
     */
    public notifyBump(probeId: number, objectId: number) {
        const probe = this.activeProbes.get(probeId);
        if (probe) {
            probe.state = 'BUMP_DETECTED';
            probe.lastBumpedObjectId = objectId;
        }
    }
}
