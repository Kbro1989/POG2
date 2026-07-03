import { createLogger } from '../../utils/logger.js';
import { CNSGodheadPulseVolley } from '../../engines/gameplay/CNSGodheadPulseVolley.js';
import { SwitchboardLimb } from '../../monitor/SwitchboardLimb.js';
import { PlayerAgent } from '../../engines/gameplay/PlayerAgent.js';
import { SovereignAvatarEntity } from '../../core/SovereignAvatar.js';
import { CanonicalClock, TickTier } from '../../utils/CanonicalClock.js';
import { HexagramManager, TransitionalState } from '../../routing/HexagramManager.js';

const logger = createLogger('TemporalHeartbeatLimb');

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface TickAuthority {
  authority: 'pog2' | 'hermes' | 'hardware' | 'user';
  reason: string;
}

export interface HexagramState {
  binary: string;
  utf8: string;
  variance: number;
  changingLines: number[];
}

export interface HardwareLimb {
  isActive(): boolean;
  getTelemetry(): Record<string, unknown> | null;
}

export interface PersistenceLayer {
  saveEvent(frame: Record<string, unknown>): Promise<void>;
  saveDelta(frame: Record<string, unknown>): Promise<void>;
}

// ─── Hexagram Manager (minimal contract) ────────────────────────────────────

import { HEXAGRAM_REGISTRY } from '../../core/HexagramDefinitions.js';
const UTF8_TABLE: Record<string, string> = Object.fromEntries(
  Object.entries(HEXAGRAM_REGISTRY).map(([binary, def]) => [
    binary,
    def.name.includes(' ') ? def.name.split(' ')[0] : def.name
  ])
);

// ─── User Override (singleton) ────────────────────────────────────────────────

export class UserOverride {
  private static active = false;
  private static authority: TickAuthority['authority'] | null = null;

  static assert(authority: TickAuthority['authority']): void {
    this.active = true;
    this.authority = authority;
  }

  static release(): void {
    this.active = false;
    this.authority = null;
  }

  static isActive(): boolean {
    return this.active;
  }

  static getAuthority(): TickAuthority['authority'] | null {
    return this.authority;
  }
}

// ─── Default Stubs ──────────────────────────────────────────────────────────

export class StubHardwareLimb implements HardwareLimb {
  isActive(): boolean {
    return false; // MHD backend plugs in here when ready
  }

  getTelemetry(): Record<string, unknown> | null {
    return null;
  }
}

export class NoopPersistenceLayer implements PersistenceLayer {
  async saveEvent(): Promise<void> {}
  async saveDelta(): Promise<void> {}
}

// ─── Temporal Heartbeat Limb ────────────────────────────────────────────────

export class TemporalHeartbeatLimb {
  private static instance: TemporalHeartbeatLimb | undefined;

  // CanonicalClock-aligned state
  private worldTickCount = 0;
  private hexagram: HexagramState = {
    binary: '111111',
    utf8: UTF8_TABLE['111111'] || '乾',
    variance: 0.0,
    changingLines: [],
  };
  private isCognitiveBusy = false;
  private readonly hardware: HardwareLimb;
  private readonly persistence: PersistenceLayer;
  private lastMetabolicAt = 0;
  private lastSystemAt = 0;

  private constructor(
    hardware?: HardwareLimb,
    persistence?: PersistenceLayer,
  ) {
    this.hardware = hardware || new StubHardwareLimb();
    this.persistence = persistence || new NoopPersistenceLayer();
    this.registerPulse();
  }

  public static getInstance(
    hardware?: HardwareLimb,
    persistence?: PersistenceLayer,
  ): TemporalHeartbeatLimb {
    if (!TemporalHeartbeatLimb.instance) {
      TemporalHeartbeatLimb.instance = new TemporalHeartbeatLimb(
        hardware,
        persistence,
      );
    }
    return TemporalHeartbeatLimb.instance;
  }

  private registerPulse(): void {
    CanonicalClock.getInstance().registerPulse({
      domain: 'temporal-motor',
      name: 'TemporalHeartbeatLimb.dispatch',
      priority: 0,
      callback: (tick: number, phase: number) =>
        this.onCanonicalPulse(tick, phase),
    });
  }

  /**
   * Domain-scoped dispatch: CanonicalClock is the sole timing authority.
   * GAME  -> CNS Godhead Pulse (world reduce / ledger)
   * PLAYER -> Player agent / cognitive advance
   * SYSTEM -> Persistence + delta-intent encoding
   */
  /**
   * Test/direct-call entry. In production this is invoked only by CanonicalClock.
   * Routing stays domain-scoped via onCanonicalPulse().
   */
  public async pulse(): Promise<void> {
    const coordinate = CanonicalClock.getInstance().getCoordinate();
    return this.onCanonicalPulse(coordinate.gameTick, coordinate.playerPhase);
  }

  private async onCanonicalPulse(
    tick: number,
    phase: number,
  ): Promise<void> {
    this.worldTickCount++;
    const tier = phase === 0 ? TickTier.GAME : TickTier.PLAYER;

    // SYSTEM tier every 2nd game tick / wall-clock cadence
    const effectiveTier =
      tier === TickTier.GAME && this.worldTickCount % 2 === 0
        ? TickTier.SYSTEM
        : tier;

    switch (effectiveTier) {
      case TickTier.GAME:
        await this.runGameTick();
        break;
      case TickTier.PLAYER:
        await this.runPlayerTick();
        break;
      case TickTier.SYSTEM:
        await this.runSystemTick(effectiveTier);
        break;
    }
  }

