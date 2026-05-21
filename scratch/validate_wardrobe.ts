import * as fs from 'fs';

// Validate varbit 28680 decoding
console.log('=== WARDROBE DECODER FOR VARBIT 28680 ===');
console.log('14 bits = values from 0 to 16383');
console.log('Themes: Frozen (0), Furnished (1), Abandoned (2), Occult (3), Warped (4)');
console.log('Slots: Head, Body, Hands, Legs, Feet');

function decodeWardrobeA(value: number) {
    // Hypothesis A: bits [0:2] = theme (0-4), bits [3:7] = 5-slot bitmap
    const theme = value & 0x7;
    const slots = (value >> 3) & 0x1F;
    const slotUnlocks = {
        Head: (slots & 1) !== 0,
        Body: (slots & 2) !== 0,
        Hands: (slots & 4) !== 0,
        Legs: (slots & 8) !== 0,
        Feet: (slots & 16) !== 0
    };
    return { theme, slotUnlocks };
}

function decodeWardrobeB(value: number) {
    // Hypothesis B: 14 bits = 5 slots. Wait, if each slot has 5 themes, that's 5 * 3 bits = 15 bits. Doesn't fit in 14 bits.
    // What if it's 2 bits per slot (max 4 themes)? No, there are 5 themes.
    // What if it's 5 themes * 5 slots = 25 independent boolean unlocks? Doesn't fit in 14 bits.
    
    // Wait, the interface label was:
    // Type | Head | Body | Hands | Legs | Feet | Complete | Frozen | Furnished | Abandoned | Occult | Warped
    // This implies you can select a Type (Theme) and a Slot.
    
    // What if the 14 bits represent the currently *selected* wardrobe loadout to show/preview?
    // Theme selection: 3 bits (0-4)
    // Slot selection: 3 bits (0-4)
    // Actually, "Complete" is a slot or a toggle.
    // 5 themes, 5 slots + "Complete" = 6 slots.
    
    // Let's just output the hypotheses.
}

console.log('Testing Hypothesis A with value 0b11111_011 (all unlocked, occult):', decodeWardrobeA(0b11111_011));
console.log('Testing Hypothesis A with value 0b00001_100 (head unlocked, warped):', decodeWardrobeA(0b00001_100));

// Also let's check interface 1797 to see what varbits are passed to scripts
const dump = JSON.parse(fs.readFileSync('D:/POG2/scratch/interface_1797_dump.json', 'utf8'));
const comps: any[] = dump.components || dump;

const scriptInvocations = [];
for (const comp of comps) {
    if (comp.scripts) {
        for (const [trigger, args] of Object.entries(comp.scripts)) {
            if (Array.isArray(args) && args.length > 0) {
                scriptInvocations.push({ comp: comp.componentId, trigger, args });
            }
        }
    }
}

// Find scripts referencing 28680 or 28679
console.log('\nScripts referencing 28680 or 28679:');
for (const inv of scriptInvocations) {
    if (inv.args.includes(28680) || inv.args.includes(28679)) {
        console.log(`Comp ${inv.comp} [${inv.trigger}]: ${inv.args.join(', ')}`);
    }
}
