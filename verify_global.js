
const accountId = '6872653edcee9c787c1b783173793';
const apiToken = 'BKPBdQcDbG4PQLnNo7nsZdYTdzC2CzROmWJCIYks';
const emails = [
    'destiny@pickofgods.com',
    'destiny.pog@gmail.com', // Common fallback
    'pick@pickofgods.com'
];

async function verifyGlobal() {
    for (const email of emails) {
        console.log(`--- Testing Global Key with Email: ${email} ---`);
        try {
            const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3-8b-instruct`, {
                method: 'POST',
                headers: {
                    'X-Auth-Email': email,
                    'X-Auth-Key': apiToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: 'hi' })
            });

            console.log('Status:', res.status, res.statusText);
            if (res.status === 200) {
                console.log('SUCCESS with email:', email);
                return;
            } else {
                console.log('Error Body:', await res.text());
            }
        } catch (e) { console.error('Fetch failed:', e); }
    }
}

verifyGlobal();
