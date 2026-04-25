import Database from "better-sqlite3";

const CACHE_DB = "C:\\ProgramData\\Jagex\\RuneScape\\js5-18.jcache"; // NPCs are Major 18

import { inflateRawSync, inflateSync, gunzipSync } from 'zlib';

function decompressJagex(data: Buffer): Buffer {
  if (data.length < 3) return data;
  if (data.slice(0, 3).toString() === 'ZLB') {
    for (const offset of [15, 8, 12]) {
      try { return inflateSync(data.slice(offset)); } catch (e) {}
      try { return inflateRawSync(data.slice(offset)); } catch (e) {}
    }
  }
  if (data[0] === 0x1f && data[1] === 0x8b) {
    try { return gunzipSync(data); } catch (e) {}
    try { return inflateRawSync(data.slice(10)); } catch (e) {}
  }
  if (data[0] === 0x78 && (data[1] === 0x9c || data[1] === 0x01)) {
    try { return inflateSync(data); } catch (e) {}
  }
  return data;
}

function findNpcByName(targetName: string) {
    console.log(`ðŸ” Searching for raw string: "${targetName}" in Major 18 (js5-18.jcache)...`);
    const db = new Database(CACHE_DB, { readonly: true });
    const rows = db.prepare('SELECT KEY, DATA FROM cache').all() as any[];
    let foundCount = 0;
    
    for (const row of rows) {
        if (!row.DATA) continue;
        const file = decompressJagex(row.DATA as Buffer);
        
        if (file.toString("utf8").toLowerCase().includes(targetName.toLowerCase())) {
            // Reconstruct the file ID from the KEY (Group/File packing)
            const keyBig = BigInt(row.KEY);
            const group = Number(keyBig >> 32n);
            const fileId = Number(keyBig & 0xFFFFFFFFn);
            
            console.log(`\nðŸŽ¯ Found "${targetName}" in NPC ID/File: ${fileId} (Group: ${group})`);
            
            // Context mapping
            const strIndex = file.toString("utf8").toLowerCase().indexOf(targetName.toLowerCase());
            const startStr = Math.max(0, strIndex - 10);
            const endStr = Math.min(file.length, strIndex + targetName.length + 50);
            console.log(`Context Text: ${file.subarray(startStr, endStr).toString("utf8").replace(/[\x00-\x1F\x7F-\x9F]/g, '.')}`);
            console.log(`Hex: ${file.subarray(startStr, endStr).toString("hex")}`);
            foundCount++;
        }
    }
    
    console.log(`\nâœ… Finished scan. Found ${foundCount} results for "${targetName}".`);
    db.close();
}

findNpcByName("Makeover mage");
