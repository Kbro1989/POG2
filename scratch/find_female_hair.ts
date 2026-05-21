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

    console.log("=== SEARCHING FOR FEMALE HAIRSTYLES ENUM (SIZE 34) ===");

    for (const archive of data) {
        for (const enumObj of archive.enums) {
            const size = enumObj.totalEntries;

            if (size === 34) {
                // Relaxed constraint: At least 5 entries are integers > 10000
                let count = 0;
                for (const e of enumObj.entries) {
                    const val = Number(e.val);
                    if (!isNaN(val) && val > 10000) {
                        count++;
                    }
                }

                if (count >= 5) {
                    console.log(`\n💖 Female Hairstyle Enum Found: ID ${enumObj.enumId} (size 34)`);
                    console.log(`   keyType: ${enumObj.keyType}, valType: ${enumObj.valType}`);
                    console.log(`   Entries:`);
                    enumObj.entries.forEach(e => {
                        console.log(`     - ${e.key} => ${e.val}`);
                    });
                }
            }
        }
    }
}

runFilter();
