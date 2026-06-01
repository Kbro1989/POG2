import { BitStream } from '../../../utils/BitStream.js';
import { type Coord } from '../../../core/models.js';

/**
 * MovementBlockDecoder - Sub-byte Kinematic Interpreter
 * Decodes the bitstream movement data for Protocol 947.
 */
export class MovementBlockDecoder {
    /**
     * decodeLocalPlayer - Decodes bitstream for the avatar's own movement.
     */
    public decodeLocalPlayer(stream: BitStream, current: Coord): Coord {
        const updateRequired = stream.readBits(1);
        if (updateRequired === 0) return current;

        const movementType = stream.readBits(2);
        
        switch (movementType) {
            case 0: // No movement
                return current;
            case 1: // Walking (1 step)
                const walkDir = stream.readBits(3);
                return this.applyDirection(current, walkDir, 1);
            case 2: // Running (2 steps)
                const runDir = stream.readBits(4);
                return this.applyDirection(current, runDir, 2);
            case 3: // Teleport
                const plane = stream.readBits(2);
                const dx = stream.readBits(7);
                const dy = stream.readBits(7);
                const jump = stream.readBits(1);
                return { x: dx, y: dy, plane }; // Usually absolute in teleport
            default:
                return current;
        }
    }

    private applyDirection(coord: Coord, dir: number, steps: number): Coord {
        const delta = { x: 0, y: 0 };
        // Standard RS Directional Map
        switch (dir) {
            case 0: delta.y++; delta.x--; break; // NW
            case 1: delta.y++; break;           // N
            case 2: delta.y++; delta.x++; break; // NE
            case 3: delta.x--; break;           // W
            case 4: delta.x++; break;           // E
            case 5: delta.y--; delta.x--; break; // SW
            case 6: delta.y--; break;           // S
            case 7: delta.y--; delta.x++; break; // SE
        }
        return {
            x: coord.x + (delta.x * steps),
            y: coord.y + (delta.y * steps),
            plane: coord.plane
        };
    }
}

