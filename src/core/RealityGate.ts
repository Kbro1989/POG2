/** 
 * RealityDomain defines the temporal truth ring for a render stream.
 * WORLD: T1 (600ms) - Authoritative Ledger
 * PLAYER: T2 (300ms) - Reflexive Action
 * POG2: T3 (Optional) - Agency Projection
 */
export enum RealityDomain {
    WORLD = 'WORLD',
    PLAYER = 'PLAYER',
    POG2 = 'POG2'
}

export interface RealityGateOptions {
    domain: RealityDomain;
    forceSync?: boolean;
}
