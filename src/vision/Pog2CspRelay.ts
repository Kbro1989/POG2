/**
 * Pog2CspRelay — Content-Security-Policy bypass relay for outbound visual capture.
 *
 * The substrate's vision tools (SovereignEye, PuppeteerEye) launch headless
 * Chrome/Edge/Firefox against external URLs to capture screenshots and
 * DOM state. The captured pages often ship with strict CSP headers
 * (`script-src`, `style-src`, `default-src`) that:
 *
 *   - Block inline scripts and `eval()` that the headless browser
 *     itself tries to run in automation context (yielding the
 *     `unsafe-eval` / `unsafe-inline` console warnings the user is
 *     seeing).
 *   - Block the `connect-src` to the substrate's own dashboard
 *     WebSocket, so the captured page can't reach back to the
 *     substrate's switchboard.
 *   - Sometimes refuse to render entirely under `--headless` because
 *     the headless flag triggers a CSP `frame-ancestors` mismatch.
 *
 * The fix: route every external capture through a local relay that
 * fetches the page server-side (via `undici`/`fetch`), strips the
 * response's `Content-Security-Policy` and
 * `Content-Security-Policy-Report-Only` headers, and re-emits the
 * content to the headless browser. The browser then sees a CSP-less
 * version of the page and renders cleanly. The page's
 * `<meta http-equiv="Content-Security-Policy">` tags inside the HTML
 * are also stripped.
 *
 * The relay is a thin Express-compatible handler — it does not bind
 * its own port. The SwitchboardLimb can mount it at `/csp-relay/`
 * so the rest of the substrate's HTTP surface is unaffected.
 *
 * Why this is safe: the relay only relaxes CSP for the substrate's
 * OWN headless browser context. The captured page's CSP still
 * applies to any user that visits the page directly. The substrate is
 * acting on its own behalf, in a sandboxed automation context, with
 * no execution rights to the captured page's JavaScript — the
 * captured page's scripts run in the headless browser's process, not
 * in the substrate's Node process. The only thing the substrate
 * extracts is DOM text + a screenshot.
 *
 * Upstream:   SovereignEye.headlessScreenshot, PuppeteerEye.domInspect
 * Downstream: SwitchboardLimb HTTP server
 */

import { Request, Response, Router, type RequestHandler } from 'express';
import { fetch as undiciFetch } from 'undici';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Pog2CspRelay');

/** Headers that gate CSP behavior. Stripped on the relay pass. */
const CSP_HEADERS = [
    'content-security-policy',
    'content-security-policy-report-only',
    'x-frame-options',
    'x-content-type-options',
    'x-xss-protection'
];

