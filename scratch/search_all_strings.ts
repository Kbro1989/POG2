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

    console.log("=== SEARCHING FOR ALL ENUMS WITH APPEARANCE STRING VALUES ===");

    for (const archive of data) {
        for (const enumObj of archive.enums) {
            // Check if any value is a string containing "hair", "beard", "style", "bald", "ponytail", "cut" etc.
            const matches = enumObj.entries.filter(e => {
                const s = String(e.val).toLowerCase();
                return s.includes("hair") || s.includes("beard") || s.includes("style") || 
                       s.includes("ponytail") || s.includes("braid") || s.includes("afro") || 
                       s.includes("mohawk") || s.includes("shaved") || s.includes("fringe");
            });

            if (matches.length > 0) {
                console.log(`\n🗣️ Enum ${enumObj.enumId} (size ${enumObj.totalEntries}):`);
                enumObj.entries.slice(0, 15).forEach(e => {
                    console.log(`     - ${e.key} => ${e.val}`);
                });
            }
        }
    }
}

runFilter();
