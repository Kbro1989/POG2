import * as fs from "fs";

async function main() {
    const filePath = "C:\\ProgramData\\Jagex\\launcher\\BETA\\rs2client.exe";
    const buf = fs.readFileSync(filePath);
    
    const searchPattern = Buffer.from("I\0m\0p\0o\0r\0t\0 \0S\0a\0v\0e\0", "binary");
    let offset = -1;
    while ((offset = buf.indexOf(searchPattern, offset + 1)) !== -1) {
        console.log(`Found "Import Save" (UTF-16) at offset 0x${offset.toString(16)}`);
    }
}

main();
