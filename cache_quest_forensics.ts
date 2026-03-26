/**
 * cache_quest_forensics.ts - Quest/Achievement Decompiler Proof-of-Work
 * 
 * Reads Major 57 (achievements) from the RS3 cache and extracts all quest definitions.
 * Builds prerequisite dependency graphs, skill requirement maps, and reward data.
 * 
 * Usage: npx tsx cache_quest_forensics.ts
 *        npx tsx cache_quest_forensics.ts --output quests.json
 *        npx tsx cache_quest_forensics.ts --search "Dragon Slayer"
 *        npx tsx cache_quest_forensics.ts --id 42
 * 
 * Substrate hook: Powers quest knowledge in EntityLimb and RSCLimb Globe-3 mapping.
 * PedagogyLimb uses this for quest chain learning and dependency analysis.
 */



import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader  } = require("./tmp_rsmv_inspect/src/cache/sqlite.js");
const { parse  } = require("./tmp_rsmv_inspect/src/opdecoder.js");
import * as fs from 'fs';



(global as any).__non_webpack_require__ = require;

// ─── Types ───
const SKILL_NAMES: Record<number, string> = {
    0: 'Attack', 1: 'Defence', 2: 'Strength', 3: 'Constitution', 4: 'Ranged',
    5: 'Prayer', 6: 'Magic', 7: 'Cooking', 8: 'Woodcutting', 9: 'Fletching',
    10: 'Fishing', 11: 'Firemaking', 12: 'Crafting', 13: 'Smithing', 14: 'Mining',
    15: 'Herblore', 16: 'Agility', 17: 'Thieving', 18: 'Slayer', 19: 'Farming',
    20: 'Runecrafting', 21: 'Hunter', 22: 'Construction', 23: 'Summoning',
    24: 'Dungeoneering', 25: 'Divination', 26: 'Invention', 27: 'Archaeology',
    28: 'Necromancy',
};

interface QuestForensicResult {
    id: number;
    name: string;
    description: string | null;
    category: number | null;
    subcategory: number | null;
    runeScore: number | null;
    rewardText: string | null;
    isF2P: boolean;
    isHidden: boolean;
    skillRequirements: { skill: string; skillId: number; level: number }[];
    prerequisiteQuests: number[];
    questIds: number[] | null;
    subAchievements: number[];
    progressStates: { name: string; value: number }[];
    spriteId: number | null;
}

interface QuestForensicOutput {
    totalExported: number;
    withSkillReqs: number;
    withPrerequisites: number;
    freeToPlay: number;
    quests: QuestForensicResult[];
    timestamp: string;
    pedagogy: {
        topRequiredSkills: { skill: string; count: number }[];
        maxChainDepth: number;
        avgSkillReqs: number;
    };
}

// ─── Config ───
const CACHE_PATH = 'C:\\ProgramData\\Jagex\\RuneScape';
const MAJOR_ACHIEVEMENTS = 57;
const ARCH_SIZE = 128; // Achievements use 128

