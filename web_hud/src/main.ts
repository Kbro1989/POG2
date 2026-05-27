import './style.css'
import * as BABYLON from '@babylonjs/core';

interface Ability {
  name: string;
  icon: string;
  keybind: string;
  type: 'basic' | 'threshold' | 'ultimate';
}

const MELEE_ABILITIES: Ability[] = [
  { name: "Attack", icon: "attack-.png", keybind: "1", type: "basic" },
  { name: "Slice", icon: "slice.png", keybind: "2", type: "basic" },
  { name: "Sever", icon: "sever.png", keybind: "3", type: "basic" },
  { name: "Fury", icon: "fury.png", keybind: "4", type: "basic" },
  { name: "Decimate", icon: "decimate.png", keybind: "5", type: "basic" },
  { name: "Cleave", icon: "cleave.png", keybind: "6", type: "basic" },
  { name: "Smash", icon: "smash.png", keybind: "7", type: "basic" },
  { name: "Hurricane", icon: "hurricane.png", keybind: "Q", type: "threshold" },
  { name: "Assault", icon: "assault.png", keybind: "W", type: "threshold" },
  { name: "Quake", icon: "quake.png", keybind: "E", type: "threshold" },
  { name: "Berserk", icon: "berserk.png", keybind: "R", type: "ultimate" },
  { name: "Meteor Strike", icon: "meteor-strike.png", keybind: "T", type: "ultimate" },
  { name: "Overpower", icon: "overpower.png", keybind: "Y", type: "ultimate" },
  { name: "Freedom", icon: "freedom.png", keybind: "F", type: "basic" },
];

class SovereignUnifiedHUD {
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private adrenaline = 0;
  private logElement: HTMLElement;
  private barElement: HTMLElement;
  private fillElement: HTMLElement;

  // Observability panel refs
  private engStyle: HTMLElement;
  private engPhase: HTMLElement;
  private engRotation: HTMLElement;
  private engNext: HTMLElement;
  private engKernel: HTMLElement;
  private engLastAction: HTMLElement;
  private targetName: HTMLElement;
  private targetHpFill: HTMLElement;
  private targetHpText: HTMLElement;
  private hexGlyph: HTMLElement;
  private hexName: HTMLElement;
  private hexMeaning: HTMLElement;
  private ghostCanvas: HTMLCanvasElement;
  private ghostCtx: CanvasRenderingContext2D;
  private rotationSeq: HTMLElement;
  private aggThreat: HTMLElement;
  private aggLeash: HTMLElement;
  private aggWander: HTMLElement;
  private aggState: HTMLElement;

  // State tracking
  private rotationHistory: string[] = [];

  constructor() {
    this.logElement = document.getElementById('log')!;
    this.barElement = document.getElementById('action-bar')!;
    this.fillElement = document.getElementById('adrenaline-fill')!;

    // Bind observability panels
    this.engStyle = document.getElementById('eng-style')!;
    this.engPhase = document.getElementById('eng-phase')!;
    this.engRotation = document.getElementById('eng-rotation')!;
    this.engNext = document.getElementById('eng-next')!;
    this.engKernel = document.getElementById('eng-kernel')!;
    this.engLastAction = document.getElementById('eng-last-action')!;
    this.targetName = document.getElementById('target-name')!;
    this.targetHpFill = document.getElementById('target-hp-fill')!;
    this.targetHpText = document.getElementById('target-hp-text')!;
    this.hexGlyph = document.getElementById('hex-glyph')!;
    this.hexName = document.getElementById('hex-name')!;
    this.hexMeaning = document.getElementById('hex-meaning')!;
    this.ghostCanvas = document.getElementById('ghostsplat-canvas') as HTMLCanvasElement;
    this.ghostCtx = this.ghostCanvas.getContext('2d')!;
    this.rotationSeq = document.getElementById('rotation-sequence')!;
    this.aggThreat = document.getElementById('agg-threat')!;
    this.aggLeash = document.getElementById('agg-leash')!;
    this.aggWander = document.getElementById('agg-wander')!;
    this.aggState = document.getElementById('agg-state')!;
    
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    this.engine = new BABYLON.Engine(canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
    
    this.init3D();
    this.init2D();
    this.connectBridge();
    
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
    
    window.addEventListener('resize', () => this.engine.resize());
  }

  private init3D() {
    this.scene.clearColor = new BABYLON.Color4(0.02, 0.03, 0.04, 1);
    
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0), this.scene);
    camera.attachControl(document.getElementById('renderCanvas'), true);
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 10;

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
    light.intensity = 0.7;

