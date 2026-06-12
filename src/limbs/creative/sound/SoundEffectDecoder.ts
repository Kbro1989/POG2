
import { Buffer } from 'buffer';

export interface AudioMetadata {
    sampleRate: number;
    channels: number;
    duration: number;
    format: 'WAV' | 'OGG' | 'UNKNOWN';
    rawBuffer: Buffer;
}

/**
 * SoundEffectDecoder
 * Probes raw buffers from the cache to determine audio format and extract playback metadata.
 */
export class SoundEffectDecoder {
    /**
     * decode - Analyzes the raw bytes to identify the audio container.
     */
    public static decode(buffer: Buffer): AudioMetadata {
        // 1. Check for WAV (RIFF)
        if (buffer.length > 4 && buffer.toString('utf8', 0, 4) === 'RIFF') {
            return this.parseWav(buffer);
        }

        // 2. Check for OGG (OggS)
        if (buffer.length > 4 && buffer.toString('utf8', 0, 4) === 'OggS') {
            return this.parseOgg(buffer);
        }

        // 3. Fallback: Treat as raw PCM or Unknown
        return {
            sampleRate: 44100,
            channels: 1,
            duration: buffer.length / (44100 * 2), // Heuristic
            format: 'UNKNOWN',
            rawBuffer: buffer
        };
    }

    private static parseWav(buffer: Buffer): AudioMetadata {
        // Basic WAV header parsing:
        // Byte 22: NumChannels (2 bytes)
        // Byte 24: SampleRate (4 bytes)
        const channels = buffer.readUInt16LE(22);
        const sampleRate = buffer.readUInt32LE(24);
        const dataSize = buffer.readUInt32LE(40);
        const duration = dataSize / (sampleRate * channels * 2);

        return {
            sampleRate,
            channels,
            duration,
            format: 'WAV',
            rawBuffer: buffer
        };
    }

    private static parseOgg(buffer: Buffer): AudioMetadata {
        // Ogg is complex (Vorbis); for the registry, we primarily care that it IS Ogg.
        // We return a standard high-res profile for the synthesis engine.
        return {
            sampleRate: 44100,
            channels: 2,
            duration: -1, // Duration requires full stream parse
            format: 'OGG',
            rawBuffer: buffer
        };
    }
}
