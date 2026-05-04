import { Direction } from '../core/models.js';

/**
 * DirectionalRegistry - Canonical mapping of object types and rotations 
 * to directional blocking bitmasks.
 */

export const DIRECTION = {
    NORTH: 'north',
    EAST: 'east',
    SOUTH: 'south',
    WEST: 'west',
} as const;

// Quaternary mapping of (Type_Rotation) -> Blocked Directions
// Verified against Barrows Crypts and Lumbridge Gates substrate.
export const OBJECT_BLOCKING_MAP: Record<string, Direction[]> = {
    // TYPE 0: Straight Walls
    // In NXT, walls often block two directions if they are corner-aligned
    '0_0': ['north', 'east'],      // Wall (0Â°): blocks N/E (verified: Barrows sarcophagus east wall)
    '0_1': ['east', 'south'],      // Wall (90Â°): blocks E/S
    '0_2': ['south', 'west'],      // Wall (180Â°): blocks S/W
    '0_3': ['west', 'north'],      // Wall (270Â°): blocks W/N
    
    // TYPE 2: Corner Walls / Windows
    '2_0': ['north', 'east'],
    '2_1': ['east', 'south'],
    '2_2': ['south', 'west'],
    '2_3': ['west', 'north'],

    // TYPE 9: Diagonal Walls
    '9_0': ['north', 'east'],
    '9_1': ['east', 'south'],
    '9_2': ['south', 'west'],
    '9_3': ['west', 'north'],

    // TYPE 10-11: Solid Objects / Large Rectangles
    // Rotation ignored for purely solid objects that block the entire tile
    '10_0': ['north', 'east', 'south', 'west'],
    '10_1': ['north', 'east', 'south', 'west'],
    '10_2': ['north', 'east', 'south', 'west'],
    '10_3': ['north', 'east', 'south', 'west'],
    '11_0': ['north', 'east', 'south', 'west'],
    '11_1': ['north', 'east', 'south', 'west'],
    '11_2': ['north', 'east', 'south', 'west'],
    '11_3': ['north', 'east', 'south', 'west'],

    // TYPE 22: Floor Decorations (Non-blocking by default)
    '22_0': [],
    '22_1': [],
    '22_2': [],
    '22_3': [],
};

/**
 * getBlockedDirections - Maps object type and rotation to list of blocked directions.
 * @param type RS Object Type (0-3 for walls, 10-11 for solid)
 * @param rotation 0-3
 * @param width Optional width of the object for multi-tile blocking logic
 */
export function getBlockedDirections(type: number, rotation: number, width: number = 1): Direction[] {
    // If it's a solid object (type 10 or 11)
    if (type === 10 || type === 11) {
        // Multi-tile objects usually block all directions on their tiles
        return ['north', 'south', 'east', 'west'];
    }

    const key = `${type}_${rotation}`;
    const blocked = OBJECT_BLOCKING_MAP[key];

    if (!blocked) {
        // Fallback: If it's a solid type we haven't explicitely mapped, assume full block
        if (type >= 10 && type <= 11) {
            return ['north', 'east', 'south', 'west'];
        }
        
        // Log warning for unknowns (will be captured by clinical auditing)
        console.warn(`[SOVEREIGN] Unknown object blocking: type=${type}, rot=${rotation}. Assuming passable.`);
        return [];
    }

    return blocked;
}
