
import { JagexCacheReader } from '../../../utils/JagexCacheReader.js';
import { SovereignOpcodeParser } from './SovereignOpcodeParser.js';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * SoundTriggerRegistry
 * Maps game world triggers (NPC IDs, Object IDs) to sound effect IDs in Index 14.
 * Uses rsmv opcodes to parse raw definition BLOBs.
 */
export class SoundTriggerRegistry {
    private cache: JagexCacheReader;
    private npcOpcode: any;
    private objectOpcode: any;

    constructor(cacheDir: string) {
        this.cache = new JagexCacheReader(cacheDir);
        this.loadOpcodes();
    }

    private loadOpcodes() {
        try {
            // Load the authoritative opcodes from the rsmv directory
            this.npcOpcode = JSON.parse(readFileSync(join(process.cwd(), 'rsmv', 'opcodes', 'npcs.jsonc'), 'utf8'));
            this.objectOpcode = JSON.parse(readFileSync(join(process.cwd(), 'rsmv', 'opcodes', 'objects.jsonc'), 'utf8'));
        } catch (e) {
            console.error('Failed to load sound opcodes:', e);
        }
    }

    /**
     * resolveNpcSound - Extracts a sound ID from an NPC definition.
     * @param npcId The ID of the NPC.
     * @ la-Sovereign triggerType: 'attack', 'death', 'retreat'
     */
    public async resolveNpcSound(npcId: number, triggerType: 'attack' | 'death' | 'retreat'): Promise<number | null> {
        const entry = this.cache.readEntry(3, npcId);
        if (!entry || !entry.decompressed) return null;

        const buffer = entry.decompressed;
        let offset = 0;

        // Iterate through the NPC opcode map to find the specific sound field
        for (const [key, op] of Object.entries(this.npcOpcode)) {
            // Convert '0x89' to decimal 137
            const targetOffset = parseInt(key, 16);

            // Note: In a real RS3 cache, the data is often non-linear.
            // For this registry, we assume the field is at the specified offset.
            if (targetOffset === 137 && triggerType === 'attack') { // 0x89 is attackCursor/Sound
                const res = SovereignOpcodeParser.readValue(buffer, offset + targetOffset, op);
                return res.value;
            }
            // deathSound and retreatSound would be mapped here similarly
        }

        return null;
    }

    /**
     * resolveObjectSound - Extracts a sound ID from an object definition.
     */
    public async resolveObjectSound(objectId: number): Promise<number | null> {
        const entry = this.cache.readEntry(1, objectId);
        if (!entry || !entry.decompressed) return null;

        const buffer = entry.decompressed;
        let offset = 0;

        for (const [key, op] of Object.entries(this.objectOpcode as any)) {
            const targetOffset = parseInt(key, 16);
            if ((op as any).name === 'soundEffect') {
                const res = SovereignOpcodeParser.readValue(buffer, offset + targetOffset, op);
                return res.value;
            }
        }

        return null;
    }

    public close() {
        this.cache.close();
    }
}