// ─── Main ───
async function main() {
    const args = process.argv.slice(2);
    let outputFile = 'quests.json';
    let searchQuery: string | null = null;
    let searchId: number | null = null;

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--output': case '-o': outputFile = args[++i]; break;
            case '--search': case '-s': searchQuery = args[++i]; break;
            case '--id': searchId = parseInt(args[++i], 10); break;
        }
    }

    console.log(`\n🔬 Cache Quest Forensics`);
    console.log(`   Decompiling achievements/quests from Major ${MAJOR_ACHIEVEMENTS}...\n`);

    const cache = new GameCacheLoader(CACHE_PATH);
    (cache as any).buildnr = 940;

    const quests: QuestForensicResult[] = [];
    let totalScanned = 0;

    try {
        const indices = await cache.getCacheIndex(MAJOR_ACHIEVEMENTS);
        console.log(`  Found ${indices.length} archives in Major ${MAJOR_ACHIEVEMENTS}.`);

        for (const index of indices) {
            if (!index) continue;
            try {
                const archive = await cache.getArchiveById(MAJOR_ACHIEVEMENTS, index.minor);
                for (const file of archive) {
                    totalScanned++;
                    const id = index.minor * ARCH_SIZE + file.fileid;
                    try {
                        const raw = parse.achievement.read(file.buffer, cache);
                        if (!raw.name) continue;

                        // Skill requirements
                        const skillRequirements: QuestForensicResult['skillRequirements'] = [];
                        const skillSources = [raw.subach_skills, raw.skill_reqs_2];
                        for (const source of skillSources) {
                            if (!source) continue;
                            for (const req of source) {
                                skillRequirements.push({
                                    skill: SKILL_NAMES[req.skill] || `Skill ${req.skill}`,
                                    skillId: req.skill,
                                    level: req.level,
                                });
                            }
                        }

                        // Prerequisites
                        const prerequisiteQuests = raw.previous_achievements || [];

                        // Sub-achievements
                        const subAchievements = (raw.sub_achievements || []).map((s: any) => s.achievement);

                        // Progress states
                        const progressStates = (raw.progress_states || []).map((s: any) => ({
                            name: s.name,
                            value: s.value,
                        }));

                        // Description
                        let description: string | null = null;
                        if (raw.description) {
                            description = raw.description.descr || null;
                        }

                        const quest: QuestForensicResult = {
                            id,
                            name: raw.name,
                            description,
                            category: raw.category ?? null,
                            subcategory: raw.subcategory ?? null,
                            runeScore: raw.runescore ?? null,
                            rewardText: raw.rewardtext ?? null,
                            isF2P: !!raw.f2p,
                            isHidden: raw.hidden != null && raw.hidden > 0,
                            skillRequirements,
                            prerequisiteQuests,
                            questIds: raw.quest_ids ?? null,
                            subAchievements,
                            progressStates,
                            spriteId: raw.spriteId ?? null,
                        };

                        quests.push(quest);
                    } catch {
                        // Skip parse errors
                    }
                }
            } catch {
                // Skip archive errors
            }

            if (index.minor % 10 === 0) {
                process.stdout.write(`\r  Scanned ${totalScanned} entries, found ${quests.length} quests/achievements...`);
            }
        }
    } catch (e) {
        console.error(`Failed to scan cache: ${(e as Error).message}`);
    }

    cache.close();
    console.log(`\r  Scanned ${totalScanned} entries, found ${quests.length} quests/achievements.     \n`);

    // Filter if search requested
    let filteredQuests = quests;
    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filteredQuests = quests.filter(q => q.name.toLowerCase().includes(lowerQuery));
        console.log(`  Search "${searchQuery}": ${filteredQuests.length} matches\n`);
    }
    if (searchId !== null) {
        filteredQuests = quests.filter(q => q.id === searchId);
        console.log(`  Search ID ${searchId}: ${filteredQuests.length} matches\n`);
    }

    // Console output — show top results
    const displayQuests = filteredQuests.slice(0, 30);
    if (displayQuests.length > 0) {
        console.log('  ┌────────┬──────────────────────────────────────┬───────┬───────┬──────┐');
        console.log('  │ ID     │ Name                                 │ Reqs  │ Score │ F2P  │');
        console.log('  ├────────┼──────────────────────────────────────┼───────┼───────┼──────┤');
        for (const q of displayQuests) {
            const idStr = String(q.id).padStart(6);
            const nameStr = q.name.padEnd(36).slice(0, 36);
            const reqStr = String(q.skillRequirements.length).padStart(5);
            const scoreStr = String(q.runeScore ?? '-').padStart(5);
            const f2pStr = (q.isF2P ? 'Yes' : 'No').padStart(4);
            console.log(`  │ ${idStr} │ ${nameStr} │ ${reqStr} │ ${scoreStr} │ ${f2pStr} │`);
        }
        console.log('  └────────┴──────────────────────────────────────┴───────┴───────┴──────┘');
    }

    // Pedagogy analysis
    const skillCounts: Record<string, number> = {};
    let totalSkillReqs = 0;
    for (const q of quests) {
        for (const req of q.skillRequirements) {
            skillCounts[req.skill] = (skillCounts[req.skill] || 0) + 1;
            totalSkillReqs++;
        }
    }
    const topSkills = Object.entries(skillCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, count }));

    // Chain depth analysis (simple BFS)
    const prereqMap = new Map<number, number[]>();
    for (const q of quests) {
        prereqMap.set(q.id, q.prerequisiteQuests);
    }
    let maxChainDepth = 0;
    for (const q of quests) {
        let depth = 0;
        const visited = new Set<number>();
        const stack = [...q.prerequisiteQuests];
        while (stack.length > 0 && depth < 50) {
            const next = stack.pop()!;
            if (visited.has(next)) continue;
            visited.add(next);
            depth++;
            const prereqs = prereqMap.get(next) || [];
            stack.push(...prereqs);
        }
        if (depth > maxChainDepth) maxChainDepth = depth;
    }

    const withSkillReqs = quests.filter(q => q.skillRequirements.length > 0).length;
    const withPrereqs = quests.filter(q => q.prerequisiteQuests.length > 0).length;
    const freeToPlay = quests.filter(q => q.isF2P).length;

    const output: QuestForensicOutput = {
        totalExported: filteredQuests.length,
        withSkillReqs,
        withPrerequisites: withPrereqs,
        freeToPlay,
        quests: filteredQuests,
        timestamp: new Date().toISOString(),
        pedagogy: {
            topRequiredSkills: topSkills,
            maxChainDepth,
            avgSkillReqs: quests.length ? Math.round(totalSkillReqs / quests.length * 10) / 10 : 0,
        },
    };

    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log(`\n  → Saved ${filteredQuests.length} entries to ${outputFile}`);

    // Pedagogy output
    console.log(`\n  🧠 Pedagogy Summary:`);
    console.log(`    Total quests/achievements: ${quests.length}`);
    console.log(`    With skill requirements: ${withSkillReqs}`);
    console.log(`    With prerequisites: ${withPrereqs}`);
    console.log(`    Free-to-play: ${freeToPlay}`);
    console.log(`    Max prerequisite chain depth: ${maxChainDepth}`);
    console.log(`    Avg skill requirements per quest: ${output.pedagogy.avgSkillReqs}`);
    console.log(`    Top required skills: ${topSkills.slice(0, 5).map(s => `${s.skill}(${s.count})`).join(', ')}`);
    console.log();
}

main().catch(console.error);
