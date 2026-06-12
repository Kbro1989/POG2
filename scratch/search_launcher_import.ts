
import * as fs from "fs";
import * as path from "path";

const binaryPath = "C:\\Program Files (x86)\\Jagex Launcher\\JagexLauncher.exe";

async function search() {
    const searchTerm = Buffer.from("import");
    const buffer = fs.readFileSync(binaryPath);
    
    let index = 0;
    while ((index = buffer.indexOf(searchTerm, index)) !== -1) {
        const context = buffer.slice(Math.max(0, index - 20), Math.min(buffer.length, index + 100)).toString('ascii').replace(/[^\x20-\x7E]/g, '.');
        console.log(`FOUND "import" at offset ${index}: ${context}`);
        index += searchTerm.length;
    }
}

search();
