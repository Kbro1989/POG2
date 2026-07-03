import * as cache from "./index.js";
type CacheTable = {
    db: any | null;
    indices: Promise<cache.CacheIndexFile>;
    readFile: (minor: number) => Promise<{
        DATA: Buffer;
        CRC: number;
    }>;
    readIndexFile: () => Promise<{
        DATA: Buffer;
        CRC: number;
    }>;
    updateFile: (minor: number, data: Buffer) => Promise<void>;
    updateIndexFile: (data: Buffer) => Promise<void>;
};
export declare class GameCacheLoader extends cache.CacheFileSource {
    cachedir: string;
    writable: boolean;
    opentables: Map<number, CacheTable>;
    timestamp: Date;
    constructor(cachedir?: string, writable?: boolean);
    getCacheMeta(): {
        name: string;
        descr: string;
        timestamp: Date;
    };
    generateRootIndex(): Promise<cache.CacheIndex[]>;
    openTable(major: number): CacheTable;
    getFile(major: number, minor: number, crc?: number): Promise<Buffer<any> | null>;
    getFileArchive(index: cache.CacheIndex): Promise<cache.SubFile[]>;
    writeFile(major: number, minor: number, file: Buffer): Promise<void>;
    writeFileArchive(major: number, minor: number, files: Buffer[]): Promise<void>;
    getCacheIndex(major: number): Promise<cache.CacheIndexFile>;
    getIndexFile(major: number): Promise<Buffer<any>>;
    close(): void;
}
export {};
