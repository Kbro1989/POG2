import { WorldGroundingLimb } from '../limbs/world_grounding/WorldGroundingLimb.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * visualize_deltas.ts
 * 
 * Generates a Delta Visualization report from the Grounding Manifest.
 */
async function main() {
    const grounding = WorldGroundingLimb.getInstance();
    const manifest = grounding.getManifest();
    const entities = Object.entries(manifest.entities);

    let report = '# ðŸ“Š Sovereign Grounding: Delta Visualization Report\n\n';
    report += `**Total Grounded Entities:** ${entities.length}\n`;
    report += `**Generation Timestamp:** ${new Date().toLocaleString()}\n\n`;

    const deltas = entities.filter(([_, e]: [string, any]) => e.deltas && e.deltas.length > 0) as [string, any][];
    const perfectMatches = entities.length - deltas.length;

    report += `## ðŸ“ˆ Summary Statistics\n`;
    report += `- âœ… **Perfect Matches:** ${perfectMatches} (${((perfectMatches / entities.length) * 100).toFixed(1)}%)\n`;
    report += `- ðŸ§¬ **Hallucination Corrections:** ${deltas.length} (${((deltas.length / entities.length) * 100).toFixed(1)}%)\n`;
    report += `- ðŸš© **Total Deviations Detected:** ${deltas.reduce((acc, [_, e]: [string, any]) => acc + e.deltas.length, 0)}\n\n`;

    report += `## ðŸš© Hallucination Clusters (Significant Deviations)\n\n`;
    report += `| Entity ID | Name (Vibe) | Name (Truth) | Deviations | Confidence |\n`;
    report += `| :--- | :--- | :--- | :--- | :--- |\n`;

    for (const [id, entry] of deltas) {
        const nameDelta = (entry as any).deltas.find((d: any) => d.path === '$.name');
        const vibeName = nameDelta ? nameDelta.original : '---';
        const truthName = nameDelta ? nameDelta.grounded : '---';
        
        report += `| ${id} | ${vibeName} | ${truthName} | ${(entry as any).deltas.length} | ${(entry as any).grounded.confidence.toFixed(2)} |\n`;
    }

    report += `\n## ðŸ§¬ Detailed Lineage Audit\n\n`;
    for (const [id, entry] of deltas) {
        report += `### Entity: ${id}\n`;
        report += `**Source:** ${(entry as any).grounded.authoritativeSource}\n\n`;
        report += `| Path | Vibe (Old) | Truth (New) | Reason |\n`;
        report += `| :--- | :--- | :--- | :--- |\n`;
        for (const d of (entry as any).deltas) {
            report += `| \`${d.path}\` | \`${d.original}\` | \`${d.grounded}\` | ${d.reason} |\n`;
        }
        report += `\n---\n`;
    }

    const outputPath = 'D:/sovereign/logs/grounding_audit_report.md';
    writeFileSync(outputPath, report);
    console.log(`âœ… Delta Visualization Report generated at: ${outputPath}`);
}

main().catch(console.error);
