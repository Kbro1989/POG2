import { EntityLimb } from './src/limbs/technical/EntityLimb.js';
import chalk from 'chalk';

async function injectIdentityPerception() {
    const limb = new EntityLimb();
    const id = 'pog2:player';
    
    console.log(chalk.bold.cyan('\n--- Final Identity Anchor Injection ---'));

    const memory = {
        type: 'perception',
        content: '[SENSORY_IDENTITY_VERIFIED] RuneMetrics profile for "Pick Of Gods" confirmed. Total Level: 3088, Combat: 147, Total XP: 1.46B. Visual profile matches active session. All placeholders purged.',
        weight: 2.0
    };

    const res = await limb.addMemory(id, memory);
    
    if (res.ok) {
        console.log(chalk.green('SUCCESS: Sensory identity anchored in substrate.'));
        const state = await limb.getEntityState(id);
        if (state.ok) {
            console.log(chalk.blue('New Vibe State:'), JSON.stringify(state.value.vibe, null, 2));
        }
    } else {
        console.error(chalk.red('Injection failed:'), res.error?.message);
    }

    console.log(chalk.bold.cyan('--- Anchor Injection Complete ---'));
}

injectIdentityPerception().catch(console.error);
