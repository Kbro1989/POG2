
import { WikiReconciliationLimb } from '../limbs/spatial/WikiReconciliationLimb.js';
import { resolveSovereignPath } from '../utils/SovereignPathResolver.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createLogger } from '../utils/logger.js';
import { type Result } from '../core/models.js';

const logger = createLogger('PopulatePedagogy');

async function run() {
    logger.info('Starting Pedagogy Logic population...');

    const limb = new WikiReconciliationLimb();
    const logicDir = resolveSovereignPath('memory/pedagogy/logic');
    
    if (!existsSync(logicDir)) {
        mkdirSync(logicDir, { recursive: true });
    }

    // 1. Reconcile Quests
    logger.info('Reconciling Quests...');
    const questManifestPath = join(logicDir, 'quest_manifest.json');
    // Ensure the file exists with a basic structure if it doesn't
    if (!existsSync(questManifestPath) || (await import('fs')).readFileSync(questManifestPath, 'utf8').length < 5) {
        writeFileSync(questManifestPath, JSON.stringify({ quests: [], totalExported: 0 }, null, 2));
    }
    
    const questRes = await limb.reconcileQuestTaxonomy(questManifestPath);
    if (questRes.ok) {
        logger.info('Quest manifest populated.');
    } else {
        logger.error({ error: questRes.error }, 'Quest reconciliation failed.');
    }

    // 2. Populate Skills (Simplified for now, as SkillId enum is in models.ts)
    logger.info('Populating Skills...');
    const skillManifestPath = join(logicDir, 'skill_manifest.json');
    const skills = [
        { id: 1, name: 'Attack' }, { id: 2, name: 'Strength' }, { id: 3, name: 'Ranged' },
        { id: 4, name: 'Magic' }, { id: 5, name: 'Defence' }, { id: 6, name: 'Constitution' },
        { id: 7, name: 'Prayer' }, { id: 8, name: 'Agility' }, { id: 9, name: 'Herblore' },
        { id: 10, name: 'Thieving' }, { id: 11, name: 'Crafting' }, { id: 12, name: 'Runecrafting' },
        { id: 13, name: 'Mining' }, { id: 14, name: 'Smithing' }, { id: 15, name: 'Fishing' },
        { id: 16, name: 'Cooking' }, { id: 17, name: 'Firemaking' }, { id: 18, name: 'Woodcutting' },
        { id: 19, name: 'Fletching' }, { id: 20, name: 'Slayer' }, { id: 21, name: 'Farming' },
        { id: 22, name: 'Construction' }, { id: 23, name: 'Hunter' }, { id: 24, name: 'Summoning' },
        { id: 25, name: 'Dungeoneering' }, { id: 26, name: 'Divination' }, { id: 27, name: 'Invention' },
        { id: 28, name: 'Archaeology' }, { id: 29, name: 'Necromancy' }
    ];
    
    const skillManifest = {
        version: "1.1.0",
        total_skills: skills.length,
        skills: skills,
        categories: {
            combat: ['Attack', 'Strength', 'Ranged', 'Magic', 'Defence', 'Constitution', 'Prayer', 'Summoning', 'Necromancy'],
            gathering: ['Mining', 'Fishing', 'Woodcutting', 'Farming', 'Hunter', 'Divination', 'Archaeology'],
            artisan: ['Herblore', 'Crafting', 'Runecrafting', 'Smithing', 'Cooking', 'Firemaking', 'Fletching', 'Construction', 'Invention'],
            support: ['Agility', 'Thieving', 'Slayer', 'Dungeoneering']
        }
    };
    
    writeFileSync(skillManifestPath, JSON.stringify(skillManifest, null, 2));
    logger.info('Skill manifest populated.');

    // 3. Populate Abilities (Combat Modernisation March 2026)
    logger.info('Populating Abilities...');
    const abilityRegistryPath = resolveSovereignPath('memory/pedagogy/sovereign_ability_registry.json');
    const abilityRes = await limb.fetchAbilitiesData();
    if (abilityRes.ok) {
        // Fetch specific lists for each style
        const styles = ['Melee', 'Ranged', 'Magic', 'Necromancy', 'Defence'] as const;
        const styleData: Record<string, string[]> = {};
        
        for (const style of styles) {
            const res = await limb.fetchAbilitiesByStyle(style);
            if (res.ok) {
                styleData[style] = res.value;
            }
        }
        
        const fullRegistry = {
            ...abilityRes.value,
            styles: styleData,
            updatedAt: new Date().toISOString()
        };
        
        writeFileSync(abilityRegistryPath, JSON.stringify(fullRegistry, null, 2));
        logger.info('Ability registry populated.');
    } else {
        logger.error({ error: abilityRes.error }, 'Ability data fetch failed.');
    }

    logger.info('Pedagogy Logic population complete.');
}

run().catch(err => {
    logger.error({ error: err }, 'Fatal error during population.');
    process.exit(1);
});
