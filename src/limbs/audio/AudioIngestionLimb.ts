import { createLogger } from '../../utils/logger.js';
import { TrainingCollector } from '../../utils/TrainingCollector.js';
import { LearningEvent, LearningFidelity } from '../../core/models.js';
import { OmniTrainingBridge } from '../../core/OmniTrainingBridge.js';

const logger = createLogger('AudioIngestionLimb');

/**
 * AudioIngestionLimb
 * 
 * Persistent ingestor for raw binary audio assets. 
 * Converts raw cache buffers into structured LearningEvents with
 * spatial, pedagogical, and behavioral metadata.
 */
export class AudioIngestionLimb implements OmniTrainingBridge {
    private static instance: AudioIngestionLimb;

    private constructor() {}

    public static getInstance(): AudioIngestionLimb {
        if (!AudioIngestionLimb.instance) {
            AudioIngestionLimb.instance = new AudioIngestionLimb();
        }
        return AudioIngestionLimb.instance;
    }

    public getDomainNamespace(): string {
        return 'audio_substrate';
    }

    /**
     * distill — Converts raw audio asset extraction event into a standardized LearningEvent.
     */
    public distill(event: { major: number, minor: number, buffer: Buffer, metadata: any }): LearningEvent {
        return {
            tick: Date.now(),
            timestamp: Date.now(),
            fidelity: LearningFidelity.PEDAGOGY,
            resolution: {
                assetType: 'audio_wav',
                major: event.major,
                minor: event.minor,
                length: event.buffer.length,
                ...event.metadata
            },
            tags: ['[VERIFIED]', 'AUDIO_EXTRACTION', `Major:${event.major}`]
        };
    }

    /**
     * ingest — Entry point for raw buffers from the cache scanner.
     */
    public async ingest(major: number, minor: number, buffer: Buffer, metadata: any): Promise<void> {
        logger.info({ major, minor }, 'Ingesting audio asset...');
        const event = this.distill({ major, minor, buffer, metadata });
        await TrainingCollector.getInstance().recordLearningEvent(event);
        logger.info({ major, minor }, 'Audio asset successfully ingested into training substrate.');
    }
}
