import { InterfaceRuntimeLimb } from '../src/limbs/spatial/InterfaceRuntimeLimb.js';

async function main() {
    const limb = new InterfaceRuntimeLimb();
    // We will bypass full initialization for the moment since calibrator needs more memory
    try {
        await limb.initialize();
        // Interface 742 is the world map / HUD? Or use interface 703? The user's script is 10896 with [703:50, 703:51, 28556].
        // Let's test interface 703.
        const rendered = await limb.bootstrapInterface(703);
        console.log(`Rendered interface 703 with ${rendered.components.length} components.`);
    } catch (e) {
        console.error('Initialization failed', e);
    }
}

main();
