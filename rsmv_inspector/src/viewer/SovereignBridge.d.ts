/**
 * SovereignBridge - Real-time WebSocket bridge to the POG2 Backend.
 * Decouples the 3D Viewer from the heavy POG2 Orchestrator while maintaining state parity.
 */
export declare class SovereignBridge {
    private static instance;
    private ws;
    private listeners;
    private tickListeners;
    private logListeners;
    private engine;
    private retryCount;
    private state;
    private constructor();
    static getInstance(): SovereignBridge;
    private connect;
    onSync(callback: (msg: any) => void): void;
    onTick(callback: (msg: any) => void): void;
    onSystemLog(callback: (log: any) => void): void;
    private notifyListeners;
    private notifyTickListeners;
    private notifyLogListeners;
    getState(): any;
    setEngine(engine: any): void;
    /**
     * handleCommand - Clinical routing for the Sovereign Console.
     */
    handleCommand(cmd: string): void;
    /**
     * sendAction - Push a manual or autonomous action back to the backend.
     */
    sendAction(intent: string): void;
    /**
     * log - Relay a system event to all subscribers (Clinical HUD console).
     */
    log(level: 'INFO' | 'WARN' | 'ERROR' | 'CMD', source: string, message: string): void;
}
