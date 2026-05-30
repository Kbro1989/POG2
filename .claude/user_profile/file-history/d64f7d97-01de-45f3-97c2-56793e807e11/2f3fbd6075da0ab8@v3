# Implementation Plan: GeApi Canonical Update & Proxy Integration

## Context
The `GeApi.ts` needs to be updated to provide high-fidelity, real-time Grand Exchange (GE) prices. The current implementation relies on a single Jagex endpoint that is prone to CORS blocks and restrictive rate limiting. The new approach uses a dual-source strategy: leveraging the CORS-friendly Weird Gloop API as the primary source and the official Jagex API (via a Cloudflare Worker proxy) as a fallback.

## Goals
- Implement a dual-source fetching strategy: Weird Gloop $\rightarrow$ Jagex Proxy.
- Create a robust price parser for human-readable strings (e.g., "5.2m", "1.1k").
- Integrate `ApiThrottle` for all GE-related requests.
- Update the worker proxy to support GE endpoints.
- Align interfaces with the canonical GE API specification.

## Critical Files
- `src/utils/GeApi.ts`
- `D:\multiplayer-globe-template\src\server\index.ts` (Worker proxy)

## Implementation Details

### 1. Worker Proxy Update (`D:\multiplayer-globe-template\src\server\index.ts`)
Add `/api/ge/*` routing to the Cloudflare Worker to proxy Jagex GE requests.
- Route: `/api/ge/detail.json?item={id}` $\rightarrow$ `https://secure.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item={id}`
- Route: `/api/ge/graph.json?item={id}` $\rightarrow$ `https://secure.runescape.com/m=itemdb_rs/api/graph/{id}.json`
- Ensure `Access-Control-Allow-Origin: *` and `redirect: 'follow'`.

### 2. `GeApi.ts` Refactor
**A. Constants & Interfaces**
- `WG_BASE = 'https://api.weirdgloop.org/exchange/history/rs'`
- `JAGEX_PROXY_BASE = 'https://multiplayer-globe-pog2.kristain33rs.workers.dev/api/ge'`
- Define `GePrice` and `GeItemDetails` interfaces based on canonical spec.

**B. Price Parsing Utility**
Implement `parsePrice(priceStr: string): number`:
- Remove commas.
- Handle `k` (1,000), `m` (1,000,000), and `b` (1,000,000,000).
- Return raw integer.

**C. Fetching Logic**
- `getLatestPrice(itemId)`:
    1. Try `fetchWeirdGloop(itemId)` $\rightarrow$ `/latest?id={id}`.
    2. If fails, try `fetchJagexProxy(itemId)` $\rightarrow$ `/detail.json?item={id}`.
    3. Parse and normalize the result into a unified `GePrice` object.
- `getHistoricalData(itemId)`:
    1. Use `/180?id={id}` from Weird Gloop.
    2. Fallback to `/graph.json?item={id}` via proxy.
- `getItemDetails(itemId)`:
    *   Primarily uses the Jagex Proxy (`detail.json`).
    *   Handles `members` as a string (`"true"`/`"false"`).

**D. Throttling**
- All requests must be guarded by `this.throttle.acquire('ge')`.

## Verification Plan
1. **Proxy Health**: `curl "https://multiplayer-globe-pog2.kristain33rs.workers.dev/api/ge/detail.json?item=21787"`
2. **Price Resolution**: Call `getLatestPrice(21787)` and verify it returns a numeric price.
3. **Parser Accuracy**: Test `parsePrice` with `"5.2m"`, `"1.1k"`, `"1,234"`, and `"1.5b"`.
4. **Fallback Trigger**: Temporarily block Weird Gloop (e.g., wrong URL) and verify that `getLatestPrice` successfully falls back to the Jagex proxy.
5. **Interface Check**: Verify `members` is correctly converted from string to boolean.
