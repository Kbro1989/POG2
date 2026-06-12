
import * as fs from "fs";
import * as path from "path";

const binaryPath = "C:\\ProgramData\\Jagex\\launcher\\BETA\\rs2client.exe";

async function search() {
    const searchTerm = Buffer.from("import");
    const buffer = fs.readFileSync(binaryPath);
    
    let index = 0;
    while ((index = buffer.indexOf(searchTerm, index)) !== -1) {
        const context = buffer.slice(Math.max(0, index - 20), Math.min(buffer.length, index + 100)).toString('ascii');
        if (context.toLowerCase().includes("save")) {
            console.log(`FOUND potential "import save" match at offset ${index}`);
            console.log("Context:", context.replace(/[^\x20-\x7E]/g, '.'));
        }
        index += searchTerm.length;
    }
}

search();
