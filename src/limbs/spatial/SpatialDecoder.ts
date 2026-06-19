/**
 * SpatialDecoder - Generalized interface for resolving coordinate systems (X, Y, Plane, N/S/E/W)
 * into semantic locations using cache-native data.
 */
export interface SpatialDecoder {
    /**
     * Resolves a packed coordinate (or N/S/E/W orientation) to a localized cache structure.
     */
    resolveCoordinate(x: number, y: number, plane: number): { region: string; loc: string; type: string };
    
    /**
     * Sextant logic - decodes directional/spatial orientation relative to the sovereign atlas.
     */
    decodeSextant(x: number, y: number, plane: number): { cardinal: string; offset: [number, number] };
}
