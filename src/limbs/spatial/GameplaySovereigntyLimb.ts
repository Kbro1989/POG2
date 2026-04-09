import { GameState, Result, Item, SkillId, EquipmentSlot } from '../../core/models.js';
import { SovereignAvatar } from '../../core/SovereignAvatar.js';
import { GameplayModule } from '../../engines/gameplay/MinigameInterfaces.js';
import { createLogger } from '../../utils/logger.js';
import { CloudflareSyncLimb } from './CloudflareSyncLimb.js';
import { SwitchboardLimb } from '../../monitor/SwitchboardLimb.js';
import { EntityLimb } from '../technical/EntityLimb.js';
import { getSovereignRoot, resolveSovereignPath } from '../../utils/SovereignPathResolver.js';
import * as fs from 'fs';
import * as path from 'path';
import { SimulationHarness } from '../../engines/gameplay/SimulationHarness.js';
import { WorldGroundingLimb } from '../world_grounding/WorldGroundingLimb.js';
import { HexagramManager } from '../../routing/HexagramManager.js';
import { AIDispatcher } from '../../api/ai/Dispatcher.js';
import { ModelClient } from '../../clients/ModelClient.js';
import { SovereignConfig } from '../../config/SovereignConfig.js';
import { TernaryRouter } from '../../routing/TernaryRouter.js';
import { Renderer } from '../../ui/Renderer.js';

const logger = createLogger('GameplaySovereigntyLimb');

// Pedagogical Mappings
const CURRENCY_COINS = 22159;
const BANK_BUTTON_DEPOSIT_ALL = 141184642;
const BANK_BUTTON_DEPOSIT_EQUIPMENT = 141184643;

export class GameplaySovereigntyLimb {
    private static instance: GameplaySovereigntyLimb | undefined;
    private isRunning: boolean = false;
    private tickInterval: NodeJS.Timeout | null = null;
    public tickCount: number = 0;
    
    public edgeSync: CloudflareSyncLimb;
    private switchboard: SwitchboardLimb | null = null;
    private entityBrain: EntityLimb | null = null;
    private harness: SimulationHarness | null = null;
    
    public globalState: GameState = {
        plane: 0,
        tickNumber: 0,
        players: new Map(),
        npcMap: new Map(),
        npcSpatialIndex: new Map(),
        objectMap: new Map(),
        varbits: new Map()
    };

    public avatar: SovereignAvatar;
    private modules: Map<string, GameplayModule> = new Map();
    private activeModuleName: string | null = null;

    protected constructor() {
        if (GameplaySovereigntyLimb.instance) {
            throw new Error('Singleton violation: use GameplaySovereigntyLimb.getInstance()');
        }
        this.avatar = new SovereignAvatar('POG2_Sovereign');
        this.globalState.players.set(this.avatar.username, this.avatar);
        this.edgeSync = new CloudflareSyncLimb();
        this.loadSovereignState();
        logger.info('GameplaySovereigntyLimb booted as a CNS-authoritative node.');
    }

    public static getInstance(): GameplaySovereigntyLimb {
        if (!this.instance) {
            this.instance = new GameplaySovereigntyLimb();
        }
        return this.instance;
    }

