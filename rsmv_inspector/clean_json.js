const fs = require('fs');
const readline = require('readline');

async function cleanConflict(inputPath, outputPath) {
    const fileStream = fs.createReadStream(inputPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const outStream = fs.createWriteStream(outputPath);
    let inConflict = false;
    let keepPart = false;

    for await (const line of rl) {
        if (line.startsWith('<<<<<<<')) {
            inConflict = true;
            keepPart = true;
            continue;
        }
        if (line.startsWith('=======')) {
            keepPart = false;
            continue;
        }
        if (line.startsWith('>>>>>>>')) {
            inConflict = false;
            keepPart = false;
            continue;
        }

        if (!inConflict || keepPart) {
            outStream.write(line + '\n');
        }
    }
    outStream.end();
}

cleanConflict(process.argv[2], process.argv[3])
    .then(() => console.log('Cleaned.'))
    .catch(console.error);
