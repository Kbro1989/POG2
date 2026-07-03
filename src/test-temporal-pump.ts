import { CanonicalClock } from './utils/CanonicalClock.js';
import { TemporalHeartbeatLimb } from './limbs/core/TemporalHeartbeatLimb.js';
import { CNSGodheadPulseVolley } from './engines/gameplay/CNSGodheadPulseVolley.js';
import { SwitchboardLimb } from './monitor/SwitchboardLimb.js';
import { HexagramManager } from './routing/HexagramManager.js';

const steps = [
  'bootstrap',
  'getInstance(CanonicalClock)',
  'getInstance(TemporalHeartbeatLimb)',
  'registerPulse',
  'getInstance(CNSGodheadPulseVolley)',
  'getInstance(SwitchboardLimb)',
  'drainAdminQueue',
  'CNS.pulse([])',
  'limb.pulse()',
];

function trace(label: string, err?: unknown) {
  if (err) {
    console.log(`FAIL ${label}: ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  } else {
    console.log(`OK ${label}`);
  }
}

try {
  CanonicalClock.bootstrap(0);
} catch (e) {
  if (!String((e as Error).message).includes('already bootstrapped')) throw e;
}
trace('bootstrap');

HexagramManager.initializeSimulation();
trace('HexagramManager.initializeSimulation');

const clock = CanonicalClock.getInstance();
trace('getInstance(CanonicalClock)');

const limb = TemporalHeartbeatLimb.getInstance();
trace('getInstance(TemporalHeartbeatLimb)');
trace('registerPulse', typeof clock.registerPulse !== 'function' ? new Error('missing') : undefined);

try {
  const volley = CNSGodheadPulseVolley.getInstance();
  trace('getInstance(CNSGodheadPulseVolley)');
  try {
    const board = SwitchboardLimb.getInstance();
    trace('getInstance(SwitchboardLimb)');
    const pending = board.drainAdminQueue();
    trace('drainAdminQueue');
    try {
      await volley.pulse(pending);
      trace('CNS.pulse([])');
    } catch (pulseErr) {
      trace('CNS.pulse([])', pulseErr);
    }
  } catch (inner) {
    trace('Switchboard/CNS chain', inner);
  }
} catch (err) {
  trace('getInstance(CNSGodheadPulseVolley)', err);
}

try {
  await limb.pulse();
  trace('limb.pulse()');
} catch (err) {
  trace('limb.pulse()', err);
}