    public static resetInstance(): void {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('resetInstance is forbidden in production');
        }
        this.instance = undefined;
    }

    public injectSwitchboard(switchboard: SwitchboardLimb) {
        this.switchboard = switchboard;
        logger.info('Switchboard Bridge injected into Gameplay Limb.');
    }

    public injectEntityLimb(entityLimb: EntityLimb) {
        this.entityBrain = entityLimb;
        logger.info('Entity Brain injected into Gameplay Limb.');
    }

    private loadSovereignState() {
        const statePath = resolveSovereignPath('memory/sovereign_state.json');
        if (fs.existsSync(statePath)) {
            try {
                const data = JSON.parse(fs.readFileSync(statePath, 'utf8'));
                if (data.origin) {
                    this.avatar.coord.x = data.origin.x;
                    this.avatar.coord.y = data.origin.z; 
                    this.avatar.coord.plane = data.origin.plane;
                }
                if (data.inventory) {
                    this.avatar.inventory = data.inventory;
                }
                if (data.bank) {
                    this.avatar.bank = data.bank;
                }
                if (data.wallet) {
                    this.avatar.wallet = data.wallet;
                }
                if (data.skills) {
                    Object.entries(data.skills).forEach(([id, skill]: [any, any]) => {
                        this.avatar.skills[parseInt(id)] = skill;
                    });
                }
                if (data.quests) {
                    this.avatar.quests = data.quests;
                }
                logger.info({ origin: data.origin }, 'Loaded Sovereign Save State.');
            } catch (err) {
                logger.error({ err }, 'Failed to parse sovereign_state.json');
            }
        }
    }

    public saveSovereignState() {
        const statePath = resolveSovereignPath('memory/sovereign_state.json');
        const state = {
            origin: {
                x: this.avatar.coord.x,
                z: this.avatar.coord.y,
                plane: this.avatar.coord.plane
            },
            inventory: this.avatar.inventory,
            bank: this.avatar.bank,
            wallet: this.avatar.wallet,
            skills: this.avatar.skills,
            quests: this.avatar.quests,
            timestamp: new Date().toISOString()
        };
        fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
        logger.debug('Sovereign State Saved.');
    }


    /**
     * Handles interacting with the Bank (Nardah Banker Map)
     */
    public openBank() {
        logger.info('Banking interface manifest triggers. Syncing HUD IDs 141184642+');
        // Logic for bank UI population goes here...
    }

    /**
     * Relief of Inventory -> Bank Transfer
     */
    public depositItem(slot: number, amount: number = 1) {
        const item = this.avatar.removeItem(slot);
        if (item) {
            const existing = this.avatar.bank.find(i => i.id === item.id);
            if (existing) {
                existing.amount += item.amount;
            } else {
                this.avatar.bank.push(item);
            }
            this.saveSovereignState();
        }
    }

    /**
     * Achievement Trigger: Fruitful Labour (ID 346)
     */
    public triggerAchievement(id: number) {
        if (id === 346) {
            logger.info('Achievement: Fruitful Labour triggered. Rewarding 30 Coins.');
            this.awardCurrency(CURRENCY_COINS, 30);
        }
    }

    private awardCurrency(id: number, amount: number) {
        this.avatar.wallet[id] = (this.avatar.wallet[id] || 0) + amount;
        this.saveSovereignState();
    }

    /**
     * registerModule - Attach a new logic interpreter to the limb.
     */
    public registerModule(module: GameplayModule): void {
        this.modules.set(module.name.toLowerCase(), module);
        logger.info({ module: module.name }, 'Gameplay module registered.');
    }

    /**
     * setActiveModule - Docks a specific Region/Minigame logic module onto the active server.
     */
    public async setActiveModule(name: string): Promise<Result<boolean>> {
        const module = this.modules.get(name.toLowerCase());
        if (!module) return err(new Error(`Module '${name}' not found.`));

        if (this.activeModuleName) {
            const current = this.modules.get(this.activeModuleName);
            if (current && (current as any).unmount) {
                await (current as any).unmount(this.globalState, this.avatar);
            }
        }

        logger.info(`Mounting Gameplay Module: ${module.name}`);
        await module.mount(this.globalState, this.avatar);
        this.activeModuleName = name.toLowerCase();
        
        logger.info(`Module ${module.name} loaded and pedagogy synthesized.`);
        return ok(true);
    }

    public get activeModule(): GameplayModule | null {
        return this.activeModuleName ? this.modules.get(this.activeModuleName) || null : null;
    }

    /**
     * Executes a single mechanical tick manually.
     */
    public forceTick(): string | null {
        return this.processTick();
    }

    public async initialize(): Promise<Result<void>> {
        try {
            this.startClock();
            return { ok: true, value: undefined };
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    public startClock() {
        if (this.isRunning) return;
        this.isRunning = true;
        // The 600ms interval is now managed by CNSGodheadPulseVolley (Kernel)
        logger.info('Godhead Sovereign Server Clock handed over to CNS Kernel.');
        
        // Phase 259: Initialize Simulation Harness
        if (!this.harness) {
            logger.warn('[Gameplay] Simulation Harness not yet injected. Running in viscerally grounded mode.');
        }
    }

    public injectHarness(harness: SimulationHarness) {
        this.harness = harness;
        logger.info('Simulation Harness injected into Gameplay Limb.');
    }

    public stopClock() {
        this.isRunning = false;
        logger.info('Server Clock stopped.');
    }

    /**
     * processTick - Authoritative State Advancement.
     * Called by CNSGodheadPulseVolley every 600ms.
     */
    public processTick(): string | null {
        this.tickCount++;
        this.globalState.tickNumber = this.tickCount;

        // 1. Process Avatar (Visceral Reflex)
        this.avatar.processTick();

        // 2. Delegate to Simulation Harness (Deterministic Logic)
        if (this.harness) {
            this.harness.processTick(this.tickCount, this.globalState, this.avatar);
        }

        // 3. Autosave every 10 ticks (6 seconds) if needed, or trigger on change
        if (this.tickCount % 10 === 0) {
            this.saveSovereignState();
        }

        let moduleResult: string | null = null;
        if (this.activeModule) {
            moduleResult = this.activeModule.onTick(this.tickCount, this.globalState, this.avatar);
        }

        if (this.switchboard) {
            this.switchboard.syncGameState({
                tick: this.tickCount,
                avatar: {
                    username: this.avatar.username,
                    x: this.avatar.coord.x,
                    y: this.avatar.coord.y,
                    plane: this.avatar.coord.plane,
                    inventory: this.avatar.inventory,
                    wallet: this.avatar.wallet,
                    bank: this.avatar.bank,
                    skills: this.avatar.skills,
                    quests: this.avatar.quests,
                    isBusy: this.avatar.isBusy()
                },

                activeModule: this.activeModule?.name || 'idle'
            });
        }

        return moduleResult;
    }

    public pushAction(action: string): string {
        if (!this.activeModule) {
            return "[Engine] No active gameplay module mounted.";
        }
        
        if (this.avatar.isBusy()) {
            return `[Engine] You are busy for ${this.avatar.lockTicks} more ticks.`;
        }

        return this.activeModule.onAction(action, this.globalState, this.avatar);
    }
}