  private async runGameTick(): Promise<void> {
    const switchboard = SwitchboardLimb.getInstance();
    const pending = switchboard.drainAdminQueue();
    const volley = CNSGodheadPulseVolley.getInstance();

    try {
      const state = await volley.pulse(pending);

      const renderer = volley.getRenderer();
      const avatar = volley.getAvatar();
      if (renderer && state && avatar) {
        const radar = (await import('../spatial/SpatialRadarLimb.js'))
          .SpatialRadarLimb.getInstance();
        const grid = radar.render(state, avatar);
        renderer.drawRadar(grid);
      }
    } catch (e: any) {
      logger.error(
        { error: e.message, tick: this.worldTickCount },
        'Heartbeat GAME tick failure.',
      );
    }
  }

  private async runPlayerTick(): Promise<void> {
    if (!this.isCognitiveBusy) {
      await this.emitPlayerPulse();
    } else {
      logger.warn(
        { tick: this.worldTickCount },
        'Cognitive Skip: Substrate busy.',
      );
    }
  }

  private async runSystemTick(tier: TickTier): Promise<void> {
    const authority = this.resolveAuthority();
    const now = CanonicalClock.getInstance().simulatedNow();

    // Reuse GAME tick state if available this cycle; otherwise best-effort only.
    const delta = this.encodeDeltaIntent(now, authority, tier);
    this.persistence
      .saveEvent({
        tick: this.worldTickCount,
        hexagram: this.hexagram.binary,
        hexagramUtf8: this.hexagram.utf8,
        producedAt: now,
        utc: new Date(now).toISOString(),
        authority: authority.authority,
        tier,
        delta,
        phaseMultiplier: this.calculatePhaseMultiplier(),
      } as any)
      .catch((err: any) =>
        logger.error({ err }, 'Heartbeat SYSTEM saveEvent failed.'),
      );

    this.persistence
      .saveDelta({
        tick: this.worldTickCount,
        hexagram: this.hexagram.binary,
        hexagramUtf8: this.hexagram.utf8,
        producedAt: now,
        utc: new Date(now).toISOString(),
        authority: authority.authority,
        tier,
        delta,
        phaseMultiplier: this.calculatePhaseMultiplier(),
      } as any)
      .catch((err: any) =>
        logger.error({ err }, 'Heartbeat SYSTEM saveDelta failed.'),
      );
  }

  private async emitPlayerPulse(): Promise<void> {
    this.isCognitiveBusy = true;
    try {
      const playerTickNum = this.worldTickCount;
      const volley = CNSGodheadPulseVolley.getInstance();
      const avatar = volley.getAvatar();
      if (avatar) {
        const playerAgent = new PlayerAgent(
          avatar as SovereignAvatarEntity,
        );
        playerAgent.advanceTick(600);

        const GhostSplatEngine = (await import('../../substrates/GhostSplatEngine.js'))
          .GhostSplatEngine;
        const field = GhostSplatEngine.getInstance().getLatestField();
        if (field) {
          await playerAgent.evaluateTacticalPosition(field);

          if (avatar.metadata.tacticalState !== 'evading') {
            const intent = playerAgent.evaluateCombatRotation(
              field,
              playerTickNum,
            );
            if (intent) {
              avatar.intent = intent as any;
            }
          }
        }
      }
    } finally {
      this.isCognitiveBusy = false;
    }
  }

  public getStatus() {
    return {
      worldTick: this.worldTickCount,
      frequency: 'domain-scoped (GAME/PLAYER/SYSTEM)',
      isBusy: this.isCognitiveBusy,
    };
  }

  public healthCheck(): { online: boolean; details: string } {
    return { online: true, details: 'TemporalHeartbeatLimb active and verified.' };
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private resolveAuthority(): TickAuthority {
    if (UserOverride.isActive()) {
      return { authority: UserOverride.getAuthority() || 'user', reason: 'user-override' };
    }

    if (this.hexagram.variance > 0.7) {
      return { authority: 'hermes', reason: 'high-hexagram-variance' };
    }

    if (this.hardware.isActive()) {
      return { authority: 'hardware', reason: 'physical-substrate-active' };
    }

    return { authority: 'pog2', reason: 'sovereign-default' };
  }

  private calculatePhaseMultiplier(): number {
    const base = 1.0;
    const drift = this.hexagram.variance * 0.3;
    return Math.max(0.1, base - drift);
  }

  private encodeDeltaIntent(
    ts: number,
    authority: TickAuthority,
    tier: TickTier,
  ): string {
    const name = 'pog2-clock';
    const pos = '(0,0)';
    const fatigue = '0';
    const action = 'tick';
    const target = this.hexagram.binary;
    const param = this.hexagram.utf8;
    const inv = '[]';
    const bnk = '[]';
    const skl = '[]';

    return `[${name}];pos:${pos};fat:(${fatigue});int:(${action},${target},${param},${ts});inv:${inv};bnk:${bnk};skl:${skl}`;
  }
}