import fs from 'fs';
import path from 'path';

const RIBBON_ICONS = [
    { name: 'hero', url: 'https://runescape.wiki/images/Hero_icon.png' },
    { name: 'gear', url: 'https://runescape.wiki/images/Gear_icon.png' },
    { name: 'powers', url: 'https://runescape.wiki/images/Powers_icon.png' },
    { name: 'adventures', url: 'https://runescape.wiki/images/Adventures_icon.png' },
    { name: 'community', url: 'https://runescape.wiki/images/Community_icon.png' },
    { name: 'metrics', url: 'https://runescape.wiki/images/RuneMetrics_icon.png' },
    { name: 'settings', url: 'https://runescape.wiki/images/Settings_icon.png' }
];

const OUT_DIR = path.join(process.cwd(), 'tmp_rsmv_inspect', 'public', 'ribbon');

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function downloadIcons() {
    console.log('Starting Wiki Ribbon download...');
    for (const icon of RIBBON_ICONS) {
        const outPath = path.join(OUT_DIR, `${icon.name}.png`);
        console.log(`Downloading ${icon.name}.png from ${icon.url} ...`);
        
        try {
            const response = await fetch(icon.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) POG-Sovereign-Agent/1.0'
                }
            });
            
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                fs.writeFileSync(outPath, Buffer.from(buffer));
                console.log(`Saved ${icon.name}.png`);
            } else {
                console.error(`Failed to download ${icon.name}.png: HTTP ${response.status}`);
            }
        } catch (err) {
            console.error(`Error downloading ${icon.name}.png:`, err.message);
        }
    }
}

downloadIcons();
