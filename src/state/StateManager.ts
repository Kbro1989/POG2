/**
 * StateManager — Sovereign process state tracking.
 * Persistent metrics and session-level state for the ternary engine.
 */
import { CanonicalClock } from '../utils/CanonicalClock.js';

export interface Metrics {
    turnCount: number;
    tokensTotal: number;
    latencyAvg: number;
    successRate: number;
}

export interface SovereignState {
    mode: 'sovereign' | 'hybrid' | 'local';
    selectedWorkspace?: string;
    metrics: Metrics;
    lastError?: string;
    sessionId: string;
}

export class StateManager {
    private static instance: StateManager;
    private state: SovereignState;

    private constructor() {
        this.state = {
            mode: 'hybrid',
            sessionId: '',
            metrics: {
                turnCount: 0,
                tokensTotal: 0,
                latencyAvg: 0,
                successRate: 1.0
            }
        };
    }

    public static getInstance(): StateManager {
        if (!StateManager.instance) {
            StateManager.instance = new StateManager();
        }
        return StateManager.instance;
    }

    public getState(): SovereignState {
        return { ...this.state };
    }

    public getSessionId(): string {
        if (!this.state.sessionId) {
            this.state.sessionId = `session-${CanonicalClock.getInstance().simulatedNow()}-${Math.random().toString(36).substring(7)}`;
        }
        return this.state.sessionId;
    }

    public updateMetrics(delta: Partial<Metrics>): void {
        this.state.metrics = {
            ...this.state.metrics,
            turnCount: this.state.metrics.turnCount + (delta.turnCount ?? 0),
            tokensTotal: this.state.metrics.tokensTotal + (delta.tokensTotal ?? 0)
        };
    }

    public setMode(mode: SovereignState['mode']): void {
        this.state.mode = mode;
    }

    public setWorkspace(path: string): void {
        this.state.selectedWorkspace = path;
    }
}

