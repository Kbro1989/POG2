import { GameCacheLoader } from "../rsmv/cache/sqlite.js";
import { cacheMajors } from "../rsmv/constants.js";
import { parse } from "../rsmv/opdecoder.js";

async function go() {
    const s = new GameCacheLoader("C:\\ProgramData\\Jagex\\RuneScape");
    // Object 114 = Cooking range
    const f = await s.getFileById(cacheMajors.objects, 114);
    const o = parse.object.read(f, s) as any;
    console.log("ALL KEYS:", Object.keys(o).join(", "));
    console.log("FULL JSON:", JSON.stringify(o, null, 2));
}
go().catch(console.error);

