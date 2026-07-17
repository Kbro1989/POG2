import { join } from 'path';
import { createLogger } from '../../utils/logger.js';
import { Engine, Scene, Mesh, VertexData, StandardMaterial, Color3, ArcRotateCamera, Vector3, HemisphericLight, PointsCloudSystem, Color4 } from '@babylonjs/core';
import { AvatarStateLimb } from './AvatarStateLimb.js';
import { resolveSovereignPath } from '../../utils/SovereignPathResolver.js';
import { RenderEmotionParameters, deriveRenderParameters, OracleProvenance } from './OracleEmotionAdapter.js';

const logger = createLogger('AvatarRenderLimb');

export class AvatarRenderLimb {
    private engine: Engine | null = null;
    private scene: Scene | null = null;
    private pcs: PointsCloudSystem | null = null;
    private state: AvatarStateLimb;
    private emotion: RenderEmotionParameters | null = null;
    private modelId: number | null = null;

    constructor(private canvas: HTMLCanvasElement) {
        this.state = AvatarStateLimb.getInstance();
    }

    async initialize(): Promise<void> {
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        this.scene.clearColor = new Color4(0.05, 0.05, 0.05, 1);

        const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 200, Vector3.Zero(), this.scene);
        camera.attachControl(this.canvas, true);
        camera.wheelPrecision = 10;

        new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);

        logger.info('AvatarRenderLimb initialized');
    }

    async loadKitModel(modelId: number): Promise<void> {
        this.modelId = modelId;
        const meshData = await this.loadMeshJson(modelId);
        if (!meshData) {
            logger.error({ modelId }, 'Kit model not found');
            return;
        }

        if (this.pcs) {
            this.pcs.dispose();
        }

        this.pcs = new PointsCloudSystem(`pcs_${modelId}`, 2, this.scene!);

        const skinRgb = 12104087;
        const color = this.unpackRgb(skinRgb);

        const positions = meshData.positions;
        const pointCount = positions.length / 3;

        this.pcs.addPoints(pointCount, (particle, i) => {
            particle.position = new Vector3(
                positions[i * 3],
                positions[i * 3 + 1],
                positions[i * 3 + 2],
            );
            particle.color = new Color4(color.r, color.g, color.b, 1);
        });

        await this.pcs.buildMeshAsync();

        if (this.scene?.activeCamera && this.pcs.mesh) {
            (this.scene.activeCamera as ArcRotateCamera).target = this.pcs.mesh.getBoundingInfo().boundingBox.center;
        }

        this.applyEmotion();

        logger.info({ modelId, vertices: pointCount }, 'Kit point-cloud topology rendered');
    }

    setOracleProvenance(provenance: OracleProvenance): void {
        this.emotion = deriveRenderParameters(provenance);
        this.applyEmotion();
    }

    private applyEmotion(): void {
        if (!this.pcs || !this.pcs.mesh || !this.emotion) {
            return;
        }

        const { baseColor, pointBrightnessBias, emissiveColor } = this.emotion;
        const mesh = this.pcs.mesh;
        const material = mesh.material as any;
        const colorField = material?.color ?? material?.diffuseColor;

        if (colorField) {
            const rgb = baseColor.toColor3();
            if (colorField.r !== undefined) {
                colorField.copyFrom(rgb);
            }
        }

        this.updatePointBrightness(pointBrightnessBias);
    }

    private updatePointBrightness(bias: { past: number; present: number; future: number }): void {
        if (!this.pcs) return;
        const temporalBias = bias[this.emotion?.temporal ?? 'future'] ?? 1;
        // placeholder for future per-point temporal weighting once vertex metadata exists
        void temporalBias;
    }

    private unpackRgb(packed: number): Color3 {
        const r = ((packed >> 16) & 0xFF) / 255;
        const g = ((packed >> 8) & 0xFF) / 255;
        const b = (packed & 0xFF) / 255;
        return new Color3(r, g, b);
    }

    private async loadMeshJson(modelId: number): Promise<any | null> {
        try {
            if (typeof window !== 'undefined' && typeof fetch === 'function') {
                const res = await fetch(`/models/kit_${modelId}.json`);
                return await res.json();
            } else {
                const fs = await import('fs/promises');
                const path = join(resolveSovereignPath('cache_pedagogy/models'), `kit_${modelId}.json`);
                const data = await fs.readFile(path, 'utf8');
                return JSON.parse(data);
            }
        } catch {
            return null;
        }
    }

    renderLoop(): void {
        this.engine?.runRenderLoop(() => {
            this.scene?.render();
        });
    }

    dispose(): void {
        this.scene?.dispose();
        this.engine?.dispose();
    }
}
