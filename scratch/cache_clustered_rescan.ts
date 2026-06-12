import { readFileSync, openSync, readSync, closeSync } from 'fs';
import { join } from 'path';

const CACHE_DIR = 'C:\\ProgramData\\Jagex\\RuneScape';
const TARGET_FILE = join(CACHE_DIR, 'js5-48.jcache');

const SEARCH_STRINGS = ['Bard', 'Tame', 'Companion', 'Creature', 'Mount'];
const WINDOW_SIZE = 1024; // Search window
const CLUSTER_DISTANCE = 512;

async function scan() {
    console.log(`Scanning ${TARGET_FILE} for clustered strings: ${SEARCH_STRINGS.join(', ')}`);
    
    try {
        const fd = openSync(TARGET_FILE, 'r');
        const buffer = Buffer.alloc(1024 * 1024); // 1MB buffer
        let offset = 0;
        let bytesRead = 0;

        while ((bytesRead = readSync(fd, buffer, 0, buffer.length, offset)) > 0) {
            const content = buffer.toString('utf8', 0, bytesRead);
            
            for (const s1 of SEARCH_STRINGS) {
                let pos = content.indexOf(s1);
                while (pos !== -1) {
                    const start = Math.max(0, pos - CLUSTER_DISTANCE);
                    const end = Math.min(content.length, pos + s1.length + CLUSTER_DISTANCE);
                    const window = content.substring(start, end);
                    
                    const matches = SEARCH_STRINGS.filter(s => s !== s1 && window.includes(s));
                    if (matches.length > 0) {
                        console.log(`[MATCH] Cluster found at global offset ${offset + pos}:`);
                        console.log(`  Anchor: ${s1}`);
                        console.log(`  Nearby: ${matches.join(', ')}`);
                        console.log(`  Context: ...${window.substring(Math.max(0, CLUSTER_DISTANCE - 50), Math.min(window.length, CLUSTER_DISTANCE + s1.length + 50)).replace(/\n/g, ' ')}...`);
                        console.log('--------------------------------------------------');
                    }
                    
                    pos = content.indexOf(s1, pos + 1);
                }
            }
            
            offset += bytesRead - WINDOW_SIZE; // Overlap to ensure we don't miss clusters split across reads
            if (offset < 0) offset = 0;

            if (Math.floor(offset / (10 * 1024 * 1024)) > Math.floor((offset - bytesRead) / (10 * 1024 * 1024))) {
                console.log(`Progress: ${Math.floor(offset / (1024 * 1024))}MB / ~132MB`);
            }
        }
        
        closeSync(fd);
    } catch (e: any) {
        console.error(`Scan failed: ${e.message}`);
    }
}

scan();
