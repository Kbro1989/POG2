/**
 * StateManager — Sovereign process state tracking.
 * Persistent metrics and session-level state for the ternary engine.
 */
export class StateManager {
    static instance;
    state;
    constructor() {
        this.state = {
            mode: 'hybrid',
            sessionId: `session-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            metrics: {
                turnCount: 0,
                tokensTotal: 0,
                latencyAvg: 0,
                successRate: 1.0
            }
        };
    }
    static getInstance() {
        if (!StateManager.instance) {
            StateManager.instance = new StateManager();
        }
        return StateManager.instance;
    }
    getState() {
        return { ...this.state };
    }
    getSessionId() {
        return this.state.sessionId;
    }
    updateMetrics(delta) {
        this.state.metrics = {
            ...this.state.metrics,
            turnCount: this.state.metrics.turnCount + (delta.turnCount ?? 0),
            tokensTotal: this.state.metrics.tokensTotal + (delta.tokensTotal ?? 0)
        };
    }
    setMode(mode) {
        this.state.mode = mode;
    }
    setWorkspace(path) {
        this.state.selectedWorkspace = path;
    }
}
