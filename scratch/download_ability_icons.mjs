import fs from 'fs';
import path from 'path';

const abilities = [
  "Attack_(ability)", "Slice", "Slaughter", "Decimate", "Havoc", "Sever", "Smash", 
  "Kick", "Backhand", "Punish", "Dismember", "Cleave", "Rend", "Fury", "Barge",
  "Bladed_Dive", "Assault", "Destroy", "Hurricane", "Flurry", "Quake", "Blood_Tendrils",
  "Berserk", "Meteor_Strike", "Overpower", "Pulverise", "Frenzy", "Massacre", 
  "Balanced_Strike", "Chaos_Roar", "Dive",
  "Anticipation", "Freedom", "Provoke", "Reflect", "Revenge", "Resonance", 
  "Preparation", "Bash", "Debilitate", "Divert", "Devotion", "Barricade", 
  "Immortality", "Rejuvenate", "Natural_Instinct", "Onslaught", "Sacrifice", 
  "Limitless", "Regenerate_(ability)", "Eat_Food"
];

async function downloadIcons() {
    console.log("Starting Ability Icon download...");
    const outDir = path.join(process.cwd(), 'web_hud', 'public', 'icons');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    for (const name of abilities) {
        const filename = `${name}.png`;
        try {
            const apiUrl = `https://runescape.wiki/api.php?action=query&titles=File:${filename}&prop=imageinfo&iiprop=url&format=json`;
            const req = await fetch(apiUrl);
            const data = await req.json();
            
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            
            if (pageId === "-1") {
                // Try with _icon suffix if first attempt fails
                const iconFilename = `${name}_icon.png`;
                const iconApiUrl = `https://runescape.wiki/api.php?action=query&titles=File:${iconFilename}&prop=imageinfo&iiprop=url&format=json`;
                const iconReq = await fetch(iconApiUrl);
                const iconData = await iconReq.json();
                const iconPages = iconData.query.pages;
                const iconPageId = Object.keys(iconPages)[0];
                
                if (iconPageId !== "-1") {
                   const imageInfo = iconPages[iconPageId].imageinfo;
                   if (imageInfo && imageInfo.length > 0) {
                       await download(imageInfo[0].url, filename, outDir);
                       continue;
                   }
                }
                console.warn(`Could not find image info for ${name} (tried ${filename} and ${iconFilename})`);
                continue;
            }

            const imageInfo = pages[pageId].imageinfo;
            if (imageInfo && imageInfo.length > 0) {
                await download(imageInfo[0].url, filename, outDir);
            }
        } catch (e) {
            console.error(`Failed on ${name}:`, e);
        }
    }
    console.log("Icon download complete!");
}

async function download(url, filename, outDir) {
    const safeFilename = filename.replace(/\(ability\)/, '').replace(/_icon/, '').replace(/_/, ' ');
    // Keep it simple for now, just save as original name
    const finalName = filename.toLowerCase().replace(/_/g, '-').replace(/\(ability\)/, '');
    
    console.log(`Downloading ${url} ...`);
    const imgReq = await fetch(url);
    const arrayBuffer = await imgReq.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(path.join(outDir, finalName), buffer);
    console.log(`Saved ${finalName}`);
}

downloadIcons();
