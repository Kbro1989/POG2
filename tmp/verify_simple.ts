import { readFileSync } from 'fs';

async function verify() {
    console.log('--- YouTube Light Verification ---');
    
    const apiKey = process.env.YOUTUBE_API_KEY;
    const tokenPath = 'D:\\sovereign\\youtube_token.json';
    
    if (!apiKey) {
        console.error('❌ YOUTUBE_API_KEY missing in .env');
        process.exit(1);
    }

    // 1. Verify API Key
    console.log('🔍 Testing API Key...');
    try {
        const catRes = await fetch(`https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=US&key=${apiKey}`);
        const catData = await catRes.json();
        if (catData.items) {
            console.log(`✅ API Key Valid. Found ${catData.items.length} categories.`);
        } else {
            console.error('❌ API Key Error:', catData.error?.message || 'Unknown error');
        }
    } catch (e) {
        console.error('❌ API Key Request Failed:', e.message);
    }

    // 2. Verify OAuth Token
    console.log('\n🔍 Testing OAuth Access Token...');
    try {
        const token = JSON.parse(readFileSync(tokenPath, 'utf8'));
        const chanRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&mine=true', {
            headers: { 'Authorization': `Bearer ${token.access_token}` }
        });
        const chanData = await chanRes.json();
        
        if (chanData.items && chanData.items.length > 0) {
            console.log(`✅ Token Valid. Authenticated as: ${chanData.items[0].snippet.title} (${chanData.items[0].id})`);
        } else if (chanData.error) {
            console.error('❌ Token Error:', chanData.error.code, chanData.error.message);
            if (chanData.error.code === 401) {
                console.log('💡 Access token might be invalid or expired. The Limb will handle refreshing.');
            }
        } else {
            console.log('❓ No channel found. Scope might be too restrictive for this check.');
        }
    } catch (e) {
        console.error('❌ Token Verification Failed:', e.message);
    }
}

verify();
