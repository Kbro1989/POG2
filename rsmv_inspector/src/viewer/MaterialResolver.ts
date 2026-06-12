import { CacheFileSource } from '../cache';
import { cacheMajors, cacheConfigPages } from '../constants';
import { parse } from '../opdecoder';

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
  private resolvedCache: Map<number, MaterialDefinition> = new Map();
  private dbrowsArchive: any[] | null = null;
  private isInitialized = false;

  constructor(private cache: CacheFileSource) {
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

    const dbrowFile = this.dbrowsArchive.find(f => f.fileid === materialArgument);
    if (!dbrowFile) {
      console.warn(`[MaterialResolver] materialArgument ${materialArgument} not found in dbrows`);
      return null;
    }

    let decoded: any;
    try {
      decoded = parse.dbrows.read(dbrowFile.buffer, this.cache);
    } catch (e) {
      console.warn(`[MaterialResolver] Failed to parse dbrow ${materialArgument}, returning empty definition.`);
      return { brightness: 128, shadow: 128 };
    }

    const def: MaterialDefinition = {
        brightness: 128,
        shadow: 128
    };

    // Extract columns from DBRow based on probe heuristics
    if (decoded && decoded.unk01 && decoded.unk01.columndata) {
        for (const col of decoded.unk01.columndata) {
            // For material rows (like 2082), column id 4 often holds the texture ID
            if (col.id === 4 && col.columns && col.columns.length > 0) {
                def.textureId = col.columns[0].value[0];
            }
            // Column id 2 might be color or something else, but we prioritize texture
        }
    }

    this.resolvedCache.set(materialArgument, def);
    return def;
  }
}
