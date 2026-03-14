console.log('--- SCRIPT STARTING ---');
import { google } from 'googleapis';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

async function testYouTube() {
    console.log('🚀 Starting Test...');
    
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const apiKey = process.env.YOUTUBE_API_KEY;
    const tokenPath = 'D:\\sovereign\\youtube_token.json';

    console.log(`Checking Env: CLIENT_ID=${!!clientId}, SECRET=${!!clientSecret}, KEY=${!!apiKey}`);
    if (!clientId || !clientSecret || !apiKey) {
        console.error('❌ Missing credentials in .env');
        process.exit(1);
    }

    if (!existsSync(tokenPath)) {
        console.error('❌ Token file not found at ' + tokenPath);
        process.exit(1);
    }

    try {
        const tokens = JSON.parse(readFileSync(tokenPath, 'utf8'));
        const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            'https://chromanumber-auth.kristain33rs.workers.dev/youtube/callback'
        );
        oauth2Client.setCredentials(tokens);

        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

        console.log('🔄 Fetching user playlists as a test...');
        const res = await youtube.playlists.list({
            part: ['snippet'],
            mine: true,
            maxResults: 5
        });

        console.log(`✅ Success! Found ${res.data.items?.length || 0} playlists.`);
        if (res.data.items && res.data.items.length > 0) {
            console.log('Playlist titles:');
            res.data.items.forEach(p => console.log(` - ${p.snippet?.title}`));
        }

    } catch (err: any) {
        console.error('❌ Connection failed:');
        console.error(err.message);
        if (err.response) {
            console.error('API Error Response:', JSON.stringify(err.response.data, null, 2));
        }
        process.exit(1);
    }
}

testYouTube();
