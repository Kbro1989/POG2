import { WorldGroundingLimb } from '../limbs/world_grounding/WorldGroundingLimb.js';
import { ServerLogicRegistry } from '../engines/gameplay/ServerLogicRegistry.js';
import chalk from 'chalk';

/**
 * trace_provenance.ts â€” Forensic Audit Utility
 * Resolves any Entity ID to its Clinical Substrate Trace.
 */
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log(chalk.yellow('Usage: npx tsx src/scripts/trace_provenance.ts <entity_id>'));
        console.log(chalk.gray('Example: npx tsx src/scripts/trace_provenance.ts npc_50'));
        return;
    }

    const entityId = args[0]!;
    const [type, id] = entityId.split('_');
    
    console.log(chalk.cyan(`\nðŸ” Performing Forensic Trace for [${entityId}]...`));

    const grounding = WorldGroundingLimb.getInstance();
    const entry = grounding.getEntry(entityId);

    if (entry && entry.provenance) {
        console.log(chalk.green('âœ… Source Found in Manifest:'));
        renderProvenance(entry.provenance);
    } else {
        console.log(chalk.yellow('âš ï¸  No historical provenance found in manifest.'));
        console.log(chalk.gray('Resolving canonical substrate default...'));

        const canonical = ServerLogicRegistry.getCanonicalProvenance(
            (type || 'OTHER').toUpperCase() as any,
            id || '0'
        );
        renderProvenance(canonical);
    }
}

function renderProvenance(prov: any) {
    console.log(chalk.white(`  Source Type : `) + chalk.magenta(prov.source));
    console.log(chalk.white(`  Major Index : `) + chalk.magenta(prov.major));
    console.log(chalk.white(`  Minor Index : `) + chalk.magenta(prov.minor ?? '0'));
    console.log(chalk.white(`  Record ID   : `) + chalk.magenta(prov.recordId));
    console.log(chalk.white(`  Substrate   : `) + chalk.gray(prov.path || 'Unknown'));
    console.log(chalk.white(`  Last Audit  : `) + chalk.gray(new Date(prov.timestamp).toLocaleString()));
    
    if (prov.ancestry && prov.ancestry.length > 0) {
        console.log(chalk.cyan('\n  Ancestry Chain:'));
        prov.ancestry.forEach((ancestor: any, idx: number) => {
            console.log(chalk.gray(`    ${idx + 1}. ${ancestor.source} (${new Date(ancestor.timestamp).toLocaleDateString()})`));
        });
    }
    console.log('');
}

main().catch(err => {
    console.error(chalk.red('\nâœ˜ Forensic Audit Failed:'), err);
    process.exit(1);
});
