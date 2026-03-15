
import { existsSync, statSync } from 'fs';

function hasSovereignDrive() {
    try {
        console.log("Checking existsSync('D:\\\\')...");
        const exists = existsSync('D:\\');
        console.log("Result:", exists);
        if (!exists) return false;

        console.log("Checking statSync('D:\\\\')...");
        const stat = statSync('D:\\');
        const isDir = stat.isDirectory();
        console.log("Is Directory?", isDir);
        return isDir;
    } catch (e) {
        console.log("Error:", e.message);
        return false;
    }
}

const result = hasSovereignDrive();
console.log("Final hasSovereignDrive result:", result);

if (!result) {
    console.log("Trying without trailing slash: hasSovereignDrive('D:')");
    try {
        console.log("Checking existsSync('D:')...");
        console.log("Result:", existsSync('D:'));
    } catch(e) {}
}
