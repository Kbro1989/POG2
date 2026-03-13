
const accountId = '6872653edcee9c787c1b783173793';
const apiToken = 'BKPBdQcDbG4PQLnNo7nsZdYTdzC2CzROmWJCIYks';
const email = 'destiny@pickofgods.com'; // Guess based on usual patterns

async function verifyAccess() {
    console.log('--- Verification Phase: Scoped Token ---');
    try {
        const res = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
            headers: { 'Authorization': `Bearer ${apiToken}` }
        });
        console.log('Token Verify Status:', res.status);
        console.log('Token Verify Data:', await res.json());
    } catch (e) { console.error('Bearer failed:', e); }

    console.log('\n--- Verification Phase: Models List (Bearer) ---');
    try {
        const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/models`, {
            headers: { 'Authorization': `Bearer ${apiToken}` }
        });
        console.log('AI Models Status:', res.status);
        if (res.status === 200) {
            const data = await res.json();
            console.log('Found', data.result.length, 'models');
        } else {
            console.log('Error Body:', await res.text());
        }
    } catch (e) { console.error('Models fetch failed:', e); }
}

verifyAccess();