/** HTML meta-tag patterns that ship inline CSP. Stripped on the relay pass. */
const CSP_META_PATTERNS: RegExp[] = [
    /<meta[^>]+http-equiv\s*=\s*["']content-security-policy["'][^>]*>/gi,
    /<meta[^>]+http-equiv\s*=\s*["']content-security-policy-report-only["'][^>]*>/gi,
    /<meta[^>]+http-equiv\s*=\s*["']x-frame-options["'][^>]*>/gi
];

export interface Pog2CspRelayOptions {
    /** Allow-list of hostnames the relay is permitted to fetch. */
    readonly allowList?: ReadonlyArray<string>;
    /** Timeout for the upstream fetch in ms. */
    readonly fetchTimeoutMs?: number;
    /** Max response body size in bytes (defensive cap). */
    readonly maxBodyBytes?: number;
}

export class Pog2CspRelay {
    private readonly allowList: ReadonlyArray<string>;
    private readonly fetchTimeoutMs: number;
    private readonly maxBodyBytes: number;

    constructor(opts: Pog2CspRelayOptions = {}) {
        this.allowList = opts.allowList ?? [];
        this.fetchTimeoutMs = opts.fetchTimeoutMs ?? 15000;
        this.maxBodyBytes = opts.maxBodyBytes ?? 10 * 1024 * 1024;
    }

    /**
     * isAllowed — Returns true if the target URL's hostname matches the
     * allow-list, or if the allow-list is empty (open mode). Use a
     * non-empty allow-list in production to prevent the relay from
     * becoming an open proxy.
     */
    public isAllowed(target: string): boolean {
        if (this.allowList.length === 0) return true;
        try {
            const u = new URL(target);
            return this.allowList.some(host => u.hostname === host || u.hostname.endsWith(`.${host}`));
        } catch {
            return false;
        }
    }

    /**
     * handle — The Express request handler. Accepts:
     *   GET /csp-relay?url=https://example.com
     *   GET /csp-relay/<base64-of-url>
     * Fetches the upstream, strips CSP headers + meta tags, re-emits
     * the body and the remaining headers to the client. The client
     * (headless chrome / Puppeteer) sees a CSP-less version of the
     * page and renders without warnings.
     */
    public handle: RequestHandler = async (req: Request, res: Response) => {
        try {
            const target = this.extractTarget(req);
            if (!target) {
                res.status(400).json({ error: 'Missing or invalid ?url= parameter' });
                return;
            }
            if (!this.isAllowed(target)) {
                res.status(403).json({ error: `Host not in allow-list: ${new URL(target).hostname}` });
                return;
            }

            logger.info({ target, ip: req.ip }, 'Pog2CspRelay: forwarding');

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.fetchTimeoutMs);
            let upstream: Awaited<ReturnType<typeof undiciFetch>>;
            try {
                upstream = await undiciFetch(target, {
                    signal: controller.signal,
                    headers: { 'User-Agent': 'Pog2Sovereign/2.0 (CSP-relay)', 'Accept': '*/*' }
                });
            } finally {
                clearTimeout(timeoutId);
            }

            // Copy safe response headers, stripping CSP gating headers.
            for (const [name, value] of upstream.headers.entries()) {
                if (CSP_HEADERS.includes(name.toLowerCase())) continue;
                try { res.setHeader(name, value); } catch { /* hop-by-hop or invalid */ }
            }
            // Explicitly unset the gating headers in case they were
            // already set by upstream middleware.
            for (const h of CSP_HEADERS) res.removeHeader(h);

            // If the response is HTML, strip <meta http-equiv="Content-Security-Policy">.
            const contentType = upstream.headers.get('content-type') ?? '';
            if (contentType.includes('text/html')) {
                const buf = Buffer.from(await upstream.arrayBuffer());
                if (buf.byteLength > this.maxBodyBytes) {
                    res.status(413).json({ error: 'Upstream response too large' });
                    return;
                }
                let html = buf.toString('utf8');
                for (const pat of CSP_META_PATTERNS) html = html.replace(pat, '');
                res.setHeader('content-length', Buffer.byteLength(html));
                res.status(upstream.status).send(html);
            } else {
                const buf = Buffer.from(await upstream.arrayBuffer());
                if (buf.byteLength > this.maxBodyBytes) {
                    res.status(413).json({ error: 'Upstream response too large' });
                    return;
                }
                res.setHeader('content-length', buf.byteLength);
                res.status(upstream.status).send(buf);
            }
        } catch (err) {
            logger.error({ err: err instanceof Error ? err.message : String(err) }, 'Pog2CspRelay: upstream fetch failed');
            res.status(502).json({ error: 'Upstream fetch failed', detail: err instanceof Error ? err.message : String(err) });
        }
    };

    private extractTarget(req: Request): string | null {
        const fromQuery = typeof req.query.url === 'string' ? req.query.url : null;
        if (fromQuery) return fromQuery;
        // Path-based: GET /csp-relay/<base64>
        const pathPart = req.path.replace(/^\/csp-relay\/?/, '').replace(/^\//, '');
        if (pathPart.length > 0) {
            try {
                return Buffer.from(decodeURIComponent(pathPart), 'base64').toString('utf8');
            } catch {
                return null;
            }
        }
        return null;
    }

    /**
     * asRouter — Mount the relay on an Express app. Returns the Router
     * so callers can prefix it (e.g. `app.use('/csp-relay', relay.asRouter())`).
     */
    public asRouter(): Router {
        const router = Router();
        router.get('/', this.handle);
        router.get('/*', this.handle);
        return router;
    }

    /**
     * Build a relay URL for a target. The headless browser navigates
     * to this URL instead of the target directly, so the page arrives
     * with CSP stripped. Use base64 form when the target URL contains
     * characters that don't survive query encoding.
     */
    public buildRelayUrl(target: string, baseUrl: string = 'http://localhost:8788/csp-relay'): string {
        const useBase64 = /[\x00-\x1F?#&%<>]/.test(target);
        if (useBase64) {
            return `${baseUrl}/${encodeURIComponent(Buffer.from(target).toString('base64'))}`;
        }
        return `${baseUrl}?url=${encodeURIComponent(target)}`;
    }
}

/** Singleton — the relay has no per-instance state worth duplicating. */
let _relay: Pog2CspRelay | null = null;
export function getPog2CspRelay(opts?: Pog2CspRelayOptions): Pog2CspRelay {
    if (!_relay) _relay = new Pog2CspRelay(opts);
    return _relay;
}
