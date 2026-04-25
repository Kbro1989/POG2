import * as fs from "fs";

const IN_ACHIEVEMENTS = "D:\\sovereign\\atlas\\system\\achievements.json";
const OUT_ACHIEVEMENTS = "D:\\sovereign\\atlas\\system\\achievements_semantic.json";

function enrichAchievements() {
    console.log("🚀 Sovereign Semantic Mapper - Achievements");
    if (!fs.existsSync(IN_ACHIEVEMENTS)) {
        console.log("Missing achievements.json!");
        return;
    }

    const raw = JSON.parse(fs.readFileSync(IN_ACHIEVEMENTS, "utf8"));
    const enriched = raw.map((ach: any) => {
        let descStr = null;
        if (ach.description && ach.description.descr) {
            descStr = ach.description.descr;
        }

        return {
            id: ach.id,
            name: ach.name,
            description: descStr,
            category: ach.category,
            subcategory: ach.subcategory,
            requiredQuests: ach.quest_ids || [],
            linkedAchievements: ach.sub_achievements || [],
            spriteId: ach.spriteId,
            runeScore: ach.category === 4746 ? "Quest" : ach.runeScore
        };
    });

    fs.writeFileSync(OUT_ACHIEVEMENTS, JSON.stringify(enriched, null, 2));
    console.log(`✅ Extracted ${enriched.length} semantic achievements to ${OUT_ACHIEVEMENTS}`);
}

enrichAchievements();
