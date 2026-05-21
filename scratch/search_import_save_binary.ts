import * as fs from "fs";

async function main() {
    const filePath = "C:\\ProgramData\\Jagex\\launcher\\BETA\\rs2client.exe";
    const buf = fs.readFileSync(filePath);
    
    const searchPattern = Buffer.from("Import Save", "utf8");
    let offset = -1;
    while ((offset = buf.indexOf(searchPattern, offset + 1)) !== -1) {
        console.log(`Found "Import Save" at offset 0x${offset.toString(16)}`);
    }
}

main();
