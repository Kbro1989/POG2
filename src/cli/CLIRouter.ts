import { OrchestrateEngine } from '../engines/OrchestrateEngine.js';

export class CLIRouter {
    constructor(private engine: OrchestrateEngine) {}

    async routeGameplayVolition(opts: { adren?: number; stance?: string; tactical?: string; leader?: string; archetype?: string }) {
        return this.engine.executeTool('gameplay_sovereignty_volition', opts);
    }

    async routeCacheForensics(method: string, target: string) {
        return this.engine.executeTool('cache_forensics_lookup', { method, target });
    }

    async routeSpatialInitialize(opts?: { loadGrounding?: {x: number, z: number}, loadLogic?: string }) {
        return this.engine.executeTool('spatial_sovereignty_init', opts || {});
    }

    async routeEntityMemory(id: string, memory: any) {
        return this.engine.executeTool('entity_limb_memory', { id, memory });
    }

    async routeEntityAction(id: string) {
        return this.engine.executeTool('entity_limb_action', { id });
    }

    async routeEntityIdentity(id: string, update: any) {
        return this.engine.executeTool('entity_limb_identity', { id, update });
    }

    async routeHUDForensics(method: 'getInterface' | 'searchInterfaces' | 'scanAtlas' | 'extractAllInterfaces' | 'healthCheck', target?: any) {
        return this.engine.executeTool('hud_forensics_scan', { method, target });
    }

    async routeHUDForensicsBatch(requests: Array<{method: 'getInterface' | 'searchInterfaces', target: string | number}>) {
        return this.engine.executeTool('hud_forensics_batch', { requests });
    }
}
