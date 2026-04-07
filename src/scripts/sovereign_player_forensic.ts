/**
 * Sovereign Player Forensic — Unified Research Tool
 * 
 * Four parallel investigations:
 * 1. Player Status/Rank Hierarchy (modern RS3 ranks beyond old 0-4)
 * 2. Better Player Template NPCs (beyond ID 15516)
 * 3. Admin command logic (refining brute-force candidate scripts)
 * 4. Player rights varbit/command strings in ClientScripts
 */
import { GameCacheLoader } from "../rsmv/cache/sqlite.js";
import { parse } from "../rsmv/opdecoder.js";
import { cacheMajors } from "../rsmv/constants.js";
import * as fs from "fs";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const OUTPUT_DIR = "D:\\sovereign\\atlas\\spatial\\system_taxonomy";

function extractStrings(buf: Buffer, minLen = 3): string[] {
    const strings: string[] = [];
    let current = "";
    for (let i = 0; i < buf.length; i++) {
        const b = buf[i];
        if (b >= 32 && b < 127) current += String.fromCharCode(b);
        else { if (current.length >= minLen) strings.push(current); current = ""; }
    }
    if (current.length >= minLen) strings.push(current);
    return strings;
}

async function run() {
    console.log("🧬 Sovereign Player Forensic — Unified Research (Proper API)");
    const source = new GameCacheLoader(CACHE_DIR);

    // ═══════════════════════════════════════════════════════
    // PHASE 1: Find ALL "Player"-named NPCs via getFileById
    // ═══════════════════════════════════════════════════════
    console.log("\n📡 PHASE 1: Player Template NPC Scan (getFileById)");
    const playerNPCs: any[] = [];
    const replicaKeywords = ["Player", "Durial", "Cursed You", "Lost Soul", "Clone", "Zombie"];

    for (let id = 0; id < 40000; id++) {
        try {
            const buf = await source.getFileById(cacheMajors.npcs, id);
            const npc = parse.npc.read(buf, source);
            
            if (npc.name && replicaKeywords.some(k => npc.name.includes(k))) {
                const entry: any = {
                    id,
                    name: npc.name,
                    combat: npc.combat || 0,
                    models: npc.models || [],
                    headModels: npc.headModels || [],
                    actions: [] as string[],
                    animation_group: (npc as any).animation_group || null,
                    boundSize: (npc as any).boundSize || null,
                    color_replacements: (npc as any).color_replacements || [],
                    material_replacements: (npc as any).material_replacements || [],
                    movementCapabilities: (npc as any).movementCapabilities || null
                };
                for (let i = 0; i < 5; i++) {
                    const key = `actions_${i}`;
                    if ((npc as any)[key]) entry.actions.push((npc as any)[key]);
                }
                playerNPCs.push(entry);
                console.log(`   🎯 NPC ${id}: "${npc.name}" combat=${entry.combat} models=${entry.models.length}`);
            }
        } catch (e) {}
        if (id % 10000 === 0) console.log(`   NPC scan: ${id}...`);
    }
    console.log(`✅ Found ${playerNPCs.length} Player-like NPCs`);

    // ═══════════════════════════════════════════════════════
    // PHASE 2: Enum Scan for Player Rank/Status/Iron Modes
    // ═══════════════════════════════════════════════════════
    console.log("\n📡 PHASE 2: Player Rank/Status Enum Scan (getFileById)");
    const rankKeywords = ["player mod", "pmod", "jmod", "admin", "ironman", "hardcore",
                          "group iron", "ultimate iron", "moderator", "player status",
                          "crown", "rank", "privilege", "staff", "iron"];
    const rankEnums: any[] = [];

    for (let id = 0; id < 20000; id++) {
        try {
            const buf = await source.getFileById(cacheMajors.enums, id);
            const str = buf.toString('utf8').toLowerCase();
            const matches = rankKeywords.filter(k => str.includes(k));
            
            if (matches.length > 0) {
                try {
                    const enumData = parse.enums.read(buf, source);
                    rankEnums.push({ id, matches, data: enumData });
                    console.log(`   🎯 Enum ${id}: ${matches.join(", ")}`);
                } catch {
                    const strings = extractStrings(buf);
                    rankEnums.push({ id, matches, strings: strings.slice(0, 15) });
                    console.log(`   🎯 Enum ${id} (raw strings): ${matches.join(", ")}`);
                }
            }
        } catch (e) {}
        if (id % 5000 === 0) console.log(`   Enum scan: ${id}...`);
    }
    console.log(`✅ Found ${rankEnums.length} Rank/Status Enums`);

    // ═══════════════════════════════════════════════════════
    // PHASE 3: Admin Command Logic (Script String Forensics)
    // Brute-force found these IDs with "::" or ";;" in buffer:
    // ═══════════════════════════════════════════════════════
    console.log("\n📡 PHASE 3: Admin Command String Refinement");
    const adminCandidates = [
        1024, 3048, 5089, 5183, 5506, 5507, 5508, 5510, 10131, 10135,
        13343, 15125, 16441, 16525, 17147, 17427, 17982, 18819, 18862
    ];
    const adminLogic: any[] = [];

    for (const id of adminCandidates) {
        try {
            const buf = await source.getFileById(cacheMajors.clientscript, id);
            const strings = extractStrings(buf);
            const cmdStrings = strings.filter(s =>
                s.startsWith("::") || s.startsWith(";;") ||
                s.toLowerCase().includes("admin") || s.toLowerCase().includes("tele") ||
                s.toLowerCase().includes("give") || s.toLowerCase().includes("kick") ||
                s.toLowerCase().includes("ban") || s.toLowerCase().includes("mute") ||
                s.toLowerCase().includes("rank") || s.toLowerCase().includes("status") ||
                s.toLowerCase().includes("privilege") || s.toLowerCase().includes("rights") ||
                s.toLowerCase().includes("mod") || s.toLowerCase().includes("iron")
            );

            adminLogic.push({
                scriptId: id,
                size: buf.length,
                totalStrings: strings.length,
                allStrings: strings,
                commandStrings: cmdStrings
            });
            if (cmdStrings.length > 0) {
                console.log(`   🎯 Script ${id}: ${cmdStrings.length} admin strings -> ${cmdStrings.slice(0, 5).join(", ")}`);
            }
        } catch (e) {}
    }
    console.log(`✅ Analyzed ${adminLogic.length} Admin Command Scripts`);

    // ═══════════════════════════════════════════════════════
    // PHASE 4: Player Rights / Privilege Varbit Search
    // ═══════════════════════════════════════════════════════
    console.log("\n📡 PHASE 4: Player Rights Varbit Scan (ClientScripts)");
    const rightsKeywords = ["rights", "staffmod", "privilege", "modlevel", "crowns",
                            "playerstatus", "playertype", "ironmode"];
    const rightsHits: any[] = [];

    for (let id = 0; id < 25000; id++) {
        try {
            const buf = await source.getFileById(cacheMajors.clientscript, id);
            const str = buf.toString('utf8').toLowerCase();
            const matches = rightsKeywords.filter(k => str.includes(k));

            if (matches.length > 0) {
                const strings = extractStrings(buf);
                rightsHits.push({ scriptId: id, matches, strings: strings.slice(0, 20) });
                console.log(`   🎯 Rights in Script ${id}: ${matches.join(", ")}`);
            }
        } catch (e) {}
        if (id % 5000 === 0) console.log(`   Rights scan: ${id}...`);
    }
    console.log(`✅ Found ${rightsHits.length} Player Rights Scripts`);

    // ═══════════════════════════════════════════════════════
    // SYNTHESIS: Write unified truth
    // ═══════════════════════════════════════════════════════
    const synthesis = {
        timestamp: new Date().toISOString(),
        playerTemplateNPCs: playerNPCs,
        rankStatusEnums: rankEnums,
        adminCommandLogic: adminLogic,
        playerRightsScripts: rightsHits,
        metadata: {
            npc_scan_range: "0-40000",
            enum_scan_range: "0-20000",
            cs_scan_range: "0-25000",
            known_rank_system: {
                legacy: "0=Player, 1=Members, 2=PMod, 3=JMod, 4+=Admin/Dev",
                modern_rs3: "Extended with Iron variants (Regular/Hardcore/Ultimate/Group), Forum/VIP mods, Localised Mods, etc.",
                note: "20 years of evolution since the original 5-tier system"
            }
        }
    };

    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const outPath = `${OUTPUT_DIR}\\player_status_truth.json`;
    fs.writeFileSync(outPath, JSON.stringify(synthesis, null, 2));
    console.log(`\n🧪 Sovereign Player Truth written to: ${outPath}`);
    console.log(`   ${playerNPCs.length} Player NPCs | ${rankEnums.length} Rank Enums | ${adminLogic.length} Admin Scripts | ${rightsHits.length} Rights Scripts`);

    source.close();
}

run().catch(console.error);
