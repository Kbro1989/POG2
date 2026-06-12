
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

    // 2. Populate Skills (Full Wiki Parity)
    logger.info('Populating Skills...');
    const skillManifestPath = join(logicDir, 'skill_manifest.json');
    const skills = [
        { id: 1, name: 'Attack', maxLevel: 120, f2pMaxLevel: 120, isMembers: false, isElite: false, type: 'Combat' },
        { id: 2, name: 'Strength', maxLevel: 120, f2pMaxLevel: 120, isMembers: false, isElite: false, type: 'Combat' },
        { id: 3, name: 'Ranged', maxLevel: 120, f2pMaxLevel: 120, isMembers: false, isElite: false, type: 'Combat' },
        { id: 4, name: 'Magic', maxLevel: 120, f2pMaxLevel: 120, isMembers: false, isElite: false, type: 'Combat' },
        { id: 5, name: 'Defence', maxLevel: 99, f2pMaxLevel: 99, isMembers: false, isElite: false, type: 'Combat' },
        { id: 6, name: 'Constitution', maxLevel: 99, f2pMaxLevel: 99, isMembers: false, isElite: false, type: 'Combat' },
        { id: 7, name: 'Prayer', maxLevel: 99, f2pMaxLevel: 99, isMembers: false, isElite: false, type: 'Combat' },
        { id: 8, name: 'Agility', maxLevel: 99, f2pMaxLevel: 5, isMembers: true, isElite: false, type: 'Support' },
        { id: 9, name: 'Herblore', maxLevel: 120, f2pMaxLevel: 5, isMembers: true, isElite: false, type: 'Artisan' },
        { id: 10, name: 'Thieving', maxLevel: 120, f2pMaxLevel: 5, isMembers: true, isElite: false, type: 'Support' },
        { id: 11, name: 'Crafting', maxLevel: 110, f2pMaxLevel: 110, isMembers: false, isElite: false, type: 'Artisan' },
        { id: 12, name: 'Runecrafting', maxLevel: 110, f2pMaxLevel: 110, isMembers: false, isElite: false, type: 'Artisan' },
        { id: 13, name: 'Mining', maxLevel: 110, f2pMaxLevel: 110, isMembers: false, isElite: false, type: 'Gathering' },
        { id: 14, name: 'Smithing', maxLevel: 110, f2pMaxLevel: 110, isMembers: false, isElite: false, type: 'Artisan' },
        { id: 15, name: 'Fishing', maxLevel: 99, f2pMaxLevel: 99, isMembers: false, isElite: false, type: 'Gathering' },
        { id: 16, name: 'Cooking', maxLevel: 99, f2pMaxLevel: 99, isMembers: false, isElite: false, type: 'Artisan' },
        { id: 17, name: 'Firemaking', maxLevel: 110, f2pMaxLevel: 110, isMembers: false, isElite: false, type: 'Artisan' },
        { id: 18, name: 'Woodcutting', maxLevel: 110, f2pMaxLevel: 110, isMembers: false, isElite: false, type: 'Gathering' },
        { id: 19, name: 'Fletching', maxLevel: 110, f2pMaxLevel: 110, isMembers: false, isElite: false, type: 'Artisan' },
        { id: 20, name: 'Slayer', maxLevel: 120, f2pMaxLevel: 5, isMembers: true, isElite: false, type: 'Support' },
        { id: 21, name: 'Farming', maxLevel: 120, f2pMaxLevel: 5, isMembers: true, isElite: false, type: 'Gathering' },
        { id: 22, name: 'Construction', maxLevel: 99, f2pMaxLevel: 5, isMembers: true, isElite: false, type: 'Artisan' },
        { id: 23, name: 'Hunter', maxLevel: 110, f2pMaxLevel: 5, isMembers: true, isElite: false, type: 'Gathering' },
        { id: 24, name: 'Summoning', maxLevel: 99, f2pMaxLevel: 5, isMembers: true, isElite: false, type: 'Combat' },
        { id: 25, name: 'Dungeoneering', maxLevel: 120, f2pMaxLevel: 120, isMembers: false, isElite: false, type: 'Support' },
        { id: 26, name: 'Divination', maxLevel: 99, f2pMaxLevel: 5, isMembers: true, isElite: false, type: 'Gathering' },
        { id: 27, name: 'Invention', maxLevel: 120, f2pMaxLevel: 1, isMembers: true, isElite: true, type: 'Elite' },
        { id: 28, name: 'Archaeology', maxLevel: 120, f2pMaxLevel: 20, isMembers: true, isElite: false, type: 'Gathering' },
        { id: 29, name: 'Necromancy', maxLevel: 120, f2pMaxLevel: 20, isMembers: true, isElite: false, type: 'Combat' }
    ];

    const skillManifest = {
        version: "2.0.0",
        total_skills: skills.length,
        skills: skills,
        categories: {
            combat: skills.filter(s => s.type === 'Combat').map(s => s.name),
            gathering: skills.filter(s => s.type === 'Gathering').map(s => s.name),
            artisan: skills.filter(s => s.type === 'Artisan').map(s => s.name),
            support: skills.filter(s => s.type === 'Support').map(s => s.name),
            elite: skills.filter(s => s.type === 'Elite').map(s => s.name)
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

