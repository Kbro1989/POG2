import { WikiEnricher } from '../utils/WikiEnricher.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('WikiPlaceTest');

async function testPlacePull() {
    const place = 'Lumbridge';
    logger.info({ place }, 'Commencing Wiki pull for Place Test...');
    
    const result = await WikiEnricher.enrich(place);
    
    if (result.ok) {
        console.log('\n--- WIKI PLACE ENRICHMENT SUCCESS ---');
        console.log(`Title:    ${result.value.name}`);
        console.log(`Role:     ${result.value.role}`);
        console.log(`Race:     ${result.value.race || 'N/A'}`);
        console.log(`URL:      ${result.value.url}`);
        console.log('\n--- INTENT SUMMARY ---');
        console.log(result.value.intent);
        console.log('\n--- INFOBOX VARIABLES ---');
        console.log(JSON.stringify(result.value.variables, null, 2));
    } else {
        logger.error({ error: result.error }, 'Wiki API pull failed.');
    }
}

testPlacePull();

