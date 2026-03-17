const fs = require('fs');
const path = require('path');

const CONFIG = {
  inputFile: 'C:\\Users\\Destiny\\Desktop\\projects\\OKComputer_rebuild my app for me\\webviewer.js.txt',
  outputDir: './webviewer-deconstructed',
  prettify: true,
};

if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

console.log('Reading ' + CONFIG.inputFile + '...');
const bundleContent = fs.readFileSync(CONFIG.inputFile, 'utf8');

const MODULE_PATTERN = /(\d+):\s*\(([^)]*?)\)\s*=>\s*\{([\s\S]*?)(?=(?:\d+:\s*\([^)]*\)\s*=>\s*\{|\}\s*,\s*\d+:\s*\([^)]*\)\s*=>\s*\{|\}\s*\}\s*\(\s*self\s*\)))/g;

const modules = [];
let match;
let moduleCount = 0;

while ((match = MODULE_PATTERN.exec(bundleContent)) !== null) {
  modules.push({
    id: match[1],
    params: match[2].trim(),
    body: match[3].trim(),
    size: match[3].length,
  });
  moduleCount++;
  if (moduleCount % 100 === 0) {
    console.log('Parsed ' + moduleCount + ' modules...');
  }
}

console.log('\\n✓ Found ' + modules.length + ' modules');

const analysis = {
  totalModules: modules.length,
  totalSize: 0,
  categories: {
    'json-comment-parser': [],
    'property-descriptor': [],
    'syntax-error': [],
    'lodash-style': [],
    'core-js': [],
    'unidentified': []
  },
  largeModules: [],
  tinyModules: []
};

modules.forEach(mod => {
  analysis.totalSize += mod.size;
  if (mod.body.includes('json') && mod.body.includes('comment')) {
    analysis.categories['json-comment-parser'].push(mod);
  } else if (mod.body.includes('defineProperty') || mod.body.includes('getOwnPropertyDescriptor')) {
    analysis.categories['property-descriptor'].push(mod);
  } else if (mod.body.includes('SyntaxError') || mod.body.includes('Unexpected token')) {
    analysis.categories['syntax-error'].push(mod);
  } else if (mod.body.includes('lodash') || mod.body.includes('isArray') && mod.body.includes('isObject')) {
    analysis.categories['lodash-style'].push(mod);
  } else if (mod.body.includes('core-js') || mod.body.includes('es.')) {
    analysis.categories['core-js'].push(mod);
  } else {
    analysis.categories['unidentified'].push(mod);
  }
  if (mod.size > 50000) {
    analysis.largeModules.push({ id: mod.id, size: mod.size });
  }
  if (mod.size < 100) {
    analysis.tinyModules.push({ id: mod.id, size: mod.size });
  }
});

const reportPath = path.join(CONFIG.outputDir, '_analysis-report.json');
fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
console.log('\\n✓ Analysis report written to ' + reportPath);

console.log('\\nWriting module files...');

modules.forEach((mod, index) => {
  const categoryEntry = Object.entries(analysis.categories).find(([_, arr]) => arr.includes(mod));
  const category = categoryEntry ? categoryEntry[0] : 'unidentified';
  
  const categoryDir = path.join(CONFIG.outputDir, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }
  
  let formattedBody = mod.body;
  if (CONFIG.prettify) {
    formattedBody = mod.body
      .replace(/;/g, ';\n')
      .replace(/{/g, ' {\n  ')
      .replace(/}/g, '\n}\n')
      .replace(/,/g, ', ')
      .replace(/\n\s*\n/g, '\n');
  }
  
  const fileContent = '// Module ID: ' + mod.id + '\n// Category: ' + category + '\n// Size: ' + mod.size + ' bytes\n// Parameters: ' + mod.params + '\n\n' + formattedBody + '\n';
  const fileName = 'module-' + mod.id.padStart(4, '0') + '.js';
  const filePath = path.join(categoryDir, fileName);
  
  fs.writeFileSync(filePath, fileContent);
});

const LICENSE_PATTERN = /\/\*!\s*For license information please see\s*([^\s*]+)\s*\*\//;
const licenseMatch = bundleContent.match(LICENSE_PATTERN);

if (licenseMatch) {
  console.log('\\n✓ License reference found: ' + licenseMatch[1]);
  const licenseContent = 'License Information\\n===================\\n\\nThis bundle contains code from various sources.\\nOriginal license file reference: ' + licenseMatch[1] + '\\n';
  fs.writeFileSync(path.join(CONFIG.outputDir, '_LICENSE-NOTES.md'), licenseContent);
}

const reconstructionInfo = '# Module Reconstruction Information\\n\\n## Summary\\n- Total Modules: ' + analysis.totalModules + '\\n- Total Size: ' + (analysis.totalSize / 1024 / 1024).toFixed(2) + ' MB\\n\\n## Categories\\n' + Object.entries(analysis.categories).map(([name, arr]) => '- ' + name + ': ' + arr.length + ' modules').join('\\n') + '\\n';

fs.writeFileSync(path.join(CONFIG.outputDir, '_RECONSTRUCTION.md'), reconstructionInfo);

console.log('\\n✓ Deconstruction complete!');
console.log('\\n📂 Output directory: ' + CONFIG.outputDir);
console.log('📊 ' + modules.length + ' modules organized into categories');
