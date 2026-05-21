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

    console.log("=== SCANNING ENUMS AROUND 2330-2350 ===");

    for (const archive of data) {
        for (const enumObj of archive.enums) {
            if (enumObj.enumId >= 2330 && enumObj.enumId <= 2350) {
                console.log(`\n🗣️ Enum ${enumObj.enumId} (size ${enumObj.totalEntries}): keyType=${enumObj.keyType}, valType=${enumObj.valType}`);
                enumObj.entries.slice(0, 15).forEach(e => {
                    console.log(`     - ${e.key} => ${e.val}`);
                });
            }
        }
    }
}

runFilter();
