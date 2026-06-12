import * as fs from "fs";

async function main() {
    const filePath = "C:\\ProgramData\\Jagex\\launcher\\BETA\\rs2client.exe";
    const buf = fs.readFileSync(filePath);
    
    const target = 4732;
    const targetBuf = Buffer.alloc(4);
    targetBuf.writeUInt32LE(target);
    
    let offset = -1;
    while ((offset = buf.indexOf(targetBuf, offset + 1)) !== -1) {
        console.log(`Found 4732 at offset 0x${offset.toString(16)}`);
    }
}

main();
