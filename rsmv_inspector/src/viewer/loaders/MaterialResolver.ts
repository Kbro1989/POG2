import { GameCacheLoader } from '../../cache/sqlite';
import { cacheMajors, cacheConfigPages } from '../../constants';
import { parse } from '../../opdecoder';
import { ThreejsSceneCache } from '../../3d/modeltothree';

export interface MaterialDefinition {
  textureId?: number;
  spriteId?: number;
  color?: number;
  brightness?: number;
  shadow?: number;
  translucent?: boolean;
  twoSided?: boolean;
}

export class MaterialResolver {
  private cache: GameCacheLoader;
  private resolvedCache: Map<number, MaterialDefinition> = new Map();
  private dbrowsArchive: any[] | null = null;
  private isInitialized = false;

  constructor(private cachePath: string) {
    this.cache = new GameCacheLoader(cachePath);
  }

  async initialize() {
    if (this.isInitialized) return;
    try {
      this.dbrowsArchive = await this.cache.getArchiveById(cacheMajors.config, cacheConfigPages.dbrows);
      this.isInitialized = true;
      console.log(`[MaterialResolver] DBRows archive loaded, ${this.dbrowsArchive.length} rows available.`);
    } catch (e) {
      console.error("[MaterialResolver] Failed to load DBRows archive:", e);
    }
  }

  async resolve(materialArgument: number): Promise<MaterialDefinition | null> {
    if (this.resolvedCache.has(materialArgument)) {
      return this.resolvedCache.get(materialArgument)!;
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.dbrowsArchive) {
      console.warn('[MaterialResolver] DBRows archive not initialized.');
      return null;
    }

    // DBRows subfile ID is often the dbrow ID
    const dbrowFile = this.dbrowsArchive.find(f => f.fileid === materialArgument);
    if (!dbrowFile) {
      console.warn(`[MaterialResolver] materialArgument ${materialArgument} not found in dbrows`);
      return null;
    }

    let decoded: any;
    try {
      decoded = parse.dbrows.read(dbrowFile.buffer, this.cache);
    } catch (e) {
      console.error(`[MaterialResolver] Failed to parse dbrow ${materialArgument}:`, e);
      return null;
    }

    const def: MaterialDefinition = {
        brightness: 128,
        shadow: 128
    };

    // Extract columns from DBRow. The exact columns depend on the schema, but typically:
    // This is a naive extraction that looks for textureId-like columns.
    if (decoded && decoded.columnData) {
        for (const col of decoded.columnData) {
            // Very naive heuristics since we don't know the exact dbtable schema mapping:
            if (col.value && col.value.length > 0) {
                const val = col.value[0];
                if (typeof val === 'number') {
                    // Try to guess if it's a color, texture, etc.
                    // Usually texture IDs are in the 1000-50000 range
                    if (val > 0 && !def.textureId && !def.color) {
                        // For kit materials, the texture ID is often the primary payload
                        def.textureId = val;
                    }
                }
            }
        }
    }

    this.resolvedCache.set(materialArgument, def);
    return def;
  }
}
