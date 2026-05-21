import { AvatarStateLimb } from '../src/limbs/spatial/AvatarStateLimb.js';
import { SovereignAvatarEntity } from '../src/core/SovereignAvatar.js';

async function test() {
    const avatar = new SovereignAvatarEntity('TestAvatar');
    const stateLimb = AvatarStateLimb.getInstance();
    
    avatar.subscribe('morphology_sync', (data: any) => {
        console.log("RECEIVED MORPHOLOGY SYNC:", data);
    });
    
    // Oh wait, SovereignAvatarEntity uses a different signature for subscribing...
    // The snippet shows `public emit(type: string, delta: any)` and `public onStateChange`
    
    stateLimb.bindEntity(avatar);
    console.log("Running syncWithForensics...");
    await stateLimb.syncWithForensics();
    console.log("Done.");
}

test().catch(console.error);
