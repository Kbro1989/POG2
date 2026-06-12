
import fetch from "node-fetch";
import * as fs from "fs";
import * as path from "path";

const urls = [
    "http://www.runescape.com/jav_config_beta.ws",
    "https://www.runescape.com/jav_config_beta.ws",
    "http://secure.runescape.com/jav_config_beta.ws",
    "https://secure.runescape.com/jav_config_beta.ws",
    "http://world1.runescape.com/jav_config_beta.ws",
    "https://world1.runescape.com/jav_config_beta.ws",
    "http://world3.runescape.com/jav_config_beta.ws",
    "https://world3.runescape.com/jav_config_beta.ws",
    "http://www.runescape.com/jav_config_beta.ws?binaryType=2",
    "https://www.runescape.com/jav_config_beta.ws?binaryType=2"
];

async function test() {
    for (const url of urls) {
        console.log(`Testing: ${url}`);
        try {
            const res = await fetch(url, {
                headers: {
                    "User-Agent": "JagexLauncher/1.0"
                },
                timeout: 5000
            } as any);
            console.log(`Status: ${res.status}`);
            if (res.ok) {
                const body = await res.text();
                if (body.includes("server_version")) {
                    console.log(`SUCCESS! URL: ${url}`);
                    console.log(body);
                    fs.writeFileSync("scratch/beta_config_captured.ws", body);
                    return;
                } else {
                    console.log("Response OK but no server_version found.");
                    // console.log(body.substring(0, 100));
                }
            }
        } catch (e: any) {
            console.log(`Error: ${e?.message || String(e)}`);
        }
    }
}

test();
