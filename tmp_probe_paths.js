
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const tiers = {
    'Sovereign (D:)': 'D:\\sovereign',
    'Home (~/)': join(homedir(), '.pog2-sovereign')
};

for (const [name, root] of Object.entries(tiers)) {
    console.log(`--- Checking ${name}: ${root} ---`);
    const interactions = join(root, 'training', 'interactions');
    const fprag = join(root, 'training', 'fprag');
    console.log('Interactions:', interactions, 'Exists?', existsSync(interactions));
    console.log('FPRAG:', fprag, 'Exists?', existsSync(fprag));
}
