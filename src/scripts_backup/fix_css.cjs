const fs = require('fs');

let css = fs.readFileSync('tmp_rsmv_inspect/src/assets/index.css', 'utf8');

// Find the start of the RS3 HUD section
const marker = '/* =========================================\r\n   RS3 HUD & GLASSMORPHISM THEME\r\n   ========================================= */';
let startIdx = css.indexOf(marker);
if (startIdx === -1) {
    startIdx = css.indexOf('/* =========================================\n   RS3 HUD & GLASSMORPHISM THEME\n   ========================================= */');
}

if (startIdx !== -1) {
    const cleanCss = css.substring(0, startIdx);
    
    // Add the correct HUD CSS
    const rs3hud = `
/* =========================================
   RS3 HUD & GLASSMORPHISM THEME
   ========================================= */

.rs-hud-root {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	display: flex;
	flex-direction: column;
	z-index: 100;
	overflow: hidden;
}

.rs-hud-panel {
	pointer-events: auto;
	background: rgba(30, 36, 40, 0.75);
	backdrop-filter: blur(8px);
	-webkit-backdrop-filter: blur(8px);
	border: 1px solid rgba(80, 92, 102, 0.6);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), inset 0 0 10px rgba(0, 0, 0, 0.2);
	border-radius: 4px;
	color: #d1d5db;
	display: flex;
	flex-direction: column;
}

/* Minimap Assembly (Top Right) */
.rs-minimap-container {
	position: absolute;
	top: 15px;
	right: 15px;
	width: 220px;
	height: 220px;
	border-radius: 50%;
	background: rgba(10, 15, 20, 0.9);
	border: 4px solid #483c27;
	box-shadow: 0 0 15px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(0, 0, 0, 1);
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: auto;
}

.rs-minimap-compass {
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    color: #ff3333;
    font-weight: bold;
    text-shadow: 0 0 4px #000;
    font-size: 14px;
}

.rs-minimap-world-toggle {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 28px;
    height: 28px;
    background: linear-gradient(to bottom, #2a2c30, #1a1c20);
    border-radius: 50%;
    border: 2px solid #5a5040;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ddd;
    font-size: 12px;
    pointer-events: auto;
    box-shadow: 0 2px 5px rgba(0,0,0,0.5);
}

.rs-minimap-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.rs-minimap-dot-player {
  background: #00ff88;
}

.rs-minimap-dot-npc {
  background: #ff4444;
}

.rs-minimap-dot-ghost {
  background: #ffaa00;
  opacity: 0.7;
}

/* Ribbon & Interactive Tabs (Bottom Right) */
.rs-ribbon-dock {
	position: absolute;
	bottom: 15px;
	right: 15px;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 10px;
    z-index: 105;
}

.rs-ribbon-window {
	width: 320px;
	height: 400px;
    background: rgba(20, 26, 31, 0.9);
    border: 1px solid #483c27;
	display: flex;
	flex-direction: column;
	pointer-events: auto;
}

.rs-window-header {
    background: linear-gradient(to bottom, #303740, #1e2329);
    color: #e3d5b8;
    padding: 6px 12px;
    font-weight: bold;
    border-bottom: 2px solid #5a5040;
    text-transform: uppercase;
    font-size: 14px;
}

.rs-window-tabs {
	display: flex;
	background: rgba(15, 18, 22, 0.95);
	border-bottom: 1px solid #483c27;
}

.rs-window-tab {
	flex: 1;
	padding: 6px 0;
	text-align: center;
	cursor: pointer;
	font-weight: bold;
	color: #8b9298;
	transition: all 0.2s;
    font-size: 11px;
}

.rs-window-tab:hover {
	background: rgba(40, 48, 55, 0.9);
	color: #fff;
}

.rs-window-tab.active {
	background: rgba(50, 60, 70, 0.9);
	color: #fbcc4a;
	border-bottom: 2px solid #fbcc4a;
}

.rs-window-content {
	flex: 1;
	overflow-y: auto;
    position: relative;
}

.rs-empty-tab {
    text-align: center;
    padding: 20px;
    color: #667078;
    font-style: italic;
}

/* The Ribbon Buttons themselves */
.rs-ribbon-bar {
    display: flex;
    gap: 2px;
    background: rgba(15, 20, 25, 0.95);
    border: 1px solid #483c27;
    padding: 2px;
    border-radius: 4px;
    pointer-events: auto;
}

.rs-ribbon-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(25, 30, 35, 0.8);
    border: 1px solid #3c4650;
    cursor: pointer;
    font-size: 16px;
    color: #a0abb5;
    transition: all 0.2s;
    border-radius: 2px;
}

.rs-ribbon-btn:hover {
    color: #fbcc4a;
    border-color: #fbcc4a;
    background: rgba(40, 50, 60, 0.9);
}

.rs-ribbon-btn.active {
    background: linear-gradient(to bottom, #438ab5, #2c5874);
    color: white;
    border-color: #88ccff;
    box-shadow: inset 0 0 10px rgba(0,255,255,0.3);
}

.rs-loadout-panel {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 5px;
    box-sizing: border-box;
}

/* Chatbox Console (Bottom Left) */
.rs-chatbox-container {
	position: absolute;
	bottom: 15px;
	left: 15px;
	width: 450px;
	height: 200px;
	pointer-events: auto;
}

.rs-chatbox-messages {
	flex: 1;
	padding: 10px;
	overflow-y: auto;
	font-family: Consolas, monospace;
	font-size: 13px;
	line-height: 1.4;
	color: #e2e8f0;
}

.rs-chatbox-inputbar {
	padding: 8px;
	background: rgba(15, 20, 25, 0.9);
	border-top: 1px solid rgba(80, 92, 102, 0.6);
	display: flex;
}

/* Action Bar (Bottom Center) */
.rs-actionbar-container {
	position: absolute;
	bottom: 15px;
	left: 50%;
	transform: translateX(-50%);
	height: 50px;
	display: flex;
	gap: 4px;
	padding: 4px;
	pointer-events: auto;
}

.rs-action-slot {
	width: 42px;
	height: 42px;
	background: rgba(10, 15, 20, 0.8);
	border: 1px solid #3c4650;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: border-color 0.2s, background 0.2s;
}

.rs-action-slot:hover {
	border-color: #fbcc4a;
	background: rgba(30, 40, 50, 0.9);
}
`;
    
    fs.writeFileSync('tmp_rsmv_inspect/src/assets/index.css', cleanCss + rs3hud);
    console.log("CSS Repaired successfully.");
} else {
    console.log("Marker not found, unable to repair CSS automatically.");
}
