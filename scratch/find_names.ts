import * as fs from 'fs';

const ANALYSIS_PATH = 'D:/sovereign/cache_pedagogy/beta_enum_analysis.json';

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

function runFilter() {
    const data: ArchiveReport[] = JSON.parse(fs.readFileSync(ANALYSIS_PATH, 'utf8'));

    console.log("=== SEARCHING FOR HAIRSTYLE/BEARD NAME ENUMS ===");

    const keywords = ["bald", "ponytail", "spikey", "spiked", "afro", "dreadlocks", "shaved", "braid", "fringe", "mohawk"];

    for (const archive of data) {
        for (const enumObj of archive.enums) {
            const hasKeyword = enumObj.entries.some(e => {
                const s = String(e.val).toLowerCase();
                return keywords.some(k => s.includes(k));
            });

            if (hasKeyword) {
                console.log(`\n🗣️ Name Enum Found: ID ${enumObj.enumId} (size ${enumObj.totalEntries})`);
                console.log(`   keyType: ${enumObj.keyType}, valType: ${enumObj.valType}`);
                console.log(`   Entries:`);
                enumObj.entries.forEach(e => {
                    console.log(`     - ${e.key} => ${e.val}`);
                });
            }
        }
    }
}

runFilter();
