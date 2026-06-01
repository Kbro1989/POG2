// Minimal type stubs for src_rsmv dynamic imports and legacy imports

declare module '*/src_rsmv/3d/modeltothree' {
  export class EngineCache {
    getFile(major: number, minor: number, file: number): Promise<Buffer>;
    getArchiveById(major: number, id: number): Promise<any>;
    getCacheIndex(major: number): Promise<any>;
    getBuildNr(): number;
    static create(source: any): Promise<EngineCache>;
  }
  
  export class ThreejsSceneCache {
    static create(engine: EngineCache): Promise<ThreejsSceneCache>;
    getModelData(id: number): Promise<any>;
  }
}

declare module '*/3d/modeltothree.js' {
  export class EngineCache {
    getFile(major: number, minor: number, file: number): Promise<Buffer>;
    getArchiveById(major: number, id: number): Promise<any>;
    getCacheIndex(major: number): Promise<any>;
    getBuildNr(): number;
    static create(source: any): Promise<EngineCache>;
  }
  export class ThreejsSceneCache {
    static create(engine: EngineCache): Promise<ThreejsSceneCache>;
    getModelData(id: number): Promise<any>;
  }
}

declare module 'rsmv/cache/sqlite.js' {
  export class GameCacheLoader {
    constructor(path?: string);
    readEntry(major: number, minor: number, file: number): any;
    readSubEntry(major: number, fileId: number, subId: number): any;
    close(): void;
    getArchiveById(major: number, id: number): any;
    getFileById(major: number, id: number): Promise<Buffer>;
    getCacheIndex(major: number): Promise<any>;
    getFileArchive(archiveInfo: any): Promise<any[]>;
  }
}

declare module 'rsmv/constants.js' {
  export const cacheMajors: Record<string, number>;
  export const cacheConfigPages: Record<string, number>;
  export const cacheMapFiles: Record<string, number>;
}

declare module 'rsmv/opdecoder.js' {
  export const parse: Record<string, any>;
  export const allParsers: Record<string, any>;
}

declare module 'rsmv/clientscript/callibrator.js' {
  export interface ClientscriptObfuscation {
    readOpcode(state: any): any;
    writeOpCode(state: any, opcode: any): void;
  }
}

declare module 'rsmv/cache/index.js' {
  export interface CacheFileSource {
    getFileById(major: number, id: number): Promise<Buffer>;
  }
}

declare module 'rsmv/3d/avatar.js' {
  export const slotNames: string[];
  export const slotToKitMale: Record<number, number>;
  export const slotToKitFemale: Record<number, number>;
  export function avatarToModel(cache: any, buffer: Buffer, head: boolean, mode?: string): Promise<any>;  export function writeAvatar(state: any, avatar: any): void;
  export function avatarStringToBytes(str: string): Buffer;
  export function bytesToAvatarString(buf: Buffer): string;
  export type EquipSlot = any;
}

