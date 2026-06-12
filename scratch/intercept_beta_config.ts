
import { downloadServerConfig } from "./../rsmv/cache/downloader.js";
import * as fs from "fs";
import * as path from "path";
import { createLogger } from "../src/utils/logger.js";

const logger = createLogger('BetaInterceptor');

async function main() {
    const configURI = "rs-launch://www.runescape.com/jav_config_beta.ws";
    const outputFile = "beta_config_2026-05-06.json";

    logger.info(`Initiating protocol interception for: ${configURI}`);

    try {
        const config = await downloadServerConfig(configURI);

        // Ensure scratch directory exists
        const scratchDir = path.join(process.cwd(), "scratch");
        if (!fs.existsSync(scratchDir)) {
            fs.mkdirSync(scratchDir);
        }

        const outputPath = path.join(scratchDir, outputFile);
        fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));

        logger.info(`Successfully intercepted beta config DNA. Interception payload saved to: ${outputPath}`);

        // Log some key fields for immediate intelligence
        if (config.codebase) logger.info(`Codebase: ${config.codebase}`);
        if (config.server_address) logger.info(`Server Address: ${config.server_address}`);

    } catch (error) {
        logger.error(`Protocol interception failed: ${error}`);
        process.exit(1);
    }
}

main();
