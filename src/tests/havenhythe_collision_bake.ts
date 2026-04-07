/**
 * HAVENHYTHE COLLISION BAKE - Phase 1 Hybrid Synthesis
 * 
 * Objective: Ingest raw m_58_52 placement metadata and bake explicit
 * walkable terrain matrix for SpatialSovereigntyLimb.
 * 
 * Target: Validate (3712, 3328) walkability or find nearest clear tile.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('HavenhytheCollisionBake');

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CONFIGURATION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const HAVENHYTHE_BOUNDS = {
  xMin: 3667,
  xMax: 3834,
  yMin: 3281,
  yMax: 3412,
  planeMin: 0,
  planeMax: 2
};

const TARGET_INSERTION = {
  x: 3712,
  y: 3328,
  plane: 0
};

const RAW_METADATA_PATH = 'D:/sovereign/atlas/spatial/havenhythe_raw.json';
const OUTPUT_MATRIX_PATH = 'D:/sovereign/atlas/spatial/havenhythe_collision_matrix.json';
const OUTPUT_VALIDATION_PATH = 'D:/sovereign/atlas/spatial/havenhythe_validation_report.json';

// Collision type encoding (matches your Tower of Voices grid)
const CELL = {
  WALKABLE: '.',      // Open terrain
  TERRAIN: 'T',       // Solid structure (walls, buildings)
  OBJECT: 'O',        // Interactive object (walkable around)
  BLOCKED: 'X',       // Both terrain + object (impassable)
  WATER: '~',         // Unwalkable liquid
  UNKNOWN: '?'        // Unclassified
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CORE CLASSES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

class CollisionMatrix {
  private grid: Map<string, string> = new Map();
  private bounds: typeof HAVENHYTHE_BOUNDS;
  
  constructor(bounds: typeof HAVENHYTHE_BOUNDS) {
    this.bounds = bounds;
    this.initializeEmpty();
  }
  
  private initializeEmpty(): void {
    // Initialize all cells as walkable by default
    for (let plane = this.bounds.planeMin; plane <= this.bounds.planeMax; plane++) {
      for (let y = this.bounds.yMin; y <= this.bounds.yMax; y++) {
        for (let x = this.bounds.xMin; x <= this.bounds.xMax; x++) {
          this.set(x, y, plane, CELL.WALKABLE);
        }
      }
    }
  }
  
  private key(x: number, y: number, plane: number): string {
    return `${plane}:${x}:${y}`;
  }
  
  set(x: number, y: number, plane: number, value: string): void {
    this.grid.set(this.key(x, y, plane), value);
  }
  
  get(x: number, y: number, plane: number): string {
    return this.grid.get(this.key(x, y, plane)) || CELL.UNKNOWN;
  }
  
  isWalkable(x: number, y: number, plane: number): boolean {
    const cell = this.get(x, y, plane);
    return cell === CELL.WALKABLE || cell === CELL.OBJECT;
  }
  
  isBlocked(x: number, y: number, plane: number): boolean {
    const cell = this.get(x, y, plane);
    return cell === CELL.TERRAIN || cell === CELL.BLOCKED || cell === CELL.WATER;
  }
  
  // Export to ASCII grid format (like Tower of Voices visualization)
  exportToAscii(plane: number): string {
    let output = `=== Havenhythe Collision Grid - Plane ${plane} ===\n`;
    output += `Center: [${Math.floor((this.bounds.xMin + this.bounds.xMax) / 2)}, `;
    output += `${Math.floor((this.bounds.yMin + this.bounds.yMax) / 2)}, Plane ${plane}]\n\n`;
    
    // Y-axis top to bottom (north to south)
    for (let y = this.bounds.yMax; y >= this.bounds.yMin; y--) {
      let row = `${y.toString().padStart(5)} | `;
      for (let x = this.bounds.xMin; x <= this.bounds.xMax; x++) {
        // Mark target insertion point
        if (x === TARGET_INSERTION.x && y === TARGET_INSERTION.y && plane === TARGET_INSERTION.plane) {
          row += '@ '; // Target marker
        } else {
          row += this.get(x, y, plane) + ' ';
        }
      }
      output += row + '\n';
    }
    
    output += `\nLegend: . = Walkable | T = Terrain | O = Object | X = Blocked | ~ = Water | @ = Target\n`;
    return output;
  }
  
  // Export to JSON for SpatialSovereigntyLimb ingestion
  exportToJSON(): object {
    const serialized: any = {
      metadata: {
        region: 'havenhythe',
        regionId: 14900,
        regionX: 58,
        regionY: 52,
        bounds: this.bounds,
        totalCells: this.grid.size,
        bakedAt: new Date().toISOString()
      },
      matrices: {}
    };
    
    for (let plane = this.bounds.planeMin; plane <= this.bounds.planeMax; plane++) {
      serialized.matrices[plane] = {};
      for (let y = this.bounds.yMin; y <= this.bounds.yMax; y++) {
        serialized.matrices[plane][y] = {};
        for (let x = this.bounds.xMin; x <= this.bounds.xMax; x++) {
          serialized.matrices[plane][y][x] = this.get(x, y, plane);
        }
      }
    }
    
    return serialized;
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ENTITY CLASSIFICATION ENGINE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

class EntityClassifier {
  // Object ID ranges and their collision profiles
  private static COLLISION_PROFILES: Record<string, { type: string, blocks: boolean }> = {
    // Terrain/Structure (BLOCKED - X)
    'wall': { type: CELL.BLOCKED, blocks: true },
    'gate': { type: CELL.BLOCKED, blocks: true },
    'door': { type: CELL.OBJECT, blocks: false }, // Walkable but interactable
    'cave exit': { type: CELL.OBJECT, blocks: false },
    
    // Decorative (WALKABLE - . or OBJECT - O)
    'table': { type: CELL.OBJECT, blocks: false },
    'stool': { type: CELL.OBJECT, blocks: false },
    'chair': { type: CELL.OBJECT, blocks: false },
    'carpet': { type: CELL.WALKABLE, blocks: false },
    'rug': { type: CELL.WALKABLE, blocks: false },
    'pot': { type: CELL.OBJECT, blocks: false },
    'bowl': { type: CELL.OBJECT, blocks: false },
    'jar': { type: CELL.OBJECT, blocks: false },
    'jug': { type: CELL.OBJECT, blocks: false },
    'goblet': { type: CELL.OBJECT, blocks: false },
    'decanter': { type: CELL.OBJECT, blocks: false },
    'bottle': { type: CELL.OBJECT, blocks: false },
    'vase': { type: CELL.OBJECT, blocks: false },
    'hookah': { type: CELL.OBJECT, blocks: false },
    'lantern': { type: CELL.OBJECT, blocks: false },
    'paintings': { type: CELL.WALKABLE, blocks: false },
    'papers': { type: CELL.WALKABLE, blocks: false },
    'clock': { type: CELL.OBJECT, blocks: false },
    
    // Storage (OBJECT - O, may block if stacked)
    'crate': { type: CELL.OBJECT, blocks: false },
    'barrel': { type: CELL.OBJECT, blocks: false },
    'box': { type: CELL.OBJECT, blocks: false },
    'sack': { type: CELL.OBJECT, blocks: false },
    'sacks': { type: CELL.OBJECT, blocks: false },
    
    // Interactive/Quest (SPECIAL HANDLING)
    'dead smuggler': { type: CELL.OBJECT, blocks: false }, // Walkable over, interactable
    'bat': { type: CELL.WALKABLE, blocks: false }, // Atmospheric, not solid
    
    // Water/Environmental
    'old boat': { type: CELL.OBJECT, blocks: false }, // Docked, walkable deck?
  };
  
  static classify(entity: any): { type: string, blocks: boolean, radius: number } {
    const name = entity.name?.toLowerCase() || '';
    
    // Direct match
    for (const [key, profile] of Object.entries(this.COLLISION_PROFILES)) {
      if (name.includes(key)) {
        return { 
          type: profile.type, 
          blocks: profile.blocks,
          radius: this.calculateRadius(entity)
        };
      }
    }
    
    // Default classification by locType
    switch (entity.locType) {
      case 0: return { type: CELL.TERRAIN, blocks: true, radius: 1 }; // Walls
      case 10: return { type: CELL.OBJECT, blocks: false, radius: 0 }; // Standard objects
      case 11: return { type: CELL.OBJECT, blocks: false, radius: 0 }; // Larger objects
      case 22: return { type: CELL.OBJECT, blocks: false, radius: 0 }; // Wall decorations
      default: return { type: CELL.UNKNOWN, blocks: false, radius: 0 };
    }
  }
  
  private static calculateRadius(entity: any): number {
    // Objects with multiple model IDs = larger footprint
    if (entity.modelIds && entity.modelIds.length > 1) {
      return 1; // 1-tile radius around center
    }
    return 0; // Single tile
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// COLLISION BAKE ENGINE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

class CollisionBakeEngine {
  private matrix: CollisionMatrix;
  private entities: any[];
  
  constructor(entities: any[]) {
    this.matrix = new CollisionMatrix(HAVENHYTHE_BOUNDS);
    this.entities = entities;
  }
  
  bake(): CollisionMatrix {
    logger.info(`Baking collision matrix for ${this.entities.length} entities...`);
    
    // Phase 1: Apply terrain/structure collision (BLOCKED - X)
    this.applyTerrainCollision();
    
    // Phase 2: Apply object collision (OBJECT - O or BLOCKED - X)
    this.applyObjectCollision();
    
    // Phase 3: Apply special quest/narrative zones
    this.applyQuestZones();
    
    logger.info('Collision bake complete.');
    return this.matrix;
  }
  
  private applyTerrainCollision(): void {
    // Infer terrain from entity density and patterns
    // High-density clusters = buildings = BLOCKED
    
    const densityMap = new Map<string, number>();
    
    for (const entity of this.entities) {
      const key = `${entity.plane}:${Math.floor(entity.x / 4)}:${Math.floor(entity.y / 4)}`;
      densityMap.set(key, (densityMap.get(key) || 0) + 1);
    }
    
    // Mark high-density zones as terrain
    for (const [key, count] of densityMap.entries()) {
      if (count > 5) { // Threshold: 5+ objects in 4Ã—4 tile area
        const [plane, chunkX, chunkY] = key.split(':').map(Number);
        // Mark entire chunk as terrain
        for (let dy = 0; dy < 4; dy++) {
          for (let dx = 0; dx < 4; dx++) {
            const x = chunkX * 4 + dx;
            const y = chunkY * 4 + dy;
            if (this.isInBounds(x, y, plane)) {
              this.matrix.set(x, y, plane, CELL.TERRAIN);
            }
          }
        }
      }
    }
  }
  
  private applyObjectCollision(): void {
    for (const entity of this.entities) {
      const classification = EntityClassifier.classify(entity);
      
      // Apply to entity position
      this.matrix.set(entity.x, entity.y, entity.plane, classification.type);
      
      // Apply radius if larger object
      if (classification.radius > 0) {
        for (let dy = -classification.radius; dy <= classification.radius; dy++) {
          for (let dx = -classification.radius; dx <= classification.radius; dx++) {
            const nx = entity.x + dx;
            const ny = entity.y + dy;
            if (this.isInBounds(nx, ny, entity.plane) && (dx !== 0 || dy !== 0)) {
              // Surrounding tiles get OBJECT or TERRAIN based on classification
              const surroundingType = classification.blocks ? CELL.BLOCKED : CELL.OBJECT;
              this.matrix.set(nx, ny, entity.plane, surroundingType);
            }
          }
        }
      }
    }
  }
  
  private applyQuestZones(): void {
    // Special handling for "Dead Smuggler" and other quest triggers
    const smuggler = this.entities.find(e => 
      e.name?.toLowerCase().includes('dead smuggler')
    );
    
    if (smuggler) {
      logger.info(`Found "Dead Smuggler" at (${smuggler.x}, ${smuggler.y}, ${smuggler.plane})`);
      
      // Create 3Ã—3 interactable zone around smuggler
      // Center is walkable (can stand on), perimeter is OBJECT (can interact from)
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const x = smuggler.x + dx;
          const y = smuggler.y + dy;
          if (this.isInBounds(x, y, smuggler.plane)) {
            if (dx === 0 && dy === 0) {
              // Smuggler position - walkable but marked special
              this.matrix.set(x, y, smuggler.plane, 'S'); // S = Story/Narrative
            } else {
              // Surrounding tiles - ensure walkable for approach
              const current = this.matrix.get(x, y, smuggler.plane);
              if (current === CELL.TERRAIN || current === CELL.BLOCKED) {
                this.matrix.set(x, y, smuggler.plane, CELL.OBJECT);
              }
            }
          }
        }
      }
    }
  }
  
  private isInBounds(x: number, y: number, plane: number): boolean {
    return x >= HAVENHYTHE_BOUNDS.xMin && x <= HAVENHYTHE_BOUNDS.xMax &&
           y >= HAVENHYTHE_BOUNDS.yMin && y <= HAVENHYTHE_BOUNDS.yMax &&
           plane >= HAVENHYTHE_BOUNDS.planeMin && plane <= HAVENHYTHE_BOUNDS.planeMax;
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// VALIDATION ENGINE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

class InsertionValidator {
  private matrix: CollisionMatrix;
  
  constructor(matrix: CollisionMatrix) {
    this.matrix = matrix;
  }
  
  validate(target: typeof TARGET_INSERTION): ValidationResult {
    const cell = this.matrix.get(target.x, target.y, target.plane);
    
    logger.info(`\nâ•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—`);
    logger.info(`â•‘       HAVENHYTHE INSERTION VALIDATION REPORT              â•‘`);
    logger.info(`â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•`);
    logger.info(`Target: (${target.x}, ${target.y}, Plane ${target.plane})`);
    logger.info(`Cell Type: [${cell}]`);
    
    const result: ValidationResult = {
      target,
      cellType: cell,
      isWalkable: false,
      nearestClearTile: null,
      distanceToClear: 0,
      pathFromBarrows: []
    };
    
    // Check direct walkability
    if (cell === CELL.WALKABLE || cell === CELL.OBJECT || cell === 'S') {
      result.isWalkable = true;
      logger.info(`Status: âœ… WALKABLE - Avatar can spawn here`);
      return result;
    }
    
    // If blocked, find nearest clear tile
    logger.info(`Status: âŒ BLOCKED - Finding nearest walkable tile...`);
    result.nearestClearTile = this.findNearestWalkable(target);
    
    if (result.nearestClearTile) {
      result.distanceToClear = this.calculateDistance(target, result.nearestClearTile);
      logger.info(`Nearest Clear: (${result.nearestClearTile.x}, ${result.nearestClearTile.y})`);
      logger.info(`Distance: ${result.distanceToClear} tiles`);
      
      // Generate path from Barrows entry
      result.pathFromBarrows = this.generatePath(
        { x: 3564, y: 3298, plane: 0 }, // Barrows
        result.nearestClearTile
      );
    }
    
    return result;
  }
  
  private findNearestWalkable(target: typeof TARGET_INSERTION): typeof TARGET_INSERTION | null {
    // Spiral search outward from target
    for (let radius = 1; radius <= 50; radius++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          // Only check perimeter of current radius
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
          
          const x = target.x + dx;
          const y = target.y + dy;
          
          if (this.matrix.isWalkable(x, y, target.plane)) {
            return { x, y, plane: target.plane };
          }
        }
      }
    }
    return null;
  }
  
  private calculateDistance(a: any, b: any): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Manhattan distance
  }
  
  private generatePath(start: any, end: any): string[] {
    // Simple directional path for reporting
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    const directions: string[] = [];
    if (dx > 0) directions.push(`East ${dx} tiles`);
    if (dx < 0) directions.push(`West ${Math.abs(dx)} tiles`);
    if (dy > 0) directions.push(`North ${dy} tiles`);
    if (dy < 0) directions.push(`South ${Math.abs(dy)} tiles`);
    
    return directions;
  }
}

interface ValidationResult {
  target: typeof TARGET_INSERTION;
  cellType: string;
  isWalkable: boolean;
  nearestClearTile: typeof TARGET_INSERTION | null;
  distanceToClear: number;
  pathFromBarrows: string[];
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN EXECUTION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

async function main() {
  logger.info('â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—');
  logger.info('â•‘     HAVENHYTHE COLLISION BAKE - PHASE 1 HYBRID SYNTHESIS    â•‘');
  logger.info('â•‘              Region 14900 | Mapsquare (58, 52)              â•‘');
  logger.info('â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');
  
  try {
    // Step 1: Load raw metadata
    logger.info(`Loading raw metadata from ${RAW_METADATA_PATH}...`);
    const rawData = JSON.parse(readFileSync(RAW_METADATA_PATH, 'utf8'));
    const entities = rawData.entities || [];
    logger.info(`Loaded ${entities.length} entities\n`);
    
    // Step 2: Bake collision matrix
    const engine = new CollisionBakeEngine(entities);
    const matrix = engine.bake();
    
    // Step 3: Export matrix
    logger.info(`Exporting collision matrix to ${OUTPUT_MATRIX_PATH}...`);
    const matrixJson = matrix.exportToJSON();
    writeFileSync(OUTPUT_MATRIX_PATH, JSON.stringify(matrixJson, null, 2));
    
    // Step 4: Generate ASCII visualization for Plane 0
    const asciiGrid = matrix.exportToAscii(0);
    writeFileSync(
      'D:/sovereign/atlas/spatial/havenhythe_plane0_ascii.txt',
      asciiGrid
    );
    logger.info('ASCII visualization exported for Plane 0\n');
    
    // Step 5: VALIDATE TARGET INSERTION (3712, 3328)
    const validator = new InsertionValidator(matrix);
    const validation = validator.validate(TARGET_INSERTION);
    
    // Step 6: Export validation report
    writeFileSync(OUTPUT_VALIDATION_PATH, JSON.stringify(validation, null, 2));
    
    // Final summary
    logger.info('\nâ•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—');
    logger.info('â•‘                  BAKE COMPLETE                              â•‘');
    logger.info(`â•‘  Matrix Size: ${HAVENHYTHE_BOUNDS.xMax - HAVENHYTHE_BOUNDS.xMin + 1}Ã—${HAVENHYTHE_BOUNDS.yMax - HAVENHYTHE_BOUNDS.yMin + 1}Ã—${HAVENHYTHE_BOUNDS.planeMax - HAVENHYTHE_BOUNDS.planeMin + 1} tiles      â•‘`);
    logger.info(`â•‘  Total Cells: ${(matrix as any).grid?.size || 'calculated'}                          â•‘`);
    logger.info(`â•‘  Target (${TARGET_INSERTION.x}, ${TARGET_INSERTION.y}): ${validation.isWalkable ? 'WALKABLE âœ…' : 'BLOCKED âŒ'}              â•‘`);
    logger.info('â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');
    
    if (!validation.isWalkable && validation.nearestClearTile) {
      logger.info('â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—');
      logger.info('â•‘           AUTO-ADJUSTMENT RECOMMENDATION                    â•‘');
      logger.info(`â•‘  Use: (${validation.nearestClearTile.x}, ${validation.nearestClearTile.y}) instead          â•‘`);
      logger.info('â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
    }
    
  } catch (error) {
    logger.error({ error }, 'Collision bake failed');
    process.exit(1);
  }
}

main();
