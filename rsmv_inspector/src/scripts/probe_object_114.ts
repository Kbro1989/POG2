import { GameCacheLoader } from "rsmv_inspector/cache/sqlite";
import { cacheMajors } from "rsmv_inspector/constants";
import { parse } from "rsmv_inspector/opdecoder";

async function go() {
    const s = new GameCacheLoader("C:\\ProgramData\\Jagex\\RuneScape");
    // Object 114 = Cooking range
    const f = await s.getFileById(cacheMajors.objects, 114);
    const o = parse.object.read(f, s) as any;
    console.log("ALL KEYS:", Object.keys(o).join(", "));
    console.log("FULL JSON:", JSON.stringify(o, null, 2));
}
go().catch(console.error);
