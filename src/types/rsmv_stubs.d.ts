
// Stub for RSMV modules to allow POG2 to build independently
declare module "rsmv/*" {
    const content: any;
    export default content;
}
declare module "../src_rsmv/*" {
    const content: any;
    export default content;
}
