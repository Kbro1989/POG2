import { PortalDefinition, WorldAnchor } from './types.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('UnifiedPortalRegistry');

export class UnifiedPortalRegistry {
    private portals: Map<string, PortalDefinition> = new Map();

    constructor() {}

    /**
     * Register a bidirectional portal link.
     */
    public register(def: PortalDefinition): void {
        const key = this.generateKey(def.rscId, def.rs3Id);
        this.portals.set(key, def);
        logger.debug(`[REGISTRY] Linked Portal ${def.semanticLabel}: RSC(${def.rscId}) <-> RS3(${def.rs3Id})`);
    }

    public find(anchor: WorldAnchor, action: string): PortalDefinition | undefined {
        // We search by coords/plane first, as portals are often the only interactable at a specific tile
        for (const portal of this.portals.values()) {
            // Simplified spatial check: just matching the coordinates if present in the def's destination
            // In a real system, we'd match the anchor against the portal's source location.
            if (anchor.x === portal.destination.x && anchor.y === portal.destination.y) {
                // Check if action matches semantic label or common command (up/down/enter)
                if (portal.semanticLabel.toLowerCase().includes(action.toLowerCase()) ||
                    action.toLowerCase() === 'enter' ||
                    action.toLowerCase() === 'climb up') {
                    return portal;
                }
            }
        }
        return undefined;
    }

    private generateKey(rscId: number, rs3Id: number): string {
        return `portal:${rscId}_${rs3Id}`;
    }

    public getAll(): PortalDefinition[] {
        return Array.from(this.portals.values());
    }
}
