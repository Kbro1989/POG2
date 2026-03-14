
import { ClinicalAuditTool } from './src/utils/ClinicalAuditTool.js';
import { Renderer } from './src/ui/Renderer.js';
import { resolve } from 'path';

async function main() {
    const auditor = new ClinicalAuditTool();
    const renderer = new Renderer();
    
    renderer.info('Starting Clinical Audit of src/ directory...');
    const result = await auditor.auditDirectory(resolve('src'));
    
    if (result.ok) {
        process.stdout.write(auditor.formatReport(result.value));
    } else {
        renderer.error('Audit failed: ' + result.error.message);
    }
}

main().catch(console.error);
