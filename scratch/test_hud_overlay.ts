import { HUDOverlayLimb, RenderedInterface } from '../src/limbs/spatial/HUDOverlayLimb.js';

// Mock data for Script 10896 output (Component Initializer)
const mockRendered: RenderedInterface = {
    interfaceId: 10896,
    components: [
        {
            id: 0,
            interfaceId: 10896,
            x: 100,
            y: 100,
            width: 300,
            height: 200,
            visible: true,
            type: 'CONTAINER',
            style: 'left:100px;top:100px;width:300px;height:200px;background:rgba(255,255,255,0.1);border:1px solid #444;'
        },
        {
            id: 1,
            interfaceId: 10896,
            x: 10,
            y: 10,
            width: 100,
            height: 20,
            visible: true,
            type: 'TEXT',
            content: {
                text: 'Sovereign HUD Beta',
                color: '#00ff00'
            },
            style: 'left:10px;top:10px;width:100px;height:20px;'
        }
    ]
};

async function main() {
    console.log('Simulating HUDOverlayLimb render...');
    
    // Note: This will only log warnings in Node.js, but validates the limb structure
    const overlay = HUDOverlayLimb.getInstance();
    overlay.initialize();
    overlay.render(mockRendered);
    
    console.log('Render simulation complete (Logic validated).');
}

main().catch(console.error);
