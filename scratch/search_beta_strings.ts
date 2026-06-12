
import * as fs from "fs";
import * as path from "path";

const cacheDir = "C:\\ProgramData\\Jagex\\RuneScape-BETA";

async function search() {
    const files = fs.readdirSync(cacheDir);
    const searchTerm = Buffer.from("import save");
    const searchTerm2 = Buffer.from("import_save");

    for (const file of files) {
        const filePath = path.join(cacheDir, file);
        if (fs.statSync(filePath).isDirectory()) continue;

        console.log(`Searching in ${file}...`);
        const buffer = fs.readFileSync(filePath);
        
        let index = buffer.indexOf(searchTerm);
        if (index !== -1) {
            console.log(`FOUND "import save" in ${file} at offset ${index}`);
            console.log("Context:", buffer.slice(Math.max(0, index - 50), Math.min(buffer.length, index + 100)).toString('ascii').replace(/[^\x20-\x7E]/g, '.'));
        }

        index = buffer.indexOf(searchTerm2);
        if (index !== -1) {
            console.log(`FOUND "import_save" in ${file} at offset ${index}`);
            console.log("Context:", buffer.slice(Math.max(0, index - 50), Math.min(buffer.length, index + 100)).toString('ascii').replace(/[^\x20-\x7E]/g, '.'));
        }
    }
}

search();
