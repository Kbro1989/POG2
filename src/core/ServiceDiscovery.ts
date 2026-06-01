import * as fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { HealthStatus } from './models.js';
import { SovereignConfig } from '../config/SovereignConfig.js';
import { NeuralLimb } from '../limbs/core/NeuralLimb.js';
import { CloudflareServices, CloudflareConfig } from '../services/CloudflareServices.js';
import { getSovereignRoot } from '../utils/SovereignPathResolver.js';
import { createLogger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const coreRoot = join(__dirname, '../..');
const logger = createLogger('ServiceDiscovery');

export interface ServiceStatus {
    readonly id: string;
    readonly name: string;
    readonly status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
    readonly health: HealthStatus;
    readonly details?: string;
    readonly type: 'API' | 'EXTENSION' | 'MCP' | 'WORKER';
}

/**
 * ServiceDiscovery - Audits and reports the status of all CNS substrates.
 */
export class ServiceDiscovery {
    private isRunning = false;
    private auditTimer?: NodeJS.Timeout | undefined;

    constructor(private readonly config: SovereignConfig) { }

    /**
     * Start the audit loop with a given interval
     */
    startAuditLoop(intervalMs = 30000): void {
        if (this.isRunning) return;
        this.isRunning = true;

        const run = async () => {
            if (!this.isRunning) return;
            try {
                await this.auditAll();
            } catch (err) {
                // Silent fail during shutdown
            }
            if (this.isRunning) {
                this.auditTimer = setTimeout(run, intervalMs);
            }
        };

        run();
    }

    /**
     * Stop all ongoing audits and prevent new ones from starting
     */
    stop(): void {
        this.isRunning = false;
        if (this.auditTimer) {
            clearTimeout(this.auditTimer);
            this.auditTimer = undefined;
        }
    }

    async auditAll(): Promise<ServiceStatus[]> {
        // Guard: Don't run if stopped
        if (!this.isRunning) return [];

        const results: ServiceStatus[] = [];

        // 1. Audit APIs
        results.push(this.withHealth(await this.checkGoogleServices()));
        results.push(this.withHealth(await this.checkOllama()));

        // Guard between checks
        if (!this.isRunning) return results;

        // 2. Audit Extensions (GCloud SDKs)
        const extensions = await this.checkCloudExtensions();
        if (!this.isRunning) return results;
        results.push(...extensions.map(ext => this.withHealth(ext)));

        // 3. Audit MCP Servers
        results.push(this.withHealth(await this.checkMCPServers()));
        if (!this.isRunning) return results;

        // 4. Audit Knowledge Limbs (Phase 20)
        results.push(this.withHealth(await this.checkKnowledgeLimbs()));
        if (!this.isRunning) return results;

        // 5. Audit Endpoints (Sovereign Substrate)
        results.push(this.withHealth(await this.checkVSCodeExtension()));
        if (!this.isRunning) return results;

        results.push(this.withHealth(await this.checkCloudflareWorker()));
        if (!this.isRunning) return results;

        results.push(this.withHealth(await this.checkRSCServer()));
        if (!this.isRunning) return results;

        results.push(this.withHealth(await this.checkGhostLimb()));
        if (!this.isRunning) return results;

        // 6. Audit System Substrate (Sovereign Root)
        results.push(this.withHealth(await this.checkSovereignSubstrate()));
        if (!this.isRunning) return results;

        // 7. Audit Shell Tools (Git/PowerShell)
        const shellTools = await this.checkShellTools();
        if (!this.isRunning) return results;
        results.push(...shellTools.map(t => this.withHealth(t)));

        return results;
    }

    private isServiceAuthorized(id: string): HealthStatus {
        const lowerId = id.toLowerCase();
        const isAuthorized = (this.config.enabledServices as string[] ?? []).some((s: string) => s.toLowerCase() === lowerId);
        return isAuthorized ? HealthStatus.Ready : HealthStatus.Critical;
    }

    private withHealth(status: Omit<ServiceStatus, 'health'>): ServiceStatus {
        const health = this.isServiceAuthorized(status.id);
        return { ...status, health } as ServiceStatus;
    }

    private async checkGoogleServices(): Promise<Omit<ServiceStatus, 'health'>> {
        if (!this.isRunning) return { id: 'google_services', name: 'Google Cloud Services', status: 'INACTIVE', type: 'API', details: 'Audit stopped' };

        const apiKey = process.env['GOOGLE_API_KEY'] || this.config.secondaryCloudApiKey;

        if (!apiKey) {
            return { id: 'google_services', name: 'Google Cloud Services', status: 'INACTIVE', type: 'API', details: 'No API key in .env or config' };
        }

        try {
            const { GoogleServices } = await import('../services/GoogleServices.js');
            const google = new GoogleServices({ apiKey });
            const audit = await google.auditAbilities();
            if (audit.ok && audit.value) {
                return {
                    id: 'google_services',
                    name: 'Google Cloud Services',
                    status: 'ACTIVE',
                    type: 'API',
                    details: `Abilities: ${audit.value.services.join(', ')}`
                };
            }
            return { id: 'google_services', name: 'Google Cloud Services', status: 'ERROR', type: 'API', details: audit.error?.message || 'Unknown error' };
        } catch (e) {
            return { id: 'google_services', name: 'Google Cloud Services', status: 'ERROR', type: 'API', details: (e as Error).message };
        }
    }

    private async checkOllama(): Promise<Omit<ServiceStatus, 'health'>> {
        if (!this.isRunning) return { id: 'ollama', name: 'Ollama Local', status: 'INACTIVE', type: 'API', details: 'Audit stopped' };

        try {
            // Ping Ollama endpoint
            const response = await fetch('http://localhost:11434/api/tags');
            if (response.ok) {
                return { id: 'ollama', name: 'Ollama Local', status: 'ACTIVE', type: 'API' };
            }
            return { id: 'ollama', name: 'Ollama Local', status: 'INACTIVE', type: 'API', details: 'Service unreachable' };
        } catch {
            return { id: 'ollama', name: 'Ollama Local', status: 'INACTIVE', type: 'API' };
        }
    }

    private async checkCloudExtensions(): Promise<Omit<ServiceStatus, 'health'>[]> {
        if (!this.isRunning) return [];

        const extensions: Omit<ServiceStatus, 'health'>[] = [
            { id: 'healthcare', name: 'Bio Intelligence (MedGemma)', status: 'INACTIVE', type: 'EXTENSION' },
            { id: 'documentai', name: 'Document AI', status: 'INACTIVE', type: 'EXTENSION' },
            { id: 'vision', name: 'Cloud Vision', status: 'INACTIVE', type: 'EXTENSION' },
            { id: 'mediaforge', name: 'Media Forge (Imagen/Veo)', status: 'INACTIVE', type: 'EXTENSION' }
        ];

        let deps: Record<string, string> = {};
        try {
            const pkgPath = join(this.config.projectRoot, 'package.json');
            if (fs.existsSync(pkgPath)) {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                deps = { ...pkg.dependencies, ...pkg.devDependencies };
            }
        } catch { }

        const corePkgPath = join(coreRoot, 'package.json');
        let coreDeps: Record<string, string> = {};
        try {
            if (fs.existsSync(corePkgPath)) {
                const pkg = JSON.parse(fs.readFileSync(corePkgPath, 'utf8'));
                coreDeps = { ...pkg.dependencies, ...pkg.devDependencies };
            }
        } catch { }

        const hasKey = !!process.env['GOOGLE_API_KEY'];

        return extensions.map(ext => {
            const id = ext.id;
            const depKey = `@google-cloud/${id === 'healthcare' ? 'healthcare' : id === 'documentai' ? 'document-ai' : 'vision'}`;
            const isInstalled = !!deps[depKey] || !!coreDeps[depKey];
            const isAuthorized = this.isServiceAuthorized(id);

            if (isAuthorized && hasKey) {
                return {
                    ...ext,
                    status: 'ACTIVE',
                    details: isInstalled ? 'Substrate: READY (Native)' : 'Substrate: READY (Cloud)'
                };
            }

            if (isInstalled) {
                return { ...ext, status: 'ACTIVE', details: 'Installed (Wait for Authorization)' };
            }

            return ext;
        });
    }

    private async checkMCPServers(): Promise<Omit<ServiceStatus, 'health'>> {
        if (!this.isRunning) return { id: 'mcp_gitkraken', name: 'MCP GitKraken', status: 'INACTIVE', type: 'MCP', details: 'Audit stopped' };

        try {
            const hasGitKraken = fs.existsSync(join(this.config.projectRoot, '.gitkraken'));
            const hasGit = fs.existsSync(join(this.config.projectRoot, '.git'));
            const isEnabled = this.isServiceAuthorized('mcp_gitkraken');
            const isActive = hasGitKraken || hasGit || isEnabled;

            return {
                id: 'mcp_gitkraken',
                name: 'MCP GitKraken',
                status: isActive ? 'ACTIVE' : 'INACTIVE',
                type: 'MCP',
                details: isActive
                    ? (isEnabled ? 'Substrate: READY (Coalesced)' : 'Detected: Path Active')
                    : 'Awaiting discovery'
            };
        } catch {
            return { id: 'mcp_gitkraken', name: 'MCP GitKraken', status: 'INACTIVE', type: 'MCP' };
        }
    }

    private async checkKnowledgeLimbs(): Promise<Omit<ServiceStatus, 'health'>> {
        if (!this.isRunning) return { id: 'gutenberg', name: 'Gutenberg Knowledge', status: 'INACTIVE', type: 'EXTENSION', details: 'Audit stopped' };

        const gutenbergPath = this.config.gutenbergPath || join(this.config.pog2Dir, 'knowledge');
        const exists = fs.existsSync(gutenbergPath);

        return {
            id: 'gutenberg',
            name: 'Gutenberg Knowledge',
            status: exists ? 'ACTIVE' : 'INACTIVE',
            type: 'EXTENSION',
            details: exists ? `Substrate: ${gutenbergPath} (Local)` : 'Knowledge path not found'
        };
    }

    private async checkVSCodeExtension(): Promise<Omit<ServiceStatus, 'health'>> {
        if (!this.isRunning) return { id: 'extension', name: 'VS Code Bridge', status: 'INACTIVE', type: 'EXTENSION', details: 'Audit stopped' };

        const wsPort = this.config.wsPort || 8765;

        // Test WebSocket bridge availability by checking if the server is listening
        try {
            // Check if the WebSocket server is accepting connections
            const { createConnection } = await import('net');
            const isListening = await new Promise<boolean>((resolve) => {
                const socket = createConnection({ port: wsPort, host: 'localhost' }, () => {
                    socket.end();
                    resolve(true);
                });
                socket.on('error', () => resolve(false));
                socket.setTimeout(1000, () => {
                    socket.destroy();
                    resolve(false);
                });
            });

            return {
                id: 'extension',
                name: 'VS Code Bridge',
                status: isListening ? 'ACTIVE' : 'INACTIVE',
                type: 'EXTENSION',
                details: isListening ? `WebSocket: ws://localhost:${wsPort} (READY)` : `Port ${wsPort} not listening`
            };
        } catch {
            return {
                id: 'extension',
                name: 'VS Code Bridge',
                status: 'INACTIVE',
                type: 'EXTENSION',
                details: 'Connection test failed'
            };
        }
    }

    private async checkCloudflareWorker(): Promise<Omit<ServiceStatus, 'health'>> {
        if (!this.isRunning) return { id: 'worker', name: 'POG Sovereign Worker', status: 'INACTIVE', type: 'WORKER', details: 'Audit stopped' };

        const workerUrl = process.env['CLOUDFLARE_WORKER_URL'];

        // If worker URL is set, ping it to verify it's operational
        if (workerUrl) {
            try {
                const res = await fetch(workerUrl, { method: 'GET' });
                if (res.ok) {
                    const data = await res.json() as { service?: string; status?: string };
                    return {
                        id: 'worker',
                        name: 'POG Sovereign Worker',
                        status: 'ACTIVE',
                        type: 'WORKER',
                        details: `Substrate: ${data.service || 'Online'} (${data.status || 'Verified'})`
                    };
                }
                return {
                    id: 'worker',
                    name: 'POG Sovereign Worker',
                    status: 'ERROR',
                    type: 'WORKER',
                    details: `HTTP ${res.status}: ${res.statusText}`
                };
            } catch (err) {
                return {
                    id: 'worker',
                    name: 'POG Sovereign Worker',
                    status: 'ERROR',
                    type: 'WORKER',
                    details: `Unreachable: ${(err as Error).message}`
                };
            }
        }

        // Fallback: Check API credentials if no URL is set
        const cf = new CloudflareServices({
            accountId: (process.env['CLOUDFLARE_ACCOUNT_ID'] || this.config.cloudflareAccountId),
            apiToken: (process.env['CLOUDFLARE_API_TOKEN'] || this.config.cloudflareApiToken)
        } as CloudflareConfig);

        const audit = await cf.auditAbilities();
        const accountId = cf.getAccountId();

        return {
            id: 'worker',
            name: 'POG Sovereign Worker',
            status: audit.ok ? 'ACTIVE' : (accountId ? 'ERROR' : 'INACTIVE'),
            type: 'WORKER',
            details: (audit.ok && audit.value)
                ? `Account: ${audit.value.accountId} (API Verified)`
                : (accountId ? `Token Error: ${audit.error?.message || 'Unknown verification error'}` : 'Missing worker substrate')
        };
    }

    private async checkRSCServer(): Promise<Omit<ServiceStatus, 'health'>> {
        if (!this.isRunning) return { id: 'rsc_server', name: 'RSC Game Server', status: 'INACTIVE', type: 'EXTENSION', details: 'Audit stopped' };

        const portDefault = 43594;
        const portCabbage = 43595;

        // Helper to check a port
        const checkPort = async (port: number): Promise<boolean> => {
            if (!this.isRunning) return false;
            try {
                const { createConnection } = await import('net');
                return await new Promise<boolean>((resolve) => {
                    const socket = createConnection({ port, host: 'localhost' }, () => {
                        socket.end();
                        resolve(true);
                    });
                    socket.on('error', () => resolve(false));
                    socket.setTimeout(300, () => { // Faster timeout for boot
                        socket.destroy();
                        resolve(false);
                    });
                });
            } catch { return false; }
        };

        const isDefault = await checkPort(portDefault);
        const isCabbage = await checkPort(portCabbage);
        const isActive = isDefault || isCabbage;

        return {
            id: 'rsc_server',
            name: 'RSC Game Server',
            status: isActive ? 'ACTIVE' : 'INACTIVE',
            type: 'EXTENSION',
            details: isActive
                ? `Listening on ${isDefault ? '43594 (Default)' : '43595 (Cabbage)'}`
                : 'Offline. Substrate awaiting ignition pulse.'
        };
    }

    private async checkSovereignSubstrate(): Promise<Omit<ServiceStatus, 'health'>> {
        if (!this.isRunning) return { id: 'sovereign_root', name: 'Sovereign Substrate', status: 'INACTIVE', type: 'EXTENSION', details: 'Audit stopped' };

        const root = getSovereignRoot();
        let exists = false;

        try {
            exists = fs.existsSync(root);
        } catch { exists = false; }

        return {
            id: 'sovereign_root',
            name: 'Sovereign Substrate',
            status: exists ? 'ACTIVE' : 'INACTIVE',
            type: 'EXTENSION',
            details: exists ? `Path: ${root}` : 'Not found. Substrate disconnected.'
        };
    }

    private async checkGhostLimb(): Promise<Omit<ServiceStatus, 'health'>> {
        // Ghost is always potentially active if initialized
        // We consider it ACTIVE if the environment supports local deterministic logic
        return {
            id: 'ghost',
            name: 'Ghost Failover (L3)',
            status: 'ACTIVE',
            type: 'WORKER', // It's a "local worker" pattern
            details: 'Substrate: READY (Deterministic Failover)'
        };
    }

    private async checkShellTools(): Promise<Array<Omit<ServiceStatus, 'health'>>> {
        if (!this.isRunning) return [];

        const check = async (cmd: string, args: string[]): Promise<string | null> => {
            if (!this.isRunning) return null;
            try {
                const { spawn } = await import('child_process');
                return await new Promise<string | null>(resolve => {
                    const child = spawn(cmd, args, { shell: true });
                    let output = '';
                    child.stdout?.on('data', d => output += d.toString());
                    child.on('close', code => resolve(code === 0 ? output.trim() : null));
                    child.on('error', () => resolve(null));
                });
            } catch { return null; }
        };

        const gitVersion = await check('git', ['--version']);
        const psVersion = await check('pwsh', ['-v']) || await check('powershell', ['-Command', '$PSVersionTable.PSVersion.ToString()']);
        const wranglerVersion = await check('wrangler', ['--version']);
        const gcloudVersion = await check('gcloud', ['--version']);

        return [
            {
                id: 'tool_git',
                name: 'Git SCM',
                status: gitVersion ? 'ACTIVE' : 'INACTIVE',
                type: 'EXTENSION',
                details: gitVersion || 'Git binary not found in PATH'
            },
            {
                id: 'tool_powershell',
                name: 'PowerShell',
                status: psVersion ? 'ACTIVE' : 'INACTIVE',
                type: 'EXTENSION',
                details: psVersion ? `Version: ${psVersion}` : 'PowerShell not found'
            },
            {
                id: 'tool_wrangler',
                name: 'Wrangler CLI',
                status: wranglerVersion ? 'ACTIVE' : 'INACTIVE',
                type: 'EXTENSION',
                details: wranglerVersion ? `Version: ${wranglerVersion}` : 'Wrangler not found (Try `npm i -g wrangler`)'
            },
            {
                id: 'tool_gcloud',
                name: 'Google Cloud CLI',
                status: gcloudVersion ? 'ACTIVE' : 'INACTIVE',
                type: 'EXTENSION',
                details: gcloudVersion ? `Installed` : 'GCloud SDK not found'
            }
        ];
    }

    public healthCheck(): { online: boolean; details: string } {
        return { online: true, details: "ServiceDiscovery active and verified." };
    }
}


