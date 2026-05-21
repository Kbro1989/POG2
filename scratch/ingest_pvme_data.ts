import { PVMEIngester } from '../src/utils/PVMEIngester.js';

const BOSSES = [
    'Nex',
    'Vorago',
    'Araxxi',
    'Telos, the Warden',
    'Solak',
    'Raksha, the Shadow Colossus',
    'Kerapac, the Bound'
];

async function main() {
    console.log("Starting PVME Data Ingestion...");
    await PVMEIngester.ingestBosses(BOSSES);
    console.log("PVME Data Ingestion Complete!");
}

main().catch(console.error);
