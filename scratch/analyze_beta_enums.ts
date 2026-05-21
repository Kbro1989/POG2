import * as fs from 'fs';

const ANALYSIS_PATH = 'D:/sovereign/cache_pedagogy/beta_enum_analysis.json';
const OUTPUT_TXT = 'D:/sovereign/cache_pedagogy/filtered_candidates.txt';

interface EnumEntry {
    key: any;
    val: any;
}

interface DecodedEnum {
    enumId: number;
    subFileId: number;
    keyType: number;
    valType: number;
    defaultInt: number | null;
    defaultString: string | null;
    entries: EnumEntry[];
    totalEntries: number;
}

interface ArchiveReport {
    archiveId: number;
    totalFiles: number;
    decodedCount: number;
    enums: DecodedEnum[];
}

function runAnalysis() {
    console.log(`🔍 Analyzing beta enums in ${ANALYSIS_PATH}...`);
    if (!fs.existsSync(ANALYSIS_PATH)) {
        console.error("Analysis file not found!");
        return;
    }

    const data: ArchiveReport[] = JSON.parse(fs.readFileSync(ANALYSIS_PATH, 'utf8'));

    const femaleHairCandidates: DecodedEnum[] = [];
    const maleHairCandidates: DecodedEnum[] = [];
    const beardCandidates: DecodedEnum[] = [];
    const generalCandidates: DecodedEnum[] = [];

    for (const archive of data) {
        for (const enumObj of archive.enums) {
            const size = enumObj.totalEntries;

            // Search for Jagex's precise counts
            if (size === 34) {
                femaleHairCandidates.push(enumObj);
            }
            if (size === 29) {
                maleHairCandidates.push(enumObj);
            }
            if (size === 19) {
                beardCandidates.push(enumObj);
            }

            // Also check for any entries containing "hair", "beard", "style", "thessalia", etc.
            const hasKeywords = enumObj.entries.some(entry => {
                const sVal = String(entry.val).toLowerCase();
                const sKey = String(entry.key).toLowerCase();
                return sVal.includes("hair") || sVal.includes("beard") || sVal.includes("style") || 
                       sVal.includes("female") || sVal.includes("male");
            });

            if (hasKeywords) {
                generalCandidates.push(enumObj);
            }
        }
    }

    let outStr = "";
    outStr += `🎯 CANDIDATE ENUMS MATCHING EXACT BETA COUNTS:\n`;
    outStr += `-----------------------------------------------\n`;
    outStr += `👩 Female Hairstyle Candidates (Total entries = 34): ${femaleHairCandidates.length}\n`;
    for (const c of femaleHairCandidates) {
        outStr += `   Enum ${c.enumId} (Archive ${c.subFileId}): keyType=${c.keyType}, valType=${c.valType}, sample entries:\n`;
        c.entries.forEach(e => {
            outStr += `     - ${e.key} => ${e.val}\n`;
        });
    }

    outStr += `\n👨 Male Hairstyle Candidates (Total entries = 29): ${maleHairCandidates.length}\n`;
    for (const c of maleHairCandidates) {
        outStr += `   Enum ${c.enumId} (Archive ${c.subFileId}): keyType=${c.keyType}, valType=${c.valType}, sample entries:\n`;
        c.entries.forEach(e => {
            outStr += `     - ${e.key} => ${e.val}\n`;
        });
    }

    outStr += `\n🧔 Beard Candidates (Total entries = 19): ${beardCandidates.length}\n`;
    for (const c of beardCandidates) {
        outStr += `   Enum ${c.enumId} (Archive ${c.subFileId}): keyType=${c.keyType}, valType=${c.valType}, sample entries:\n`;
        c.entries.forEach(e => {
            outStr += `     - ${e.key} => ${e.val}\n`;
        });
    }

    outStr += `\n💡 GENERAL KEYWORD MATCHES (hair/beard/style/gender):\n`;
    outStr += `-----------------------------------------------\n`;
    for (const c of generalCandidates) {
        outStr += `   Enum ${c.enumId} (size=${c.totalEntries}): sample entries:\n`;
        c.entries.slice(0, 10).forEach(e => {
            outStr += `     - ${e.key} => ${e.val}\n`;
        });
    }

    fs.writeFileSync(OUTPUT_TXT, outStr, 'utf8');
    console.log(`✅ Detailed candidates written to: ${OUTPUT_TXT}`);
}

runAnalysis();
