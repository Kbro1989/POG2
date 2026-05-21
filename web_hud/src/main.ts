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

  constructor() {
    this.logElement = document.getElementById('log')!;
    this.barElement = document.getElementById('action-bar')!;
    this.fillElement = document.getElementById('adrenaline-fill')!;
    
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
    
    pcs.addPoints(count, (particle, i) => {
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
      if (data.type === 'STATE_UPDATE') {
        this.setAdrenaline(data.adrenaline);
        const arch = document.getElementById('archetype-name');
        if (arch) arch.innerText = data.activeArchetype.toUpperCase();
        if (data.lastAction) {
          this.highlightAbility(data.lastAction);
        }
        if (data.learningTrace) {
          this.renderCausalChain(data.learningTrace);
        }
      } else if (data.type === 'LOG_UPDATE') {
        this.addLog(data.message, data.level);
      } else if (data.type === 'HITSPLAT') {
        this.showHitsplat(data.value, data.kind);
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

  private renderCausalChain(evidence: any[]) {
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
