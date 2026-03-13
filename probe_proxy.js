
async function probeProxy() {
    const endpoints = [
        'https://chromanumber-api.kristain33rs.workers.dev/ai/generate-audio',
        'https://chromanumber-api.kristain33rs.workers.dev/ai/tts',
        'https://chromanumber-api.kristain33rs.workers.dev/ai/run/@cf/myshell-ai/melotts'
    ];

    for (const url of endpoints) {
        console.log(`Probing: ${url}`);
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: 'test' })
            });
            console.log(`Status: ${res.status} ${res.statusText}`);
            if (res.ok) {
                console.log(`SUCCESS on ${url}`);
                const data = await res.text();
                console.log(`Response snippet: ${data.slice(0, 100)}`);
            }
        } catch (e) {
            console.log(`Failed: ${url}`);
        }
    }
}

probeProxy();
