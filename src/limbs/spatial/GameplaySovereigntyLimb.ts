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

const logger = createLogger('GameplaySovereigntyLimb');

// Pedagogical Mappings
const CURRENCY_COINS = 22159;
const BANK_BUTTON_DEPOSIT_ALL = 141184642;
const BANK_BUTTON_DEPOSIT_EQUIPMENT = 141184643;

export class GameplaySovereigntyLimb {
    private isRunning: boolean = false;
    private tickInterval: NodeJS.Timeout | null = null;
    public tickCount: number = 0;
    
    public edgeSync: CloudflareSyncLimb;
    private switchboard: SwitchboardLimb | null = null;
    private entityBrain: EntityLimb | null = null;
    
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
    private activeModule: GameplayModule | null = null;

    constructor() {
        this.avatar = new SovereignAvatar('POG2_Sovereign');
        this.globalState.players.set(this.avatar.username, this.avatar);
        this.edgeSync = new CloudflareSyncLimb();
        this.loadSovereignState();
        logger.info('GameplaySovereigntyLimb booted with initial Avatar state and Cloudflare Edge sync active.');
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
     * Docks a specific Region/Minigame logic module onto the active server.
     */
    public async mountModule(module: GameplayModule) {
        logger.info(`Mounting Gameplay Module: ${module.name}`);
        this.activeModule = module;
        await this.activeModule.mount(this.globalState, this.avatar);
        logger.info(`Module ${module.name} loaded and pedagogy synthesized.`);
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
        this.tickInterval = setInterval(() => this.processTick(), 600);
        logger.info('Standard 600ms Sovereign Server Clock started.');
    }

    public stopClock() {
        this.isRunning = false;
        if (this.tickInterval) clearInterval(this.tickInterval);
        logger.info('Server Clock stopped.');
    }

    private processTick(): string | null {
        this.tickCount++;
        this.globalState.tickNumber = this.tickCount;

        this.avatar.processTick();

        // Autosave every 10 ticks (6 seconds) if needed, or trigger on change
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

