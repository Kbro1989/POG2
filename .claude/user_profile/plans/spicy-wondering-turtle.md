# Plan: RS3 Official Data Integration for WikiEquipmentEnricher

## Context
The `WikiEquipmentEnricher` currently relies solely on wiki parsing, which leads to static/stale data and lacks canonical links to game entities. The goal is to transform it into a hybrid engine that uses official RS3 APIs and the Sovereign ground-truth cache to ensure absolute accuracy for the POG2 Pedagogy engine.

## Implementation Strategy

### 1. Infrastructure & Data Mapping
Instead of a custom provider, we will use the existing `CacheForensicsLimb` as the authoritative source for mapping Wiki titles to official game IDs.
- **Primary Mapping**: `CacheForensicsLimb.queryTaxonomy` and `crossReferenceNpc`/`crossReferenceItem` will be used to resolve `OfficialId`.
- **Low-Level Extraction**: `OpcodeReader.ts` will be reserved for deep-dive extraction of specific game-state flags if the JSON dumps are insufficient.

### 2. Official API Integration
We will implement the following clients in `POG2/src/utils/`:
- **`GeApi.ts`**: Real-time prices, trends, and historical 180-day graphs from `https://secure.runescape.com/m=itemdb_rs/api/catalogue`.
- **`BestiaryApi.ts`**: Authoritative monster stats and classification from the Official Bestiary API.
- **`OfficialPlayerDataApi.ts`**: Hiscores, Runemetrics, and Clan data for players and clans.

### 3. Hardening & Security (Bot Detection Mitigation)
To avoid detection by the Wiki's anti-scraping telemetry (`ai-scrapers-suck` endpoint):
- **API-Only Policy**: Maintain strict usage of `api.php` for all Wiki data. Explicitly forbid raw HTML page fetches.
- **User-Agent Rotation**: Update `USER_AGENT` in `WikiEquipmentEnricher.ts` to include contact info and a GitHub reference: `POG2-Sovereign/1.0 (Sovereign Research Node; admin@pog2.internal; respectful-soft-parse; +https://github.com/Kbro1989/POG2)`.
- **Header-Based Throttling**: Enhance `ApiThrottle.ts` to parse `Retry-After` headers from 429 responses and dynamically adjust wait times.

### 4. Interface & Model Updates
Update `WikiItemMeta`, `WikiMonsterMeta`, and `WikiPageData` in `POG2/src/utils/WikiEquipmentEnricher.ts` (or a shared interfaces file) to support:
- `officialId: number`
- `geData: { currentPrice: number, trend: string, graph180d: number[], lastUpdated: Date }`
- `authoritativeStats: Record<string, any>` (for monsters)
- `entityId: string | number` (for players/clans)
- New `pageType` values: `player`, `clan`.

### 5. Temporal Signal Tracking (Pedagogy Freshness)
Implement a mechanism to track game updates for the pedagogy model:
- **`WikiUpdateMeta`**: Define an interface for update entries (title, date, category, affected entities).
- **`fetchLatestUpdates()`**: Add a method to `WikiEquipmentEnricher.ts` to parse the Wiki's Updates page via API, allowing the model to tag entities as `[POST-UPDATE]` based on patch notes.

### 6. Enricher Workflow Overhaul
Modify `WikiEquipmentEnricher.ts` to implement the following logic:
1. **ID Resolution**: Use `CacheForensicsLimb` to find the official game ID for the requested entity.
2. **Enrichment Routing**:
   - **Item**: Wiki Parsing $\rightarrow$ `GeApi` (Real-time prices).
   - **Monster**: Wiki Parsing $\rightarrow$ `BestiaryApi` (Authoritative stats).
   - **Player/Clan**: Official API $\rightarrow$ `OfficialPlayerDataApi`.
3. **Reconciliation**: Use `WikiReconciliationLimb` for soft-parsing and taxonomy reconciliation where IDs are missing or ambiguous.
4. **Throttling**: Implement a shared `ApiThrottle` utility to prevent 429 errors across all official endpoints.

## Critical Files
- `POG2/src/utils/WikiEquipmentEnricher.ts` (Main Logic)
- `POG2/src/limbs/spatial/CacheForensicsLimb.ts` (ID Resolution)
- `POG2/src/limbs/spatial/WikiReconciliationLimb.ts` (Soft-Parsing)
- `POG2/src/core/OpcodeReader.ts` (Low-level data points)
- `POG2/src/utils/GeApi.ts` (New)
- `POG2/src/utils/BestiaryApi.ts` (New)
- `POG2/src/utils/OfficialPlayerDataApi.ts` (New)

## Verification Plan
1. **ID Resolution Test**: Ensure `WikiEquipmentEnricher` correctly maps "Zulrah" to its official NPC ID via `CacheForensicsLimb`.
2. **Price Accuracy Test**: Verify that an item's `geValue` is updated with real-time data from `GeApi`.
3. **Domain Expansion Test**: Successfully enrich a "Player" or "Clan" page using `OfficialPlayerDataApi`.
4. **Stress Test**: Batch enrich 50 items and verify that the `ApiThrottle` maintains a steady request rate without triggers.
