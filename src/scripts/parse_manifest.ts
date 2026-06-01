import fs from 'fs';
import path from 'path';

export interface SovereignEntity {
  id: string;
  coord: { x: number; y: number; plane: number };
  type: string;
  hexagramWeight: number;
  meaningLinks: string[];
  actionIndex: number;
  raw: Record<string, any>;
}

export interface SovereignState {
  world: {
    entities: SovereignEntity[];
    bounds: { wx_min: number; wx_max: number; wy_min: number; wy_max: number };
  };
  metadata: { source: string; extractedAt: number; cacheRevision?: number };
}

export async function parseManifestToSovereignState(manifestPath: string): Promise<SovereignState> {
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const entities: SovereignEntity[] = (raw.entities || []).map((e: any, index: number) => ({
    id: e.id || e.entityId || `entity_${index}`,
    coord: e.coord ? { x: e.coord.x, y: e.coord.z ?? e.coord.y, plane: e.coord.plane } : { x: 0, y: 0, plane: 0 },
    type: inferType(e),
    hexagramWeight: calculateHexagramWeight(e),
    meaningLinks: extractMeaningLinks(e),
    actionIndex: index, // order of appearance in manifest
    raw: e,
  }));

  // Compute bounds from entity coordinates
  const xs = entities.map(e => e.coord.x);
  const ys = entities.map(e => e.coord.y);
  
  return {
    world: {
      entities,
      bounds: {
        wx_min: xs.length ? Math.min(...xs) : 0,
        wx_max: xs.length ? Math.max(...xs) : 0,
        wy_min: ys.length ? Math.min(...ys) : 0,
        wy_max: ys.length ? Math.max(...ys) : 0,
      },
    },
    metadata: {
      source: manifestPath,
      extractedAt: Date.now(),
      cacheRevision: raw.cacheRevision,
    },
  };
}

function inferType(entity: any): string {
  if (entity.dbTable === 'npcs' || entity.entityId) return 'npc';
  if (entity.dbTable === 'objects') return 'object';
  if (entity.dbTable === 'items') return 'item';
  return entity.type || 'unknown';
}

function calculateHexagramWeight(entity: any): number {
  const type = inferType(entity);
  const typeWeights: Record<string, number> = { npc: 1, object: 1, item: 0, player: 2, boss: 3 };
  let weight = typeWeights[type] ?? 1;
  const title = (entity.title || '').toLowerCase();
  if (title.includes('boss') || title.includes('king') || title.includes('queen')) weight += 2;
  if (title.includes('guard') || title.includes('knight')) weight += 1;
  if (entity.dbTable === 'npcs' && entity.grounded) weight += 1;
  return Math.min(weight, 6);
}

function extractMeaningLinks(entity: any): string[] {
  const links: string[] = [];
  if (entity.title) links.push(`entity:${entity.title}`);
  if (entity.dbTable) links.push(`table:${entity.dbTable}`);
  if (entity.dbRowId) links.push(`row:${entity.dbRowId}`);
  if (entity.grounded) links.push('state:grounded');
  return links;
}

