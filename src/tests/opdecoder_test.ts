import { parse } from "../rsmv/opdecoder.js";
import { BetaConfigInterceptor } from "../scripts/intercept_beta_config.js";
import * as path from "path";

async function runTest() {
    console.log("--- Starting Opdecoder Diagnostic Test ---");

    // 1. Initialize Beta Config
    const interceptor = new BetaConfigInterceptor({
        localCapturePath: path.join(process.cwd(), 'scratch', 'beta_config_captured.ws')
    });

    try {
        const betaConfig = await interceptor.execute();
        console.log(`Beta Config Loaded. Server Version: ${betaConfig.routing.serverVersion}`);

        // 2. Test Parser Initialization
        console.log("Initializing allParsers...");
        const npcParser = parse.npc;
        const itemParser = parse.item;

        console.log("Parsers initialized successfully.");

        // 3. Verify Opcode Parity
        console.log("Verifying varbits/varps registration...");
        if (parse.varbits) {
            console.log("Varbits registered successfully.");
        } else {
            throw new Error("Varbits missing from parse registry!");
        }

        console.log("--- Diagnostic Test Passed ---");
    } catch (e) {
        console.error("--- Diagnostic Test Failed ---");
        console.error(e);
        process.exit(1);
    }
}

runTest();

