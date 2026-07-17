import { createLogger } from '../../utils/logger.js';
import { Mesh, Vector3, StandardMaterial, DynamicTexture, Scene, Color3 } from '@babylonjs/core';
import { AvatarRenderLimb } from './AvatarRenderLimb.js';
import { RenderEmotionParameters } from './OracleEmotionAdapter.js';

const logger = createLogger('GhostSplatLimb');

export interface SplatEvent {
    type: 'damage' | 'xp' | 'block' | 'heal' | 'poison' | 'crit' | 'emotion_aura';
    value?: number;
    skillId?: number;
    position?: Vector3;
    color?: string;
    duration?: number;
    emotion?: RenderEmotionParameters;
}

export class GhostSplatLimb {
    private scene: Scene;
    private splats: Map<string, Mesh> = new Map();
    private splatId = 0;
    private emotion: RenderEmotionParameters | null = null;

    constructor(private renderer: any) {
        this.scene = renderer.scene || renderer;
    }

    setEmotion(emotion: RenderEmotionParameters | null): void {
        this.emotion = emotion;
    }

    emit(event: SplatEvent): void {
        const id = `splat_${++this.splatId}`;
        const spawnPos = event.position || this.getAvatarHeadPosition();

        switch (event.type) {
            case 'damage':
                this.createDamageSplat(id, event.value || 0, spawnPos, event.color || '#ff0000');
                break;
            case 'xp':
                this.createXpSplat(id, event.value || 0, event.skillId || 0, spawnPos);
                break;
            case 'block':
                this.createBlockSplat(id, spawnPos);
                break;
            case 'heal':
                this.createHealSplat(id, event.value || 0, spawnPos);
                break;
            case 'poison':
                this.createPoisonSplat(id, event.value || 0, spawnPos);
                break;
            case 'crit':
                this.createCritSplat(id, event.value || 0, spawnPos);
                break;
            case 'emotion_aura':
                this.createEmotionAura(id, spawnPos, event.emotion);
                break;
        }

        logger.debug({ id, type: event.type, value: event.value }, 'Splat emitted');
    }

