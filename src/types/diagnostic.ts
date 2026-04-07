export interface DiskSubstrate {
    readonly totalBytes: bigint;
    readonly freeBytes: bigint;
    readonly volumeLabel: string;
    readonly healthStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
}

export interface NeuralNode {
    readonly pid: number;
    readonly name: string;
    readonly memoryWorkingSet: bigint;
    readonly cpuPercent: number;
    readonly state: 'RUNNING' | 'SUSPENDED' | 'ZOMBIE';
}

export interface Win32Error {
    readonly code: string;
    readonly message: string;
    readonly command: string;
}

export interface TSCError {
    readonly code: string | number;
    readonly message: string;
    readonly fileName?: string;
    readonly line?: number;
    readonly character?: number;
    readonly context?: string;
}

export type DiagnosticResult<T> =
    | { success: true; data: T; timestamp: Date; }
    | { success: false; error: Win32Error | TSCError; timestamp: Date; };
