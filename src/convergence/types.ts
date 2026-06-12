export interface WorldAnchor {
    world: 'RSC' | 'RS3';
    x: number;
    y: number;
    plane: number;
    region?: string;
}

export interface PhaseTransition {
    source: WorldAnchor;
    destination: WorldAnchor;
    trigger: 'COMMAND' | 'SCRIPT' | 'VARBIT';
    validation?: number; // Script ID or varbit to verify
}

export interface PortalDefinition {
    id: string | number;
    rscId: number;
    rs3Id: number;
    triggerType: 'COMMAND' | 'SCRIPT' | 'VARBIT';
    destination: WorldAnchor;
    validationScript?: number;
    semanticLabel: string;
}
