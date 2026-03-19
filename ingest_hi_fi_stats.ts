import { EntityLimb } from './src/limbs/technical/EntityLimb.js';
import chalk from 'chalk';

const RAW_LEVELS = `
Thieving	199,043,510	126
Slayer	113,663,155	120
Herblore	111,950,604	120
Defence	104,787,686	120
Mining	96,740,330	119
Invention	91,656,343	123
Constitution	86,417,357	118
Archaeology	67,625,431	115
Farming	62,136,481	114
Magic	53,237,273	113
Dungeoneering	43,993,570	111
Necromancy	40,312,914	110
Attack	36,528,354	109
Strength	36,223,698	109
Smithing	33,134,193	108
Runecrafting	32,971,387	108
Fishing	29,135,813	107
Woodcutting	23,069,211	104
Hunter	23,014,923	104
Ranged	21,004,950	103
Divination	20,427,725	103
Cooking	18,706,701	102
Agility	18,412,700	102
Firemaking	18,258,152	102
Crafting	17,812,790	101
Prayer	17,425,390	101
Construction	17,330,773	101
Fletching	15,856,453	100
Summoning	14,250,978	99
`;

async function ingestHighFidelityStats() {
    const limb = new EntityLimb();
    const id = 'pog2:player';

    console.log(chalk.bold.cyan('\n--- High-Fidelity Statistical Ingestion ---'));

    const skills: Record<string, any> = {};
    const lines = RAW_LEVELS.trim().split('\n');
    
    for (const line of lines) {
        const parts = line.split('\t');
        if (parts.length >= 3) {
            const name = parts[0].toLowerCase();
            const xp = parseInt(parts[1].replace(/,/g, ''));
            const level = parseInt(parts[2]);
            skills[name] = { level, xp };
        }
    }

    const highFidelityData = {
        name: 'Pick Of Gods',
        totalskill: 3088,
        virtualTotal: 3173,
        totalxp: 1465128845,
        combatlevel: 147,
        skills,
        timestamp: Date.now(),
        source: 'User Manual Override (High Fidelity)'
    };

    console.log(chalk.yellow(`Syncing ${Object.keys(skills).length} Master skills...`));

    const res = await limb.updatePlayerIdentity(id, { 
        name: 'Pick Of Gods', 
        stats: highFidelityData 
    });

    if (res.ok) {
        console.log(chalk.green('SUCCESS: High-Fidelity core anchoring complete.'));
        
        // Add a specialized 'milestone' memory for 126 Thieving and 120 Slayer
        await limb.addMemory(id, {
            type: 'milestone',
            content: 'IDENTITY REINFORCED: Virtual Master Cape status detected (126 Thieving, 120 Slayer/Herblore/Defence). POG2 behavioral vectors refined for max-tier efficiency.',
            weight: 3.0
        });

        const state = await limb.getEntityState(id);
        if (state.ok) {
            console.log(chalk.blue('Refined Vibe State:'), JSON.stringify(state.value.vibe, null, 2));
        }
    } else {
        console.error(chalk.red('Ingestion failed:'), res.error?.message);
    }

    console.log(chalk.bold.cyan('--- Ingestion Cycle Complete ---'));
}

ingestHighFidelityStats().catch(console.error);
