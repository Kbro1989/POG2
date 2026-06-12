import * as fs from "fs";

function findPattern(buf: Buffer, pattern: string) {
    const results = [];
    const p = Buffer.from(pattern, "utf8");
    let offset = -1;
    while ((offset = buf.indexOf(p, offset + 1)) !== -1) {
        results.push({ offset, type: "ASCII" });
    }
    
    const p16 = Buffer.from(pattern, "utf16le");
    offset = -1;
    while ((offset = buf.indexOf(p16, offset + 1)) !== -1) {
        results.push({ offset, type: "UTF-16LE" });
    }
    return results;
}

async function main() {
    const filePath = "C:\\ProgramData\\Jagex\\launcher\\BETA\\rs2client.exe";
    const buf = fs.readFileSync(filePath);
    
    console.log("Searching for 'Import Save'...");
    console.log(findPattern(buf, "Import Save"));
    
    console.log("Searching for 'ImportSave'...");
    console.log(findPattern(buf, "ImportSave"));
    
    console.log("Searching for 'import save'...");
    console.log(findPattern(buf, "import save"));
}

main();
