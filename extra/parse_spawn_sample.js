const fs = require('fs');

try {
  const data = fs.readFileSync('extra/authentic_spawn_manifest.json', 'utf8');
  // Just parse the first 1000 characters to get a sample, 
  // as the full file is huge. 
  // This helps identify the top-level structure without loading it all.
  const sample = data.substring(0, 1000); 
  console.log('--- Sample Content ---');
  console.log(sample);
} catch (err) {
  console.error('Error reading file:', err);
}