    private createEmotionAura(id: string, pos: Vector3, emotion: RenderEmotionParameters | undefined): void {
        const params = emotion ?? this.emotion;
        if (!params) return;

        const alpha = 0.6 + params.resolution * 0.4;
        const pulseRate = 0.02 + params.auraPulse * 0.04;
        const jitter = params.tension * 12;
        const size = 18 + params.tension * 14;

        const plane = Mesh.CreatePlane(id, size, this.scene);
        const jitterX = (Math.random() - 0.5) * jitter;
        const jitterY = (Math.random() - 0.5) * jitter;
        const jitterZ = (Math.random() - 0.5) * jitter;
        plane.position = new Vector3(pos.x + jitterX, pos.y + jitterY, pos.z + jitterZ);
        plane.billboardMode = Mesh.BILLBOARDMODE_ALL;

        const texture = new DynamicTexture(`tex_${id}`, { width: 256, height: 256 }, this.scene, false);
        const ctx = texture.getContext() as any;
        ctx.clearRect(0, 0, 256, 256);

        const color = params.emissiveColor;
        const gradient = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
        gradient.addColorStop(0, `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${alpha})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        texture.update();

        const mat = new StandardMaterial(`mat_${id}`, this.scene);
        mat.diffuseTexture = texture;
        mat.emissiveColor = new Color3(color.r, color.g, color.b);
        mat.alpha = alpha;
        mat.disableLighting = true;
        mat.useAlphaFromDiffuseTexture = true;
        texture.hasAlpha = true;
        plane.material = mat;

        let phase = 0;
        const animate = () => {
            if (!this.splats.has(id)) return;
            phase += pulseRate;
            const scale = 1 + Math.sin(phase) * (0.08 + params.auraJitter * 0.12);
            plane.scaling = new Vector3(scale, scale, scale);
            mat.alpha = alpha - Math.max(0, phase * 0.02);
            if (mat.alpha <= 0) {
                plane.dispose();
                this.splats.delete(id);
            } else {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
        this.splats.set(id, plane);
    }

    private createTextPlane(id: string, text: string, color: string, pos: Vector3, font: string = 'bold 64px Verdana', scale: number = 10): Mesh {
        const plane = Mesh.CreatePlane(id, scale, this.scene);
        const jitterX = (Math.random() - 0.5) * 10;
        const jitterY = (Math.random() - 0.5) * 10;
        plane.position = new Vector3(pos.x + jitterX, pos.y + jitterY, pos.z);
        plane.billboardMode = Mesh.BILLBOARDMODE_ALL;

        const texture = new DynamicTexture(`tex_${id}`, { width: 256, height: 128 }, this.scene, false);
        const ctx = texture.getContext() as any;
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(text, 128, 64);
        ctx.fillText(text, 128, 64);
        texture.update();

        const mat = new StandardMaterial(`mat_${id}`, this.scene);
        mat.diffuseTexture = texture;
        mat.emissiveColor = Color3.FromHexString(color);
        mat.alpha = 1.0;
        mat.disableLighting = true;
        mat.useAlphaFromDiffuseTexture = true;
        texture.hasAlpha = true;
        plane.material = mat;

        return plane;
    }

    private animateSplat(id: string, plane: Mesh, mat: StandardMaterial, dy: number, fadeRate: number) {
        const animate = () => {
            if (!this.splats.has(id)) return;
            plane.position.y += dy;
            mat.alpha -= fadeRate;
            if (mat.alpha <= 0) {
                plane.dispose();
                this.splats.delete(id);
            } else {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
        this.splats.set(id, plane);
    }

    private createDamageSplat(id: string, value: number, pos: Vector3, color: string): void {
        const plane = this.createTextPlane(id, value.toString(), color, pos);
        this.animateSplat(id, plane, plane.material as StandardMaterial, 0.5, 0.015);
    }

    private createXpSplat(id: string, value: number, skillId: number, pos: Vector3): void {
        const skillColors: Record<number, string> = {
            0: '#ff0000',
            1: '#00ff00',
            2: '#0000ff',
        };
        const color = skillColors[skillId] || '#ffffff';
        const plane = this.createTextPlane(id, `+${value} XP`, color, pos, 'bold 48px Verdana');

        let t = 0;
        const mat = plane.material as StandardMaterial;
        const startX = plane.position.x;
        const startY = plane.position.y;

        const animate = () => {
            if (!this.splats.has(id)) return;
            t += 0.05;
            plane.position.x = startX + Math.sin(t) * 10;
            plane.position.y = startY + t * 5;
            mat.alpha -= 0.01;
            if (mat.alpha <= 0) {
                plane.dispose();
                this.splats.delete(id);
            } else {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
        this.splats.set(id, plane);
    }

    private createBlockSplat(id: string, pos: Vector3): void {
        const plane = this.createTextPlane(id, 'BLOCK', '#aaaaaa', pos);
        this.animateSplat(id, plane, plane.material as StandardMaterial, 0.2, 0.02);
    }

    private createHealSplat(id: string, value: number, pos: Vector3): void {
        const plane = this.createTextPlane(id, `+${value}`, '#00ff00', pos);
        this.animateSplat(id, plane, plane.material as StandardMaterial, 0.8, 0.01);
    }

    private createPoisonSplat(id: string, value: number, pos: Vector3): void {
        const plane = this.createTextPlane(id, value.toString(), '#00cc00', pos);
        this.animateSplat(id, plane, plane.material as StandardMaterial, -0.3, 0.01);
    }

    private createCritSplat(id: string, value: number, pos: Vector3): void {
        const plane = this.createTextPlane(id, value.toString(), '#ffaa00', pos, 'bold 84px Verdana', 15);
        this.animateSplat(id, plane, plane.material as StandardMaterial, 0.6, 0.01);
    }

    private getAvatarHeadPosition(): Vector3 {
        return new Vector3(0, 100, 0);
    }

    clearAll(): void {
        for (const [id, mesh] of this.splats) {
            mesh.dispose();
        }
        this.splats.clear();
    }
}
