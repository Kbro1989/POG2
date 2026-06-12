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

    console.log("=== SEARCHING FOR STRING ENUMS OF SIZE 34 OR 29 ===");

    for (const archive of data) {
        for (const enumObj of archive.enums) {
            const size = enumObj.totalEntries;

            if ((size === 34 || size === 29) && enumObj.valType === 36) {
                console.log(`\n🗣️ String Enum Found: ID ${enumObj.enumId} (size ${size})`);
                console.log(`   Sample entries:`);
                enumObj.entries.slice(0, 10).forEach(e => {
                    console.log(`     - ${e.key} => ${e.val}`);
                });
            }
        }
    }
}

runFilter();
