import fs from 'fs';
import path from 'path';

const hitmarksToDownload = [
    'Hitsplat.png',
    'Melee_ability_hitsplat.png',
    'Magic_ability_hitsplat.png',
    'Ranged_ability_hitsplat.png',
    'Critical_melee_hitsplat.png',
    'Critical_magic_hitsplat.png',
    'Critical_ranged_hitsplat.png',
    'Blocked_hitsplat.png',
    'Poison_hitsplat.png',
    'Healing_hitsplat.png',
    'Deflect_hitsplat.png'
];

async function downloadWikiHitmarks() {
    console.log("Starting Wiki Hitmark download...");
    const outDir = path.join(process.cwd(), 'public', 'hitmarks');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    for (const filename of hitmarksToDownload) {
        try {
            // Get the direct URL from MediaWiki API
            const apiUrl = `https://runescape.wiki/api.php?action=query&titles=File:${filename}&prop=imageinfo&iiprop=url&format=json`;
            const req = await fetch(apiUrl);
            const data = await req.json();
            
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            const imageInfo = pages[pageId].imageinfo;
            
            if (imageInfo && imageInfo.length > 0) {
                const imageUrl = imageInfo[0].url;
                console.log(`Downloading ${filename} from ${imageUrl} ...`);
                
                const imgReq = await fetch(imageUrl);
                const arrayBuffer = await imgReq.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                fs.writeFileSync(path.join(outDir, filename), buffer);
                console.log(`Saved ${filename}`);
            } else {
                console.warn(`Could not find image info for ${filename}`);
            }
        } catch (e) {
            console.error(`Failed on ${filename}:`, e);
        }
    }
    console.log("Hitmark bundle complete!");
}

downloadWikiHitmarks();
