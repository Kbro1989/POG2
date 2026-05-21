import * as fs from 'fs';
import * as path from 'path';

const DIR = 'D:/sovereign/memory/pedagogy/varbits_json';

function scanVarbits() {
    const files = fs.readdirSync(DIR);
    console.log("=== SCANNING VARBITS FOR VARP 5745 & 5746 & 524476 ===");

    const targets = [5745, 5746, 524476];

    for (const f of files) {
        if (!f.endsWith('.json')) continue;
        const filePath = path.join(DIR, f);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (targets.includes(data.varid)) {
            const varbitId = f.replace('varbits-', '').replace('.json', '');
            console.log(`Varbit ${varbitId}: varp=${data.varid}, bits=[${data.bits[0]}, ${data.bits[1]}] (size ${data.bits[1] - data.bits[0] + 1})`);
        }
    }
}

scanVarbits();
