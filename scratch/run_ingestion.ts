import { PVMEIngester } from "../src/utils/PVMEIngester";

async function main() {
    console.log("🚀 Initializing PVME Ingestion for TzKal-Zuk...");
    await PVMEIngester.ingestBosses(["TzKal-Zuk"]);
    console.log("✅ Ingestion complete!");
}

main().catch(console.error);
