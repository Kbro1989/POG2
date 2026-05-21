import * as fs from "fs";

async function main() {
    const filePath = "C:\\ProgramData\\Jagex\\launcher\\BETA\\rs2client.exe";
    const buf = fs.readFileSync(filePath);
    
    const offset = 0x5bb4d3;
    console.log(`Hex around 0x${offset.toString(16)}:`);
    console.log(buf.slice(offset - 32, offset + 32).toString("hex"));
}

main();
