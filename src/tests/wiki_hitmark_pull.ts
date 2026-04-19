import fs from 'fs';

async function fetchWikiHitmarks() {
    console.log("Fetching Hitmark information from RS3 Wiki...");
    // The main article is usually "Hitsplat" or "Hitmark". Let's query the wikitext for "Hitmarks"
    const url = "https://runescape.wiki/api.php?action=query&prop=revisions&rvprop=content&titles=Hitsplats&format=json";
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const pages = data.query.pages;
        let content = "";
        for (let p in pages) {
            if (pages[p].revisions) {
                content = pages[p].revisions[0]['*'];
            }
        }
        
        fs.writeFileSync('wiki_hitsplats_raw.txt', content);
        
        // Also fetch images in the Hitsplats category if possible
        const imgUrl = "https://runescape.wiki/api.php?action=query&list=categorymembers&cmtitle=Category:Hitsplat_images&cmlimit=500&format=json";
        const imgResponse = await fetch(imgUrl);
        const imgData = await imgResponse.json();
        
        if (imgData.query && imgData.query.categorymembers) {
            fs.writeFileSync('wiki_hitsplats_images.json', JSON.stringify(imgData.query.categorymembers, null, 2));
            console.log(`Found ${imgData.query.categorymembers.length} hitsplat images in category.`);
        } else {
            console.log("No category members found for Hitsplat_images, let's search via File usage.");
        }
        
        console.log("Done extracting Wiki data.");
    } catch (e) {
        console.error("Failed to fetch Wiki data: ", e);
    }
}

fetchWikiHitmarks();
