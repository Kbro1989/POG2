import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader  } = require("./rsmv/src/cache/sqlite.js");
const { parse  } = require("./rsmv/src/opdecoder.js");
/**
 * cache_enum_scanner.ts
 * Scans Major 8 (Enums) to find the RS3 Enum that defines Skills.
 */


(global as any).__non_webpack_require__ = require;




const CACHE_PATH = 'C:\\ProgramData\\Jagex\\RuneScape';
const MAJOR_ENUMS = 8;
const ARCH_SIZE = 256;

async function main() {
    console.log(`\n🔬 Scanning Enums (Major 8) for Skill Definitions...`);

    const cache = new GameCacheLoader(CACHE_PATH);
    (cache as any).buildnr = 940;

    let totalEnums = 0;
    let foundEnums: any[] = [];

    try {
        const indices = await cache.getCacheIndex(MAJOR_ENUMS);
        for (const index of indices) {
            if (!index) continue;

            try {
                const archive = await cache.getArchiveById(MAJOR_ENUMS, index.minor);
                for (const file of archive) {
                    const id = index.minor * ARCH_SIZE + file.fileid;
                    try {
                        const raw = parse.enums.read(file.buffer, cache);
                        totalEnums++;

                        // We are looking for an Enum that maps integers to Strings (value_type2 === 115 's')
                        // and contains "Attack", "Strength", or "Necromancy"
                        let hasAttack = false;
                        let hasNecromancy = false;

                        let isStringValues = false;

                        const values = raw.stringArrayValue1 || raw.stringArrayValue2?.values;
                        if (values) {
                            for (const val of values) {
                                const str = typeof val[1] === 'string' ? val[1] : '';
                                if (str === 'Attack') hasAttack = true;
                                if (str === 'Necromancy' || str === 'necromancy') hasNecromancy = true;
                            }
                        }

                        if (hasAttack && hasNecromancy) {
                            foundEnums.push({ id, raw });
                            console.log(`\n  ✅ Found Potential Skill Enum! ID: ${id}`);
                            if (values) console.log(`     Values:`, values.slice(0, 10), `... (${values.length} total)`);
                        } else if (hasAttack && values && values.length > 20 && values.length < 50) {
                            // Check for older skill enums without necro
                            let hasStr = false;
                            let hasDef = false;
                            for (const val of values) {
                                const str = typeof val[1] === 'string' ? val[1] : '';
                                if (str === 'Strength') hasStr = true;
                                if (str === 'Defence') hasDef = true;
                            }
                            if (hasStr && hasDef) {
                                foundEnums.push({ id, raw });
                                console.log(`\n  ✅ Found Potential Skill Enum! ID: ${id}`);
                            }
                        }
                    } catch (e) {
                        // parse error
                    }
                }
            } catch {
                // archive error
            }
        }
    } catch (e) {
        console.error(e);
    }

    cache.close();
    console.log(`\n  Scanned ${totalEnums} enums. Found ${foundEnums.length} matching skill enums.`);
}

main().catch(console.error);
