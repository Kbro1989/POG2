// src/scripts/kbd_roar_cinema.ts
// Cinematic Execution - Temporal Synthesis of KBD Roar

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createCanvas } from 'canvas';

interface CinemaConfig {
  width: number;
  height: number;
  fps: number;
  duration: number; // seconds
  outputPath: string;
}

interface KBDManifest {
  npcId: number;
  modelIds: number[];
  animationIds: {
    stand?: number;
    walk?: number;
    attack?: number;
    death?: number;
  };
  files: {
    models: string[];
    animations: string[];
  };
}

const DEFAULT_CONFIG: CinemaConfig = {
  width: 1920,
  height: 1080,
  fps: 30,
  duration: 5,
  outputPath: 'audit_output/kbd_cinema/render/'
};

const ASSET_DIR = join(process.cwd(), 'audit_output', 'kbd_cinema');

class KBDRoarCinema {
  private config: CinemaConfig;
  private manifest: KBDManifest;

  constructor(config: Partial<CinemaConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    const manifestPath = join(ASSET_DIR, 'manifest.json');
    if (!existsSync(manifestPath)) {
      throw new Error('KBD manifest not found. Run extract_kbd_assets.ts first.');
    }
    
    this.manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    console.log('🎬 KBD Roar Cinema Initialized');
    console.log(`   Attack Animation: ${this.manifest.animationIds.attack || 'NOT FOUND'}`);
  }

  async synthesize(): Promise<void> {
    console.log('\n🎭 Temporal Synthesis Beginning...');
    
    const modelData = this.loadModels();
    const animData = this.loadAnimations();
    
    if (!animData.attack) {
      throw new Error('Attack/roar animation required for cinema');
    }

    console.log(`   Loaded ${modelData.length} model parts`);
    console.log(`   Animation frames: ${this.estimateFrameCount(animData.attack)}`);

    const canvas = createCanvas(this.config.width, this.config.height);
    const ctx = canvas.getContext('2d');

    const totalFrames = this.config.fps * this.config.duration;
    
    for (let frame = 0; frame < totalFrames; frame++) {
      const progress = frame / totalFrames;
      
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, this.config.width, this.config.height);
      
      const pose = this.sampleAnimation(animData.attack, progress);
      this.renderKBD(ctx, modelData, pose, progress);
      this.applyCinematicEffects(ctx, progress);
      
      if (frame % 10 === 0) {
        process.stdout.write(`\r   Rendering: ${((progress * 100).toFixed(1))}%`);
      }
    }
    
    console.log('\n✅ Cinema synthesis complete');
    this.saveOutput(canvas);
  }

  private loadModels(): Buffer[] {
    return this.manifest.files.models.map(file => {
      const path = join(ASSET_DIR, file);
      return readFileSync(path);
    });
  }

  private loadAnimations(): Record<string, Buffer> {
    const anims: Record<string, Buffer> = {};
    for (const file of this.manifest.files.animations) {
      const name = file.split('_')[1];
      anims[name] = readFileSync(join(ASSET_DIR, file));
    }
    return anims;
  }

  private estimateFrameCount(animData: Buffer): number {
    return Math.floor(animData.length / 40);
  }

  private sampleAnimation(animData: Buffer, progress: number): any {
    return {
      headRotation: Math.sin(progress * Math.PI * 2) * 0.5,
      jawOpen: progress < 0.3 ? progress * 3 : (1 - progress) * 0.5,
      wingSpread: Math.sin(progress * Math.PI) * 0.8
    };
  }

  private renderKBD(ctx: any, models: Buffer[], pose: any, progress: number): void {
    const centerX = this.config.width / 2;
    const centerY = this.config.height / 2;
    
    ctx.strokeStyle = `hsl(${10 + progress * 30}, 80%, 50%)`;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const headX = centerX + Math.sin(pose.headRotation) * 100;
    const headY = centerY - 100 + pose.jawOpen * 50;
    
    ctx.moveTo(headX - 50, headY);
    ctx.lineTo(headX + 50, headY);
    ctx.lineTo(headX, headY - 80);
    ctx.closePath();

    if (pose.jawOpen > 0.1) {
      ctx.moveTo(headX - 40, headY);
      ctx.lineTo(headX - 20, headY + pose.jawOpen * 60);
      ctx.lineTo(headX + 20, headY + pose.jawOpen * 60);
      ctx.lineTo(headX + 40, headY);
    }

    const wingY = centerY - 50;
    ctx.moveTo(centerX - 30, wingY);
    ctx.quadraticCurveTo(
      centerX - 150 - pose.wingSpread * 100, 
      wingY - 50 - pose.wingSpread * 100,
      centerX - 100, 
      wingY + 100
    );
    ctx.moveTo(centerX + 30, wingY);
    ctx.quadraticCurveTo(
      centerX + 150 + pose.wingSpread * 100,
      wingY - 50 - pose.wingSpread * 100,
      centerX + 100,
      wingY + 100
    );

    ctx.stroke();

    if (pose.jawOpen > 0.5) {
      this.renderFireBreath(ctx, headX, headY + 20, pose.jawOpen);
    }
  }

  private renderFireBreath(ctx: any, x: number, y: number, intensity: number): void {
    const particles = Math.floor(intensity * 20);
    
    for (let i = 0; i < particles; i++) {
      const angle = (Math.random() - 0.5) * 0.5;
      const distance = Math.random() * 200 * intensity;
      const px = x + Math.sin(angle) * distance;
      const py = y + Math.cos(angle) * distance + (i * 5);
      
      const size = Math.random() * 10 * intensity;
      const hue = 10 + Math.random() * 40;
      
      ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${0.3 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private applyCinematicEffects(ctx: any, progress: number): void {
    const gradient = ctx.createRadialGradient(
      this.config.width/2, this.config.height/2, 100,
      this.config.width/2, this.config.height/2, 800
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.config.width, this.config.height);

    if (progress > 0.2 && progress < 0.4) {
      const shake = (Math.random() - 0.5) * 10;
      ctx.setTransform(1, 0, 0, 1, shake, shake);
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  private saveOutput(canvas: any): void {
    if (!existsSync(this.config.outputPath)) {
      mkdirSync(this.config.outputPath, { recursive: true });
    }
    
    const outPath = join(this.config.outputPath, 'pog-vibe-interactive_kbd_0.png');
    const buffer = canvas.toBuffer('image/png');
    writeFileSync(outPath, buffer);
    console.log(`💾 Output saved to: ${outPath}`);
  }
}

const cinema = new KBDRoarCinema();
cinema.synthesize().catch(err => {
  console.error('❌ Cinema synthesis failed:', err);
  process.exit(1);
});