    // Create a mock avatar point cloud
    this.createMockAvatar();
  }

  private createMockAvatar() {
    const pcs = new BABYLON.PointsCloudSystem("pcs", 2, this.scene);
    const count = 2000;
    
    pcs.addPoints(count, (particle: BABYLON.CloudPoint, i: number) => {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        
        // Sphere-like distribution for now
        particle.position = new BABYLON.Vector3(
            Math.sin(phi) * Math.cos(theta) * 0.5,
            Math.cos(phi) * 1.0, // Humanoid-ish height
            Math.sin(phi) * Math.sin(theta) * 0.5
        );
        particle.color = new BABYLON.Color4(0, 0.8, 1, 0.5);
    });
    
    pcs.buildMeshAsync();
  }

  private init2D() {
    this.renderBar();
    this.addLog('Unified Substrate active. Connecting...');
  }

  private renderBar() {
    this.barElement.innerHTML = '';
    MELEE_ABILITIES.forEach((ability) => {
      const slot = document.createElement('div');
      slot.className = `ability-slot ${ability.type}`;
      slot.innerHTML = `
        <span class="slot-key">${ability.keybind}</span>
        <img src="/icons/${ability.icon}" alt="${ability.name}" onerror="this.src='https://via.placeholder.com/40/00d2ff/ffffff?text=${ability.name[0]}'">
      `;
      this.barElement.appendChild(slot);
    });
  }

  private connectBridge() {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
      this.addLog('Linked to Sovereign Engine.');
      const indicator = document.getElementById('engine-status');
      if (indicator) {
        indicator.style.background = '#34d399';
        indicator.style.boxShadow = '0 0 10px #34d399';
      }
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // ─── CombatHUDBridge message types ───────────────────────────────
      if (data.type === 'STATE_UPDATE') {
        this.setAdrenaline(data.adrenaline);
        const arch = document.getElementById('archetype-name');
        if (arch) arch.innerText = data.activeArchetype.toUpperCase();
        if (data.lastAction) {
          this.highlightAbility(data.lastAction);
          this.engLastAction.innerText = data.lastAction;
          this.pushRotationStep(data.lastAction);
        }
        if (data.learningTrace) this.renderCausalChain(data.learningTrace);
        if (data.combatStyle)   this.engStyle.innerText = data.combatStyle.toUpperCase();
        if (data.activePhase)   this.engPhase.innerText = data.activePhase;
        if (data.activeRotation) this.engRotation.innerText = data.activeRotation;
        if (data.nextAbility)   this.engNext.innerText = data.nextAbility;
        if (data.kernelPhase)   this.engKernel.innerText = data.kernelPhase;
        if (data.targetName)    this.targetName.innerText = data.targetName;
        if (data.targetHp !== undefined) this.updateTargetHp(data.targetHp);

      } else if (data.type === 'LOG_UPDATE') {
        this.addLog(data.message, data.level);

      } else if (data.type === 'HITSPLAT') {
        this.showHitsplat(data.value, data.kind);

      // ─── Future CombatHUDBridge extension types ───────────────────────
      } else if (data.type === 'HEXAGRAM_UPDATE') {
        this.updateHexagram(data.glyph, data.name, data.meaning);
      } else if (data.type === 'GHOSTSPLAT_UPDATE') {
        this.renderGhostSplat(data.heatmap);
      } else if (data.type === 'AGGRESSION_UPDATE') {
        this.updateAggression(data.threat, data.leash, data.wander, data.state);

      // ─── POG2WorldDO / SwitchboardLimb message types ─────────────────
      } else if (data.type === 'TICK' || data.type === 'INIT') {
        const frame = data.frame;
        if (!frame) return;
        // Hexagram state
        if (frame.hexagramState) {
          const hs = frame.hexagramState;
          const def = hs.definition;
          this.updateHexagramFromDef(hs.activeId, def, hs.yaoLines, hs.engineFocus);
        }
        // GhostSplat heatmap
        if (frame.ghostSplat?.heatmap) {
          this.renderGhostSplat(frame.ghostSplat.heatmap, frame.ghostSplat.dimensions);
        }
        // Active entities log
        if (frame.activeEntities) {
          const e = frame.activeEntities;
          this.addLog(`Tick ${frame.tick} — NPCs:${e.npcs} Items:${e.items} Players:${e.players}`);
        }

      } else if (data.type === 'ghost_splat') {
        // Direct SwitchboardLimb broadcast
        if (data.heatmap) this.renderGhostSplat(data.heatmap, data.dimensions);

      } else if (data.type === 'kernel_diagnostics') {
        // Kernel phase / chaos phase from SwitchboardLimb
        if (data.chaosPhase) this.engKernel.innerText = data.chaosPhase;
        if (data.volatilityEMA !== undefined) {
          this.engPhase.innerText = `vol:${data.volatilityEMA.toFixed(3)}`;
        }

      } else if (data.type === 'CAUSAL_EXPLANATION') {
        // LearningTrace from SwitchboardLimb.broadcastLearningTrace()
        if (data.evidence) this.renderCausalChain(data.evidence);

      } else if (data.type === 'GAME_STATE') {
        // Full integrated world/player state
        const gs = data.gameState || data;
        if (gs.adrenaline !== undefined) this.setAdrenaline(gs.adrenaline / 100);
        if (gs.combatStyle) this.engStyle.innerText = gs.combatStyle.toUpperCase();
        if (gs.targetHp !== undefined) this.updateTargetHp(gs.targetHp);
        if (gs.targetName) this.targetName.innerText = gs.targetName;
      }
    };
    ws.onclose = () => {
      this.addLog('Link severed. Retrying...', 'info');
      const indicator = document.getElementById('engine-status');
      if (indicator) {
        indicator.style.background = '#ef4444';
        indicator.style.boxShadow = '0 0 10px #ef4444';
      }
      setTimeout(() => this.connectBridge(), 2000);
    };
  }

  private showHitsplat(value: number, kind: string) {
    // Basic screen-space hitsplat logic (or 3D world space)
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '50%';
    container.style.top = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '100';
    
    const color = kind === 'CRIT' ? '#ffcc00' : (kind === 'POISON' ? '#00cc00' : '#ff4444');
    const size = kind === 'CRIT' ? '48px' : '32px';
    
    container.innerHTML = `<span style="color: ${color}; font-size: ${size}; font-weight: 800; filter: drop-shadow(0 0 10px ${color}); transition: all 0.5s ease-out;">${value}</span>`;
    document.body.appendChild(container);
    
    // Animate up and fade
    setTimeout(() => {
        container.style.transform = 'translate(-50%, -150%) scale(1.5)';
        container.style.opacity = '0';
    }, 10);
    
    setTimeout(() => container.remove(), 1000);
  }

  private setAdrenaline(value: number) {
    this.adrenaline = Math.max(0, Math.min(100, value));
    this.fillElement.style.width = `${this.adrenaline}%`;
    if (this.adrenaline >= 100) {
      this.fillElement.style.boxShadow = '0 0 30px var(--neon-blue)';
      this.fillElement.style.background = 'linear-gradient(90deg, var(--neon-blue), var(--neon-purple))';
    } else {
      this.fillElement.style.boxShadow = '0 0 20px rgba(255, 157, 0, 0.5)';
      this.fillElement.style.background = 'linear-gradient(90deg, var(--adrenaline-orange), #ff4d00)';
    }
  }

  private highlightAbility(name: string) {
    const slots = document.querySelectorAll('.ability-slot');
    slots.forEach(slot => {
      const img = slot.querySelector('img');
      if (img && (img.alt === name || img.alt.toLowerCase() === name.toLowerCase())) {
        slot.classList.add('active-fire');
        setTimeout(() => slot.classList.remove('active-fire'), 600);
      }
    });
  }

  private addLog(message: string, type: 'info' | 'action' = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type === 'action' ? 'action' : ''}`;
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    entry.innerText = `[${time}] ${message}`;
    this.logElement.prepend(entry);
    if (this.logElement.childNodes.length > 20) this.logElement.lastChild?.remove();
  }

  // ─────────────────────────────────────────────────────────────────
  // Renderer Methods
  // ─────────────────────────────────────────────────────────────────

  private updateTargetHp(hp: number) {
    // hp is 0-100 (percentage) or raw points depending on source
    const pct = hp <= 1 ? hp * 100 : hp; // normalize
    const clamped = Math.max(0, Math.min(100, pct));
    this.targetHpFill.style.width = `${clamped}%`;
    // Color shifts red as HP drops
    if (clamped > 60) {
      this.targetHpFill.style.background = 'linear-gradient(90deg, #34d399, #10b981)';
    } else if (clamped > 30) {
      this.targetHpFill.style.background = 'linear-gradient(90deg, #fbbf24, #f59e0b)';
    } else {
      this.targetHpFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    }
    this.targetHpText.innerText = `${Math.round(clamped)}%`;
  }

  private pushRotationStep(abilityName: string) {
    // Maintain a window of the last 6 abilities used
    this.rotationHistory.push(abilityName);
    if (this.rotationHistory.length > 6) this.rotationHistory.shift();

    this.rotationSeq.innerHTML = '';
    this.rotationHistory.forEach((name, idx) => {
      const isLast = idx === this.rotationHistory.length - 1;
      const isPrev = idx === this.rotationHistory.length - 2;

      const step = document.createElement('span');
      step.className = `rotation-step ${isLast ? 'current' : isPrev ? 'past' : 'past'}`;
      step.innerText = name.length > 10 ? name.slice(0, 9) + '…' : name;
      this.rotationSeq.appendChild(step);

      if (!isLast) {
        const arrow = document.createElement('span');
        arrow.className = 'rotation-arrow';
        arrow.innerText = '→';
        this.rotationSeq.appendChild(arrow);
      }
    });

    // Scroll to end to show most recent
    this.rotationSeq.scrollLeft = this.rotationSeq.scrollWidth;
  }

  private updateHexagram(glyph: string, name: string, meaning: string) {
    this.hexGlyph.innerText = glyph;
    this.hexName.innerText = name;
    this.hexMeaning.innerText = meaning;
    // Flash the glyph on change
    this.hexGlyph.style.textShadow = '0 0 40px rgba(0, 255, 204, 0.9)';
    setTimeout(() => {
      this.hexGlyph.style.textShadow = '0 0 20px rgba(0, 255, 204, 0.4)';
    }, 400);
  }

  // Maps hexagram ID → { glyph, name, meaning } for POG2WorldDO TICK frames
  private static readonly HEXAGRAM_TABLE: Record<number, { glyph: string; name: string; meaning: string }> = {
    1:  { glyph: '䷀', name: 'Qián',   meaning: 'Creative Force' },
    2:  { glyph: '䷁', name: 'Kūn',    meaning: 'Receptive Earth' },
    3:  { glyph: '䷂', name: 'Zhūn',   meaning: 'Difficulty at the Start' },
    4:  { glyph: '䷃', name: 'Méng',   meaning: 'Youthful Folly' },
    5:  { glyph: '䷄', name: 'Xū',     meaning: 'Waiting' },
    6:  { glyph: '䷅', name: 'Sòng',   meaning: 'Conflict' },
    7:  { glyph: '䷆', name: 'Shī',    meaning: 'The Army' },
    8:  { glyph: '䷇', name: 'Bǐ',     meaning: 'Holding Together' },
    9:  { glyph: '䷈', name: 'Xiǎo Xù', meaning: 'Small Taming' },
    10: { glyph: '䷉', name: 'Lǚ',     meaning: 'Treading' },
    11: { glyph: '䷊', name: 'Tài',    meaning: 'Peace' },
    12: { glyph: '䷋', name: 'Pǐ',     meaning: 'Standstill' },
    13: { glyph: '䷌', name: 'Tóng Rén', meaning: 'Fellowship' },
    14: { glyph: '䷍', name: 'Dà Yǒu', meaning: 'Great Possession' },
    15: { glyph: '䷎', name: 'Qiān',   meaning: 'Modesty' },
    16: { glyph: '䷏', name: 'Yù',     meaning: 'Enthusiasm' },
    17: { glyph: '䷐', name: 'Suí',    meaning: 'Following' },
    18: { glyph: '䷑', name: 'Gǔ',     meaning: 'Work on the Decayed' },
    19: { glyph: '䷒', name: 'Lín',    meaning: 'Approach' },
    20: { glyph: '䷓', name: 'Guān',   meaning: 'Contemplation' },
    21: { glyph: '䷔', name: 'Shì Kè', meaning: 'Biting Through' },
    22: { glyph: '䷕', name: 'Bì',     meaning: 'Grace' },
    23: { glyph: '䷖', name: 'Bō',     meaning: 'Splitting Apart' },
    24: { glyph: '䷗', name: 'Fù',     meaning: 'Return' },
    25: { glyph: '䷘', name: 'Wú Wàng', meaning: 'Innocence' },
    26: { glyph: '䷙', name: 'Dà Xù',  meaning: 'Great Taming' },
    27: { glyph: '䷚', name: 'Yí',     meaning: 'Nourishment' },
    28: { glyph: '䷛', name: 'Dà Guò', meaning: 'Great Excess' },
    29: { glyph: '䷜', name: 'Kǎn',    meaning: 'The Abyss' },
    30: { glyph: '䷝', name: 'Lí',     meaning: 'The Clinging' },
    31: { glyph: '䷞', name: 'Xián',   meaning: 'Influence' },
    32: { glyph: '䷟', name: 'Héng',   meaning: 'Duration' },
    33: { glyph: '䷠', name: 'Dùn',    meaning: 'Retreat' },
    34: { glyph: '䷡', name: 'Dà Zhuàng', meaning: 'Great Power' },
    35: { glyph: '䷢', name: 'Jìn',    meaning: 'Progress' },
    36: { glyph: '䷣', name: 'Míng Yí', meaning: 'Darkening of the Light' },
    37: { glyph: '䷤', name: 'Jiā Rén', meaning: 'The Family' },
    38: { glyph: '䷥', name: 'Kuí',    meaning: 'Opposition' },
    39: { glyph: '䷦', name: 'Jiǎn',   meaning: 'Obstruction' },
    40: { glyph: '䷧', name: 'Jiě',    meaning: 'Deliverance' },
    41: { glyph: '䷨', name: 'Sǔn',    meaning: 'Decrease' },
    42: { glyph: '䷩', name: 'Yì',     meaning: 'Increase' },
    43: { glyph: '䷪', name: 'Guài',   meaning: 'Breakthrough' },
    44: { glyph: '䷫', name: 'Gòu',    meaning: 'Coming to Meet' },
    45: { glyph: '䷬', name: 'Cuì',    meaning: 'Gathering Together' },
    46: { glyph: '䷭', name: 'Shēng',  meaning: 'Pushing Upward' },
    47: { glyph: '䷮', name: 'Kùn',    meaning: 'Oppression' },
    48: { glyph: '䷯', name: 'Jǐng',   meaning: 'The Well' },
    49: { glyph: '䷰', name: 'Gé',     meaning: 'Revolution' },
    50: { glyph: '䷱', name: 'Dǐng',   meaning: 'The Cauldron' },
    51: { glyph: '䷲', name: 'Zhèn',   meaning: 'Thunder' },
    52: { glyph: '䷳', name: 'Gèn',    meaning: 'Keeping Still' },
    53: { glyph: '䷴', name: 'Jiàn',   meaning: 'Development' },
    54: { glyph: '䷵', name: 'Guī Mèi', meaning: 'The Marrying Maiden' },
    55: { glyph: '䷶', name: 'Fēng',   meaning: 'Abundance' },
    56: { glyph: '䷷', name: 'Lǚ',     meaning: 'The Wanderer' },
    57: { glyph: '䷸', name: 'Xùn',    meaning: 'The Gentle Wind' },
    58: { glyph: '䷹', name: 'Duì',    meaning: 'The Joyous Lake' },
    59: { glyph: '䷺', name: 'Huàn',   meaning: 'Dispersion' },
    60: { glyph: '䷻', name: 'Jié',    meaning: 'Limitation' },
    61: { glyph: '䷼', name: 'Zhōng Fú', meaning: 'Inner Truth' },
    62: { glyph: '䷽', name: 'Xiǎo Guò', meaning: 'Small Excess' },
    63: { glyph: '䷾', name: 'Jì Jì',  meaning: 'After Completion' },
    64: { glyph: '䷿', name: 'Wèi Jì', meaning: 'Before Completion' },
  };

  private updateHexagramFromDef(
    activeId: number,
    def: any,
    yaoLines: boolean[],
    engineFocus: string[]
  ) {
    const entry = SovereignUnifiedHUD.HEXAGRAM_TABLE[activeId];
    if (!entry) return;

    const prevGlyph = this.hexGlyph.innerText;
    this.hexGlyph.innerText = entry.glyph;
    this.hexName.innerText = entry.name;

    // Build meaning from def.description if available, else use table
    const meaning = def?.description || entry.meaning;
    this.hexMeaning.innerText = engineFocus?.length
      ? `${meaning} • ${engineFocus.slice(0, 2).join(', ')}`
      : meaning;

    // Flash only if hexagram changed
    if (prevGlyph !== entry.glyph) {
      this.hexGlyph.style.color = '#ffffff';
      this.hexGlyph.style.textShadow = '0 0 50px rgba(255, 255, 255, 0.9)';
      setTimeout(() => {
        this.hexGlyph.style.color = '';
        this.hexGlyph.style.textShadow = '';
      }, 600);
      this.addLog(`Hexagram shifted → ${entry.name} (${entry.meaning})`);
    }

    // Yao lines: encode which lines are active
    if (yaoLines?.length === 6) {
      const activeCount = yaoLines.filter(Boolean).length;
      this.engPhase.innerText = `${activeCount}/6 yáo`;
    }
  }

  private renderGhostSplat(
    heatmap: number[],
    dimensions?: { width: number; height: number }
  ) {
    const W = dimensions?.width ?? 66;
    const H = dimensions?.height ?? 66;
    const ctx = this.ghostCtx;
    const cw = this.ghostCanvas.width;
    const ch = this.ghostCanvas.height;

    ctx.clearRect(0, 0, cw, ch);

    if (!heatmap || heatmap.length === 0) return;

    const cellW = cw / W;
    const cellH = ch / H;

    // Find max for normalization
    let maxVal = 0;
    for (let i = 0; i < heatmap.length; i++) {
      if (heatmap[i] > maxVal) maxVal = heatmap[i];
    }
    if (maxVal === 0) return;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = y * W + x;
        const val = heatmap[idx] ?? 0;
        if (val === 0) continue;

        const norm = val / maxVal; // 0-1
        // Hot = red, cold = green, safe = dark
        const r = Math.round(norm * 239);
        const g = Math.round((1 - norm) * 209);
        const b = 68;
        const a = 0.2 + norm * 0.8;

        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fillRect(
          Math.floor(x * cellW),
          Math.floor(y * cellH),
          Math.ceil(cellW),
          Math.ceil(cellH)
        );
      }
    }

    // Grid overlay (subtle)
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellW, 0);
      ctx.lineTo(x * cellW, ch);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellH);
      ctx.lineTo(cw, y * cellH);
      ctx.stroke();
    }
  }

  private updateAggression(
    threat: number,
    leash: number,
    wander: number,
    state: string
  ) {
    this.aggThreat.style.width = `${Math.max(0, Math.min(100, (threat ?? 0) * 100))}%`;
    this.aggLeash.style.width  = `${Math.max(0, Math.min(100, (leash  ?? 0) * 100))}%`;
    this.aggWander.style.width = `${Math.max(0, Math.min(100, (wander ?? 0) * 100))}%`;

    const normalized = (state || 'idle').toLowerCase();
    // Map AggressionSimulator decision.action/newState → CSS class
    const classMap: Record<string, string> = {
      attack: 'combat', enraged: 'combat', aggressive: 'combat',
      confused: 'alert',
      wander: 'patrol', patrol: 'patrol',
      idle: 'idle', flee: 'idle'
    };
    const cssClass = classMap[normalized] ?? 'idle';
    this.aggState.className = `aggression-state ${cssClass}`;
    this.aggState.innerText = normalized.toUpperCase();
  }

  renderCausalChain(evidence: any[]) {
    const panel = document.getElementById('causality-panel');
    if (!panel) return;

    panel.innerHTML = '';
    
    // Group and filter relevant signals for the timeline
    // We want a flow: Resolution -> Gate Checks -> Decision
    const flowGroups = [
      { label: 'Sync', signals: ['GATE_CHANNEL_LOCKED', 'GATE_GCD_LOCKED'] },
      { label: 'Target', signals: ['GATE_TARGET_DEAD', 'GATE_PVME_TARGET_SWITCH'] },
      { label: 'Rotation', signals: ['PVME_SEQUENCE_LOCKED', 'ARCHETYPE_FALLBACK'] },
      { label: 'Constraints', signals: ['GATE_RANGE_PASSED', 'GATE_RANGE_FAILED', 'GATE_COOLDOWN_PASSED', 'GATE_COOLDOWN_FAILED', 'GATE_ADRENALINE_PASSED', 'GATE_ADRENALINE_FAILED'] },
      { label: 'Decision', signals: ['INTENT_COMMITTED', 'BUILD_PHASE_TRIGGERED', 'ABILITY_CATEGORY_MISMATCH'] }
    ];

    flowGroups.forEach(group => {
      const groupEvidence = evidence.filter(e => group.signals.includes(e.signal));
      if (groupEvidence.length === 0 && group.label !== 'Decision') return;

      const node = document.createElement('div');
      node.className = 'causal-node';
      
      const isFailed = groupEvidence.some(e => e.signal.includes('FAILED') || e.signal.includes('LOCKED') || e.signal.includes('DEAD') || e.signal.includes('MISMATCH'));
      const isFallback = groupEvidence.some(e => e.signal.includes('FALLBACK') || e.signal.includes('BUILD_PHASE'));
      
      let statusClass = '';
      if (isFailed) statusClass = 'failed';
      else if (isFallback) statusClass = 'fallback';

      const lastSignal = groupEvidence[groupEvidence.length - 1];
      const detailStr = lastSignal ? JSON.stringify(lastSignal.detail).replace(/[{}\"]/g, '') : 'WAITING';
      const maxElapsed = groupEvidence.length > 0 ? Math.max(...groupEvidence.map(e => e.elapsedMs || 0)) : 0;
      const timingStr = maxElapsed > 0 ? `${maxElapsed.toFixed(2)}ms` : '';

      node.innerHTML = `
        <div class="node-dot ${statusClass}"></div>
        <div class="node-label">${group.label}</div>
        <div class="node-timing">${timingStr}</div>
        <div class="node-detail" title="${detailStr}">${detailStr}</div>
        <div class="node-connector"></div>
      `;
      panel.appendChild(node);
    });
  }
}

new SovereignUnifiedHUD();
