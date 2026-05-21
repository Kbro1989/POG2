/**
 * extract_exe_strings.ts
 *
 * Extracts all printable ASCII and UTF-16 strings > 4 characters from rs2client.exe
 * and searches them for ability names to confirm the user's theory that "rs2client.exe might have the other half".
 */

import * as fs from 'fs';

const EXE_PATH = 'C:/ProgramData/Jagex/launcher/BETA/rs2client.exe';

function extractStrings(buffer: Buffer): string[] {
    const strings: string[] = [];
    let currentAscii = '';
    let currentUtf16 = '';

    for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];

        // ASCII extraction
        if (byte >= 32 && byte <= 126) {
            currentAscii += String.fromCharCode(byte);
        } else {
            if (currentAscii.length > 4) strings.push(currentAscii);
            currentAscii = '';
        }

        // UTF-16 LE extraction (crude but works for basic chars)
        if (i % 2 === 0 && i + 1 < buffer.length) {
            const charCode = buffer.readUInt16LE(i);
            if (charCode >= 32 && charCode <= 126) {
                currentUtf16 += String.fromCharCode(charCode);
            } else {
                if (currentUtf16.length > 4) strings.push(currentUtf16);
                currentUtf16 = '';
            }
        }
    }

    if (currentAscii.length > 4) strings.push(currentAscii);
    if (currentUtf16.length > 4) strings.push(currentUtf16);

    return strings;
}

function main() {
    console.log("Reading rs2client.exe...");
    const buffer = fs.readFileSync(EXE_PATH);
    console.log(`Size: ${buffer.length} bytes`);

    console.log("Extracting strings...");
    const strings = extractStrings(buffer);
    console.log(`Found ${strings.length} potential strings.`);

    // Match ability names
    const abilityNames = [
        'Havoc', 'Dismember', 'Fury', 'Punish', 'Backhand', 'Flurry', 'Hurricane',
        'Slaughter', 'Assault', 'Overpower', 'Meteor Strike', 'Berserk', 'Pulverise',
        'Dragon Breath', 'Sonic Wave', 'Concentrated Blast', 'Impact', 'Combust',
        'Chain', 'Asphyxiate', 'Wild Magic', 'Sunshine', 'Omnipower', 'Runic Charge',
        'Piercing Shot', 'Snipe', 'Ricochet', 'Snap Shot', 'Rapid Fire', 'Bombardment',
        'Touch of Death', 'Soul Sap', 'Finger of Death', 'Death Skulls',
        'Resonance', 'Devotion', 'Debilitate', 'Reflect', 'Barricade', 'Immortality',
        'Surge', 'Escape', 'Slice', 'Sever', 'Smash'
    ];

    const lowerAbilities = abilityNames.map(n => n.toLowerCase());
    const exactMatches = new Set<string>();

    for (const str of strings) {
        const lowerStr = str.toLowerCase();
        for (let i = 0; i < lowerAbilities.length; i++) {
            if (lowerStr === lowerAbilities[i]) {
                exactMatches.add(abilityNames[i]);
            }
            // Check for color-tagged or prefixed versions (e.g., <col=ff0000>Slice</col>)
            else if (lowerStr.includes(lowerAbilities[i]) && str.length < lowerAbilities[i].length + 20) {
                if (!str.includes('.cpp') && !str.includes('.h')) {
                    exactMatches.add(`[Partial] ${abilityNames[i]}: "${str}"`);
                }
            }
        }
    }

    console.log("\nMatches found in rs2client.exe:");
    for (const match of exactMatches) {
        console.log(`  - ${match}`);
    }
}

main();
