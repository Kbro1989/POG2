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

    console.log("=== SCANNING FOR AVATAR REFRESH APPEARANCE ENUMS ===");

    for (const archive of data) {
        for (const enumObj of archive.enums) {
            const size = enumObj.totalEntries;

            // Hairstyle / Beard counts
            if (size === 34 || size === 29 || size === 19) {
                // Filter out standard non-appearance enums
                const sampleValuesStr = JSON.stringify(enumObj.entries).toLowerCase();
                if (
                    sampleValuesStr.includes("chimes") || 
                    sampleValuesStr.includes("soup") || 
                    sampleValuesStr.includes("level") ||
                    sampleValuesStr.includes("attack") ||
                    sampleValuesStr.includes("agility") ||
                    sampleValuesStr.includes("wight") ||
                    sampleValuesStr.includes("unicorn") ||
                    sampleValuesStr.includes("potion")
                ) {
                    continue;
                }

                console.log(`\n🎯 Candidate Appearance Enum found: ID ${enumObj.enumId} (size ${size})`);
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
