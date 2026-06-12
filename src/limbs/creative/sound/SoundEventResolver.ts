
import { CacheSoundSource } from './CacheSoundSource.js';
import { SoundEffectDecoder } from './SoundEffectDecoder.js';
import { SoundTriggerRegistry } from './SoundTriggerRegistry.js';
import { Result, ok } from '../../core/models.js';
import { AudioMetadata } from './SoundEffectDecoder.js';

export interface SoundEvent {
    type: 'COMBAT' | 'SKILL' | 'OBJECT' | 'AMBIENT';
    entityId?: number;
    trigger?: string;
    context: any;
}

/**
 * SoundEventResolver
 * The high-level orchestration layer that converts world events into raw audio buffers.
 */
export class SoundEventResolver {
    private soundSource: CacheSoundSource;
    private registry: SoundTriggerRegistry;

    constructor(cacheDir: string) {
        this.soundSource = new CacheSoundSource(cacheDir);
        this.registry = new SoundTriggerRegistry(cacheDir);
    }

    /**
     * resolve - Transforms a game event into a playable audio buffer.
     */
    public async resolve(event: SoundEvent): Promise<Result<AudioMetadata | null>> {
        let soundId: number | null = null;

        switch (event.type) {
            case 'COMBAT':
                if (event.entityId) {
                    soundId = await this.registry.resolveNpcSound(event.entityId, 'attack');
                }
                break;
            case 'OBJECT':
                if (event.entityId) {
                    soundId = await this.registry.resolveObjectSound(event.entityId);
                }
                break;
            default:
                // Ambient and Skill sounds would be mapped here
                break;
        }

        if (soundId === null) return ok(null);

        const buffer = await this.soundSource.getSoundBuffer(soundId);
        if (!buffer) return { ok: false, error: new Error(`Sound ID ${soundId} not found in cache`) };

        return ok(SoundEffectDecoder.decode(buffer));
    }

    public close() {
        this.soundSource.close();
        this.registry.close();
    }
}
