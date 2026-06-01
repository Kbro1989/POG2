// Spatial metrics derived from cache models for predictive intelligence

export interface SpatialMetrics {
  entityId: number;
  entityType: 'npc' | 'item' | 'object' | 'player';
  
  // Raw cache-derived dimensions (model units)
  dimensions: {
    x: number;  // Width
    y: number;  // Depth  
    z: number;  // Height
  };
  
  // Converted to game tiles (sovereign standard)
  tileScale: {
    radius: number;      // max(x,y) / 2 / 512
    height: number;      // z / 512
    volume: number;      // (x*y*z) / (512^3)
  };
  
  // Mesh complexity (for LOD decisions)
  polyCount: number;
  
  // Provenance
  cacheRevision: number;
  extractionTimestamp: number;
  sourceFile: string;    // e.g., "pedagogy_profile.json"
}

