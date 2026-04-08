import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { UISubstrateLimb } from '../src/limbs/technical/UISubstrateLimb.js';
import { createLogger } from '../src/utils/logger.js';

const logger = createLogger('GroundUIBlueprint');

async function main() {
    const uiLimb = UISubstrateLimb.getInstance();
    const candidatesPath = 'audit_output/js5-3/hud_candidates.json';

    if (!existsSync(candidatesPath)) {
        logger.error({ path: candidatesPath }, 'HUD candidates file missing. Aborting grounding.');
        process.exit(1);
    }

    const data = JSON.parse(readFileSync(candidatesPath, 'utf8'));
    logger.info({ count: data.length }, 'Commencing HUD substrate grounding...');

    let groundedCount = 0;
    for (const candidate of data) {
        const result = await uiLimb.groundUIComponent(candidate.id, candidate.hits);
        if (result.ok) {
            groundedCount++;
        }
    }

    logger.info({ groundedCount }, 'HUD Substrate Grounding Complete.');
}

main().catch(err => {
    logger.error({ err }, 'HUD Grounding Script Failed.');
    process.exit(1);
});
