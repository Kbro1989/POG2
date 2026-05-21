
import * as fs from "fs";
import * as path from "path";

const binaryPath = "C:\\ProgramData\\Jagex\\launcher\\BETA\\rs2client.exe";

async function search() {
    const searchTerm = Buffer.from("jav_config_beta");
    const buffer = fs.readFileSync(binaryPath);
    
    let index = 0;
    while ((index = buffer.indexOf(searchTerm, index)) !== -1) {
        const context = buffer.slice(Math.max(0, index - 50), Math.min(buffer.length, index + 100)).toString('ascii').replace(/[^\x20-\x7E]/g, '.');
        console.log(`FOUND "jav_config_beta" at offset ${index}`);
        console.log("Context:", context);
        index += searchTerm.length;
    }
}

search();
