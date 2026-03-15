import pino from 'pino';
// @ts-ignore â€” googleapis types are bundled but TS can lag on resolution
import { google, youtube_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createReadStream, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';
import { type Result, ok } from '../../core/models.js';
import { getSovereignRoot } from '../../utils/SovereignPathResolver.js';
import http from 'http';
import url from 'url';

const logger = pino({ name: 'YouTubeLimb', base: { hostname: 'POG2' } });

// â•â•â• YouTube Upload Config â•â•â•
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
const REDIRECT_URI = 'https://chromanumber-auth.kristain33rs.workers.dev/youtube/callback';
const TOKEN_PATH = join(getSovereignRoot(), 'youtube_token.json');

export interface YouTubeUploadRequest {
    videoPath: string;
    title: string;
    description: string;
    tags?: string[];
    categoryId?: string;       // YouTube category (22 = People & Blogs, 27 = Education)
    privacyStatus?: 'public' | 'unlisted' | 'private';
    thumbnailPath?: string;
    playlistTitle?: string;
    containsSyntheticMedia?: 'Yes' | 'No' | 'Undeclared';
    videoAgeGating?: { restricted: boolean }; // Marks adult content appropriately
}

export interface YouTubeUploadResult {
    videoId: string;
    videoUrl: string;
    playlistId?: string;
}

export class YouTubeLimb {
    private oauth2Client: OAuth2Client;
    private youtube: youtube_v3.Youtube | null = null;

    constructor(
        private readonly clientId: string,
        private readonly clientSecret: string,
        private readonly apiKey: string,
        private readonly accessToken?: string
    ) {
        this.oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            REDIRECT_URI
        );

        if (this.accessToken) {
            this.oauth2Client.setCredentials({ access_token: this.accessToken });
            this.youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
            logger.info('YouTube: Using provided access token.');
        } else if (existsSync(TOKEN_PATH)) {
            try {
                const tokenStr = readFileSync(TOKEN_PATH, 'utf8');
                if (tokenStr && tokenStr.trim()) {
                    const token = JSON.parse(tokenStr);
                    if (token) {
                        this.oauth2Client.setCredentials(token);
                        this.youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
                        logger.info('YouTube: Loaded saved OAuth token.');
                    }
                }
            } catch (err) {
                logger.warn({ err }, 'YouTube: Failed to load saved token. Re-auth required.');
            }
        }
    }

    public healthCheck(): { online: boolean; details?: string } {
        return {
            online: this.isAuthenticated(),
            details: this.isAuthenticated() ? 'Authenticated' : 'Auth Required'
        };
    }

    /**
     * Checks if we have a valid, non-expired token.
     */
    public isAuthenticated(): boolean {
        const creds = this.oauth2Client?.credentials;
        if (!creds) return false;
        return typeof (creds as any).access_token === 'string' || typeof (creds as any).id_token === 'string';
    }

    /**
     * Initiates the OAuth2 flow via Cloudflare-hosted callback.
     * Polls the chromanumber-auth worker for the authorization code.
     */
    public async authenticate(): Promise<Result<string>> {
        if (this.isAuthenticated()) {
            // Check if token needs refresh
            const creds = this.oauth2Client.credentials;
            if (creds.expiry_date && creds.expiry_date < Date.now()) {
                try {
                    const { credentials } = await this.oauth2Client.refreshAccessToken();
                    this.oauth2Client.setCredentials(credentials);
                    this.saveToken(credentials);
                    this.youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
                    return ok('Token refreshed successfully.');
                } catch (err) {
                    logger.warn({ err }, 'Token refresh failed. Re-authenticating...');
                }
            } else {
                this.youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
                return ok('Already authenticated.');
            }
        }

        const authUrl = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent'
        });

        logger.info({ authUrl }, 'YouTube: Visit this URL to authenticate.');
        console.log('\nâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
        console.log('  YouTube Authentication Required');
        console.log('  Visit this URL in your browser:');
        console.log(`  ${authUrl}`);
        console.log('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');

        // Try to open in browser automatically
        try {
            const { execSync } = await import('child_process');
            execSync(`start "" "${authUrl}"`, { stdio: 'ignore' });
        } catch { /* User can open manually */ }

        // Poll Cloudflare worker for the auth code
        const POLL_URL = 'https://chromanumber-auth.kristain33rs.workers.dev/youtube/code';
        const MAX_POLLS = 60; // 3 minutes max
        const POLL_INTERVAL = 3000; // 3 seconds

        for (let i = 0; i < MAX_POLLS; i++) {
            await new Promise(r => setTimeout(r, POLL_INTERVAL));
            try {
                const res = await fetch(POLL_URL);
                if (res.ok) {
                    const data = await res.json() as { code: string | null };
                    if (data.code) {
                        const { tokens } = await this.oauth2Client.getToken(data.code);
                        this.oauth2Client.setCredentials(tokens);
                        this.saveToken(tokens);
                        this.youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
                        logger.info('YouTube: OAuth2 authentication complete via Cloudflare.');
                        return ok(`Authenticated successfully. Token saved to ${TOKEN_PATH}`);
                    }
                }
            } catch (err) {
                // Network error, keep polling
            }
            if (i % 10 === 0 && i > 0) {
                logger.info(`YouTube: Still waiting for authorization... (${i * 3}s elapsed)`);
            }
        }

        return { ok: false, error: new Error('Authentication timed out after 3 minutes.') };
    }

    /**
     * Uploads a video to YouTube using the resumable upload protocol.
     */
    public async upload(request: YouTubeUploadRequest): Promise<Result<YouTubeUploadResult>> {
        if (!this.youtube) {
            const authRes = await this.authenticate();
            if (!authRes.ok) return authRes as any;
        }

        if (!existsSync(request.videoPath)) {
            return { ok: false, error: new Error(`Video file not found: ${request.videoPath}`) };
        }

        const fileSize = statSync(request.videoPath).size;
        logger.info({
            title: request.title,
            path: request.videoPath,
            sizeMB: (fileSize / 1024 / 1024).toFixed(1)
        }, 'YouTube: Starting upload...');

        try {
            const parts = ['snippet', 'status'];
            if (request.videoAgeGating) parts.push('ageGating');

            const res = await this.youtube!.videos.insert({
                part: parts,
                notifySubscribers: true,
                requestBody: {
                    snippet: {
                        title: request.title,
                        description: request.description,
                        tags: request.tags || [],
                        categoryId: request.categoryId || '27', // Education
                        defaultLanguage: 'en'
                    },
                    status: {
                        privacyStatus: request.privacyStatus || 'unlisted',
                        embeddable: true,
                        selfDeclaredMadeForKids: false,
                        containsSyntheticMedia: request.containsSyntheticMedia === 'Yes' ? true :
                            request.containsSyntheticMedia === 'No' ? false : undefined
                    },
                    ...(request.videoAgeGating ? { ageGating: request.videoAgeGating } : {})
                },
                media: {
                    body: createReadStream(request.videoPath)
                }
            }, {
                // Resumable upload options
                onUploadProgress: (evt: { bytesRead: number }) => {
                    const pct = ((evt.bytesRead / fileSize) * 100).toFixed(1);
                    if (Number(pct) % 10 < 1) {
                        logger.info({ progress: `${pct}%` }, 'YouTube: Upload progress...');
                    }
                }
            });

            const videoId = res.data.id!;
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            logger.info({ videoId, videoUrl }, 'YouTube: Upload complete!');

            // Upload thumbnail if provided
            if (request.thumbnailPath && existsSync(request.thumbnailPath)) {
                try {
                    await this.youtube!.thumbnails.set({
                        videoId,
                        media: {
                            body: createReadStream(request.thumbnailPath)
                        }
                    });
                    logger.info({ videoId }, 'YouTube: Custom thumbnail set.');
                } catch (err) {
                    logger.warn({ err, videoId }, 'YouTube: Thumbnail upload failed (may need verified account).');
                }
            }

            // Add to playlist if requested
            let playlistId: string | undefined;
            if (request.playlistTitle) {
                const plRes = await this.getOrCreatePlaylist(request.playlistTitle);
                if (plRes.ok) {
                    playlistId = plRes.value;
                    await this.youtube!.playlistItems.insert({
                        part: ['snippet'],
                        requestBody: {
                            snippet: {
                                playlistId,
                                resourceId: {
                                    kind: 'youtube#video',
                                    videoId
                                }
                            }
                        }
                    });
                    logger.info({ playlistId, videoId }, 'YouTube: Added to playlist.');
                }
            }

            return ok({ videoId, videoUrl, playlistId });
        } catch (err) {
            logger.error({ err }, 'YouTube: Upload failed.');
            return { ok: false, error: err as Error };
        }
    }

    /**
     * Gets an existing playlist by title or creates a new one.
     */
    private async getOrCreatePlaylist(title: string): Promise<Result<string>> {
        if (!this.youtube) return { ok: false, error: new Error('Not authenticated.') };

        try {
            // Search existing playlists
            const listRes = await this.youtube.playlists.list({
                part: ['snippet'],
                mine: true,
                maxResults: 50
            });

            const existing = listRes.data.items?.find(
                (p: any) => p.snippet?.title?.toLowerCase() === title.toLowerCase()
            );


            if (existing) return ok(existing.id!);

            // Create new playlist
            const createRes = await this.youtube.playlists.insert({
                part: ['snippet', 'status'],
                requestBody: {
                    snippet: {
                        title,
                        description: `Auto-generated playlist for ${title} â€” POG2 Sovereign Pipeline`
                    },
                    status: { privacyStatus: 'unlisted' }
                }
            });

            return ok(createRes.data.id!);
        } catch (err) {
            logger.warn({ err, title }, 'YouTube: Playlist management failed.');
            return { ok: false, error: err as Error };
        }
    }

    private saveToken(token: any): void {
        try {
            const dir = getSovereignRoot();
            writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
            logger.info({ path: TOKEN_PATH }, 'YouTube: Token saved.');
        } catch (err) {
            logger.error({ err }, 'YouTube: Failed to save token.');
        }
    }
}
