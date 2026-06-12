import { HexagramNetworkBridge } from '../src/limbs/technical/HexagramNetworkBridge.js';

async function main() {
    console.log("=== Hexagram Network Bridge (BETA Handshake Test) ===");
    
    const bridge = new HexagramNetworkBridge();
    
    console.log("\nAttempting connection...");
    const success = await bridge.connect();
    
    if (success) {
        console.log("\n[SUCCESS] JS5 Handshake completed in simulate mode.");
        console.log("Protocol fingerprint and Beta Identity validated.");
        
        // Try requesting a cache file
        console.log("\nRequesting Cache File (index: 255, file: 255)...");
        await bridge.requestCacheFile(255, 255);
        console.log("Simulation complete.");
    } else {
        console.error("\n[FAILED] JS5 Handshake failed.");
    }
}

main().catch(console.error);
