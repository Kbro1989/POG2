const fs = require('fs');

function reconcileJson(filePath) {
    console.log(`Reconciling: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // More robust multi-pass cleaner to strip markers that were causing syntax errors
    let resolved = content
        .replace(/<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n([\s\S]*?)\r?\n>>>>>>> [a-f0-9]*/g, '$2'); // Keep the BRANCH side (2)

    try {
        const parsed = JSON.parse(resolved);
        fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));
        console.log('Successfully reconciled.');
    } catch (e) {
        console.error('Failed to reconcile JSON, manual intervention needed at marker:', e.message);
    }
}

const targets = [
    'D:\\sovereign\\memory\\pedagogy\\logic\\skill_manifest.json',
    'D:\\sovereign\\memory\\pedagogy\\logic\\quest_manifest.json'
];

targets.forEach(reconcileJson);
