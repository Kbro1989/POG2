
// Ambient declarations for remote URL-based substrates
declare module "multiplayer-globe-template" {
    // Treat as an external, black-box runtime dependency
    const globe: any;
    export default globe;
}

// Ensure the project treats remote endpoints as known runtime entities
declare var POG2_GLOBE_ENDPOINT: string;
