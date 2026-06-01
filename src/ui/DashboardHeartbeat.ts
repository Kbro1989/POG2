import { CanonicalClock, TickTier } from '../utils/CanonicalClock.js';

export const HUD_REGISTRY = [
    { id: 1430, name: "Action Bar", path: "/interfaces/interface_1430_standard.json" },
    { id: 1496, name: "Inventory/Bank", path: "/interfaces/interface_1496_standard.json" },
    { id: 137,  name: "Chatbox", path: "/interfaces/interface_137_standard.json" },
    { id: 1922, name: "Navigation", path: "/interfaces/interface_1922_standard.json" }
];

export class DashboardHeartbeat {
    private clock: CanonicalClock;
    private onTickCallback: (coord: any) => void;

    constructor(onTickCallback: (coord: any) => void) {
        this.clock = CanonicalClock.getInstance();
        this.onTickCallback = onTickCallback;

        // Register for T1 Game Tick Boundary
        this.clock.onTick((tick, phase, time) => {
            this.onTickCallback({ tick, phase, time });
        });
    }

    public pulse() {
        this.clock.pulse(TickTier.GAME);
    }
}

