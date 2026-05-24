# Vision-Actuation Race Condition Fix Plan

## Context
A race condition exists where the vision loop's attempt to read state from the edge_radar.html canvas can coincide with canvas resize operations that clear the drawing buffer. This results in corrupted screenshots that cause OCR/template matching failures ("txt not found on html" errors).

### Root Cause
1. The edge_radar.html uses `setInterval(redraw, 150)` to continuously update the visualization
2. The `redraw()` function resizes the canvas with `canvas.width = size * scale; canvas.height = size * scale;`
3. Setting canvas width/height properties clears the drawing buffer (per HTML5 spec)
4. The vision loop (via TransientObserver → SovereignEye) captures screenshots of edge_radar.html
5. When a screenshot is taken during the brief moment when the canvas has been resized but not yet redrawn, it captures a cleared buffer
6. This results in failed state confirmation and the "txt not found on html" error

### Solution
Implement a "Vision Lock Gate" that prevents canvas resize operations during vision capture:
- Before performing a screenshot capture, send a WebSocket signal to edge_radar.html
- edge_radar.html delays canvas resize operations while the vision capture signal is active
- After capture completes, send a signal to resume normal operation

## Implementation Plan

### Changes to edge_radar.html (public/edge_radar.html)
1. Add a vision capture in-progress flag
2. Modify redraw() function to check flag and defer resize when capture is active
3. Add WebSocket message handlers for vision capture signals

### Changes to TransientObserver (src/vision/TransientObserver.ts)
1. Import SwitchboardLimb
2. Before performing actual screenshot capture, send 'vision_capture_start' broadcast
3. After capture attempt (success or failure), send 'vision_capture_end' broadcast in finally block

## Detailed Implementation

### edge_radar.html Modifications
```javascript
// Add near top of file, after other state variables
let visionCaptureInProgress = false;

// Modify connectWS() function to handle new message types
ws.onmessage = (event) => {
    try {
        const payload = JSON.parse(event.data);
        
        // ... existing message handling ...
        
        if (payload.type === 'vision_capture_start') {
            visionCaptureInProgress = true;
        } else if (payload.type === 'vision_capture_end') {
            visionCaptureInProgress = false;
        }
    } catch (e) {
        console.warn('WS parse error:', e);
    }
};

// Modify redraw() function to check vision capture flag
function redraw() {
    // DEFER RESIZE IF VISION CAPTURE IN PROGRESS
    if (visionCaptureInProgress) {
        // Skip this resize cycle - will try again on next interval
        return;
    }
    
    // ... existing redraw logic ...
    
    // ONLY RESIZE IF NOT IN VISION CAPTURE
    if (!visionCaptureInProgress) {
        canvas.width = size * scale;
        canvas.height = size * scale;
    }
    
    // ... rest of redraw logic ...
}
```

### TransientObserver.ts Modifications
```typescript
// Add import at top
import { SwitchboardLimb } from '../../monitor/SwitchboardLimb.js';

// In observe() method, around line 125-140 where actual capture happens:
public async observe(targetName: string, imagePath: string): Promise<Result<any>> {
    // ... existing code ...
    
    // 1. Live Vision Loop — reuse singleton eye, throttle captures
    let activePath = imagePath;
    const now = Date.now();
    if (imagePath === 'latest_frame.png') {
        // Throttle: skip capture if within cadence window and we have a cached result
        if (this.lastCaptureResult && (now - this.lastCaptureTime) < TransientObserver.CAPTURE_THROTTLE_MS) {
            activePath = this.lastCaptureResult;
        } else {
            // VISION LOCK GATE: Prevent canvas resize during capture
            const switchboard = SwitchboardLimb.getInstance();
            switchboard.broadcast({ type: 'vision_capture_start' });
            
            try {
                // Reuse singleton eye (never allocate a new one per tick)
                if (!this.eye) {
                    this.eye = new (require('../utils/SovereignEye.js')).SovereignEye('live-vision-loop');
                }
                const port = (require('../monitor/SwitchboardLimb.js')).SwitchboardLimb.getInstance().getActivePort() || 8788;
                const captureRes = await this.eye.capture({ type: 'url', target: `http://localhost:${port}/edge_radar.html` });
                if (captureRes.ok && captureRes.value.imagePath) {
                    activePath = captureRes.value.imagePath;
                    this.lastCaptureResult = activePath;
                    this.lastCaptureTime = now;
                    // Copy to bridge
                    const { copyFileSync } = require('fs');
                    copyFileSync(activePath, 'latest_frame.png');
                }
            } finally {
                // Always ensure we send the end signal
                const switchboard = SwitchboardLimb.getInstance();
                switchboard.broadcast({ type: 'vision_capture_end' });
            }
        }
    }
    
    // ... rest of method unchanged ...
}
```

## Verification
1. Run the system and observe that vision confirmation errors ("txt not found on html") decrease or eliminate
2. Verify that edge_radar.html visualization continues to update correctly
3. Check that WebSocket messages are properly exchanged
4. Ensure no performance degradation from the additional signaling

## Alternative Approaches Considered
1. **Snapshot-before-Cleanup**: Copy canvas buffer before resize - rejected due to complexity and uncertain visual fidelity
2. **CSS-only scaling**: Avoid canvas width/height changes - rejected as it would limit dynamic zoom/resolution capabilities
3. **Increased vision loop cadence**: Capture more frequently - rejected as it treats symptom not cause
4. **Retry logic**: Retry failed captures - rejected as it treats symptom not cause

## Files to Modify
- public/edge_radar.html
- src/vision/TransientObserver.ts