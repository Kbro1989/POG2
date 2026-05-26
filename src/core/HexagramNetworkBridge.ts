import type { HexagramDefinition, GameplayContext } from './HexagramDefinitions.js';
import type { WorldTelemetryFrame } from '../durable-objects/POG2WorldDO.js';

export interface ExecutionContext {
  hexagram: HexagramDefinition;
  gameplay: GameplayContext;
  tick: number;
  timestamp: number;
  payload?: Record<string, any>;
}

export interface ContractResult {
  success: boolean;
  engineName: string;
  hexagramId: number;
  tick: number;
  data?: any;
  error?: string;
  durationMs: number;
}

export interface EngineContract {
  name: string;
  execute: (ctx: ExecutionContext) => Promise<ContractResult>;
  validate?: (ctx: ExecutionContext) => boolean;
  fallback?: (ctx: ExecutionContext) => Promise<ContractResult>;
}

export class HexagramNetworkBridge {
  private contracts: Map<string, EngineContract> = new Map();
  private results: ContractResult[] = [];
  private maxResultsHistory: number = 100;
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private isConnected: boolean = false;
  private failureCounts: Map<string, number> = new Map();
  private circuitThreshold: number = 5;
  private circuitOpen: Set<string> = new Set();

  register(contract: EngineContract): void {
    this.contracts.set(contract.name, contract);
    this.failureCounts.set(contract.name, 0);
  }

  connect(worldDOUrl: string): void {
    if (typeof WebSocket === 'undefined') {
      console.warn('[HexagramNetworkBridge] WebSocket not available');
      return;
    }
    this.ws = new WebSocket(worldDOUrl);
    
    this.ws.addEventListener('open', () => {
      this.isConnected = true;
      this.ws!.send(JSON.stringify({
        type: 'SUBSCRIBE',
        channels: ['hexagram', 'ghostsplat', 'collision', 'entities']
      }));
    });

    this.ws.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data as string);
        if (msg.type === 'TICK' || msg.type === 'INIT') {
          this.handleFrame(msg.frame as WorldTelemetryFrame);
        }
      } catch (err) {
        console.error('[Bridge] Failed to parse frame:', err);
      }
    });

    this.ws.addEventListener('close', () => {
      this.isConnected = false;
      setTimeout(() => this.connect(worldDOUrl), this.reconnectInterval);
    });

    this.ws.addEventListener('error', (err) => {
      console.error('[HexagramNetworkBridge] WS error:', err);
      this.ws?.close();
    });
  }

  private async handleFrame(frame: WorldTelemetryFrame): Promise<void> {
    const { hexagramState } = frame;
    const hexagram = hexagramState.definition;
    
    if (!hexagram.gameplay) {
      console.warn(`[Bridge] Hexagram ${hexagram.id} has no gameplay context`);
      return;
    }

    const executionContext: ExecutionContext = {
      hexagram,
      gameplay: hexagram.gameplay,
      tick: frame.tick,
      timestamp: frame.timestamp,
      payload: {
        ghostSplat: frame.ghostSplat,
        collisionGrid: frame.collisionGrid,
        activeEntities: frame.activeEntities
      }
    };

    const targets = hexagram.gameplay.engineFocus;
    const promises = targets.map(async (engineName) => {
      if (this.circuitOpen.has(engineName)) {
        console.warn(`[Bridge] Circuit open for ${engineName}, skipping`);
        return null;
      }

      const contract = this.contracts.get(engineName);
      if (!contract) {
        console.warn(`[Bridge] No contract registered for ${engineName}`);
        return null;
      }

      if (contract.validate && !contract.validate(executionContext)) {
        return null;
      }

      const start = performance.now();
      try {
        const result = await contract.execute(executionContext);
        result.durationMs = performance.now() - start;
        this.failureCounts.set(engineName, 0);
        return result;
      } catch (err) {
        const failCount = (this.failureCounts.get(engineName) || 0) + 1;
        this.failureCounts.set(engineName, failCount);
        
        if (failCount >= this.circuitThreshold) {
          this.circuitOpen.add(engineName);
          setTimeout(() => this.circuitOpen.delete(engineName), 30000);
        }

        if (contract.fallback) {
          const fallbackResult = await contract.fallback(executionContext);
          fallbackResult.durationMs = performance.now() - start;
          fallbackResult.error = `Primary failed: ${err}, fallback executed`;
          return fallbackResult;
        }

        return {
          success: false,
          engineName,
          hexagramId: hexagram.id,
          tick: frame.tick,
          error: String(err),
          durationMs: performance.now() - start
        };
      }
    });

    const results = (await Promise.all(promises)).filter((r): r is ContractResult => r !== null);
    this.results.push(...results);
    
    if (this.results.length > this.maxResultsHistory) {
      this.results = this.results.slice(-this.maxResultsHistory);
    }

    this.emitResults(results);
  }

  private emitResults(results: ContractResult[]): void {
    if (process.env.NODE_ENV === 'development') {
      results.forEach(r => {
        const status = r.success ? '✓' : '✗';
        console.log(`[Bridge] ${status} ${r.engineName} @ tick ${r.tick} (${r.durationMs.toFixed(2)}ms)`);
      });
    }
  }

  getResults(): ContractResult[] {
    return [...this.results];
  }

  getContract(name: string): EngineContract | undefined {
    return this.contracts.get(name);
  }

  getRegisteredEngines(): string[] {
    return Array.from(this.contracts.keys());
  }

  isCircuitOpen(engineName: string): boolean {
    return this.circuitOpen.has(engineName);
  }
}
