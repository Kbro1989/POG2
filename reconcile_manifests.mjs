import fs from 'fs';
import path from 'path';

function reconcileJson(filePath: string) {
    console.log(`Reconciling: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Simple conflict resolver: keep HEAD
    // This removes conflict markers and accepts the HEAD version.
    let resolved = content
        .replace(/<<<<<<< HEAD\n([\s\S]*?)\n=======\n[\s\S]*?\n>>>>>>> [a-f0-9]*/g, '$1')
        .replace(/<<<<<<< HEAD\n([\s\S]*?)\n=======\n[\s\S]*?\n>>>>>>> HEAD/g, '$1');

    try {
        const parsed = JSON.parse(resolved);
        fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));
        console.log('Successfully reconciled.');
    } catch (e) {
        console.error('Failed to reconcile JSON:', e);
    }
}

const targets = [
    'D:\\sovereign\\memory\\pedagogy\\logic\\skill_manifest.json',
    'D:\\sovereign\\memory\\pedagogy\\logic\\quest_manifest.json'
];

targets.forEach(reconcileJson);
