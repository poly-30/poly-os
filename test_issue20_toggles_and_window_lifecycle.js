// ==============================================================================
// Test Suite: Issue 20 - Window Close Lifecycle, Quick Toggles & Shell Architecture
// ==============================================================================

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Issue 20 Automated Verification Suite...');

const shellPath = path.join(__dirname, 'poly-shell', 'shell.js');
const indexPath = path.join(__dirname, 'poly-shell', 'index.html');
const cssPath = path.join(__dirname, 'poly-shell', 'style.css');

const shellJs = fs.readFileSync(shellPath, 'utf8');
const indexHtml = fs.readFileSync(indexPath, 'utf8');
const styleCss = fs.readFileSync(cssPath, 'utf8');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// ------------------------------------------------------------------------------
// 1. Stacking Context & Click Reliability
// ------------------------------------------------------------------------------
runTest('Titlebar & traffic lights elevate above resize handles in CSS', () => {
  assert.ok(styleCss.includes('.window-titlebar {'), 'CSS must define .window-titlebar');
  assert.ok(styleCss.includes('z-index: 60;'), '.window-titlebar must have z-index: 60');
  assert.ok(styleCss.includes('.traffic-light {'), 'CSS must define .traffic-light');
  assert.ok(styleCss.includes('z-index: 65;'), '.traffic-light must have z-index: 65');
  assert.ok(styleCss.includes('pointer-events: auto;'), '.traffic-light must have pointer-events: auto');
  assert.ok(styleCss.includes('.window-resize-handle {'), 'CSS must define .window-resize-handle');
  assert.ok(styleCss.includes('z-index: 40;'), '.window-resize-handle must have z-index: 40 (strictly lower than traffic lights)');
});

// ------------------------------------------------------------------------------
// 2. Window Close Keyboard Shortcuts & Event Interception
// ------------------------------------------------------------------------------
runTest('Close window keyboard shortcuts (Ctrl+W, Cmd+W, Alt+F4) preventDefault', () => {
  assert.ok(shellJs.includes("e.key === 'w' || e.key === 'W' || e.code === 'KeyW'"), 'Shortcut handles Ctrl+W and Cmd+W');
  assert.ok(shellJs.includes("e.altKey && e.key === 'F4'"), 'Shortcut handles Alt+F4');
  assert.ok(shellJs.includes("this.closeWindow(targetId, force)"), 'Shortcut calls closeWindow with force flag on shift');
});

// ------------------------------------------------------------------------------
// 3. Repeat Close & Force Quit Detection for Keep-Alive Daemons
// ------------------------------------------------------------------------------
runTest('Repeat close within 2.5s or Shift+click triggers forceQuit', () => {
  assert.ok(shellJs.includes("const isRepeatClose = win._lastCloseClickTime && (now - win._lastCloseClickTime < 2500);"), 'Repeat close detected within 2.5 seconds');
  assert.ok(shellJs.includes("const shouldForceQuit = forceQuit || isRepeatClose;"), 'Force quit triggered by repeat close or shift click');
  assert.ok(shellJs.includes("const isKeepAlive = !shouldForceQuit && (win.keepAlive || ['music', 'terminal', 'telemetry'].includes(appKey));"), 'Keep alive guarded by shouldForceQuit');
});

// ------------------------------------------------------------------------------
// 4. Maximized Window Style Leakage Sanitization
// ------------------------------------------------------------------------------
runTest('Maximized window styles are thoroughly wiped when hiding to background tray', () => {
  assert.ok(shellJs.includes("win.element.classList.remove('maximized')"), 'Removes maximized class on tray minimize');
  assert.ok(shellJs.includes("this.exitImmersiveMode()"), 'Exits immersive mode on tray hide');
});

// ------------------------------------------------------------------------------
// 5. Screen Brightness Pipeline
// ------------------------------------------------------------------------------
runTest('Screen brightness overlay DOM and dynamic opacity math', () => {
  assert.ok(indexHtml.includes('id="screen-brightness-overlay"'), 'HTML has #screen-brightness-overlay');
  assert.ok(styleCss.includes('#screen-brightness-overlay {'), 'CSS styles #screen-brightness-overlay');
  assert.ok(styleCss.includes('z-index: 999998;'), 'Overlay sits directly under cursor and Dynamic Island');
  assert.ok(shellJs.includes("(100 - num) / 100 * 0.85"), 'Correct brightness dimming math');
  assert.ok(shellJs.includes("localStorage.setItem('poly_screen_brightness'"), 'Brightness persisted in localStorage');
});

// ------------------------------------------------------------------------------
// 6. Wi-Fi & Bluetooth Toggle Architecture
// ------------------------------------------------------------------------------
runTest('Wi-Fi & Bluetooth centralized toggles with topbar and Control Center sync', () => {
  assert.ok(indexHtml.includes('id="topbar-wifi"'), 'HTML has #topbar-wifi');
  assert.ok(indexHtml.includes('id="topbar-bluetooth"'), 'HTML has #topbar-bluetooth');
  assert.ok(shellJs.includes('toggleWifi(forceState)'), 'shell.js defines toggleWifi');
  assert.ok(shellJs.includes('updateWifiUI()'), 'shell.js defines updateWifiUI');
  assert.ok(shellJs.includes('toggleBluetooth(forceState)'), 'shell.js defines toggleBluetooth');
  assert.ok(shellJs.includes('updateBluetoothUI()'), 'shell.js defines updateBluetoothUI');
  assert.ok(shellJs.includes("localStorage.setItem('poly_wifi_enabled'"), 'Wi-Fi state persisted');
  assert.ok(shellJs.includes("localStorage.setItem('poly_bluetooth_enabled'"), 'Bluetooth state persisted');
});

// ------------------------------------------------------------------------------
// 7. PolyDrop & Aero Snap Toggles
// ------------------------------------------------------------------------------
runTest('PolyDrop cycling and Aero Snap toggles with snapping enforcement', () => {
  assert.ok(shellJs.includes('togglePolyDrop(forceState)'), 'shell.js defines togglePolyDrop');
  assert.ok(shellJs.includes('setAeroSnap(enabled)'), 'shell.js defines setAeroSnap');
  assert.ok(shellJs.includes('if (this.aeroSnapEnabled === false)'), 'checkSnapZones respects aeroSnapEnabled');
  assert.ok(shellJs.includes("if (this.aeroSnapEnabled === false && zone !== 'maximize')"), 'applySnap respects aeroSnapEnabled');
});

// ------------------------------------------------------------------------------
// 8. System Settings App Checkbox Wiring & Synchronization
// ------------------------------------------------------------------------------
runTest('Settings app checkboxes (Hardware Acceleration, Scaling, Freezer, Snap) wired', () => {
  assert.ok(shellJs.includes("const hwToggle = root.querySelector('#hw-accel-toggle');"), 'Hardware acceleration toggle wired');
  assert.ok(shellJs.includes("const scaleSelect = root.querySelector('#display-scale-select');"), 'Display scale select wired');
  assert.ok(shellJs.includes("const freezerToggle = root.querySelector('#freezer-toggle');"), 'Freezer toggle wired');
  assert.ok(shellJs.includes("const snapToggle = root.querySelector('#snap-toggle');"), 'Snap toggle wired');
  assert.ok(shellJs.includes("this.setHwAcceleration(e.target.checked)"), 'Calls setHwAcceleration');
  assert.ok(shellJs.includes("this.setFreezer(e.target.checked)"), 'Calls setFreezer');
  assert.ok(shellJs.includes("this.setDisplayScale(e.target.value)"), 'Calls setDisplayScale');
});

// ------------------------------------------------------------------------------
// 9. Process Lifecycle Freezer Enforcement
// ------------------------------------------------------------------------------
runTest('Process lifecycle daemon respects freezerEnabled toggle', () => {
  assert.ok(shellJs.includes("this.freezerEnabled !== false && !hasLease && elapsedInactive > 12"), 'Process daemon guards freeze check with freezerEnabled');
  assert.ok(shellJs.includes("if (!this.freezerEnabled) {"), 'Disabling freezer unfreezes all frozen windows');
});

// ------------------------------------------------------------------------------
// 10. Dock Mode Persistence & Start Menu Seamless Snapping
// ------------------------------------------------------------------------------
runTest('Dock mode persistence and Start Menu gap elimination', () => {
  assert.ok(shellJs.includes("localStorage.setItem('poly_dock_mode', mode);"), 'Dock mode persisted in localStorage');
  assert.ok(shellJs.includes("document.body.classList.toggle('has-taskbar', mode === 'taskbar');"), 'Body toggles has-taskbar class');
  assert.ok(styleCss.includes("body.has-taskbar #start-menu {"), 'CSS positions start menu directly above taskbar');
  assert.ok(styleCss.includes("bottom: 58px;"), 'Start menu bottom 58px in taskbar mode');
  assert.ok(styleCss.includes("body.dock-align-start #start-menu {"), 'CSS aligns start menu to left when dock is left-aligned');
});

// ------------------------------------------------------------------------------
// 11. Compositor Idle Sleep Wake on Unminimize & Focus
// ------------------------------------------------------------------------------
runTest('Compositor wakeRenderLoop invoked on focusWindow, minimizeWindow, restoreFromTray', () => {
  // Check focusWindow calls wakeRenderLoop
  const focusMatch = shellJs.match(/focusWindow\(id\) \{[\s\S]*?wakeRenderLoop\(\);[\s\S]*?\}/);
  assert.ok(focusMatch, 'focusWindow calls wakeRenderLoop');

  // Check minimizeWindow calls wakeRenderLoop
  const minMatch = shellJs.match(/minimizeWindow\(id\) \{[\s\S]*?wakeRenderLoop\(\);[\s\S]*?\}/);
  assert.ok(minMatch, 'minimizeWindow calls wakeRenderLoop');

  // Check restoreFromTray calls wakeRenderLoop
  const restoreMatch = shellJs.match(/restoreFromTray\(id\) \{[\s\S]*?wakeRenderLoop\(\);[\s\S]*?\}/);
  assert.ok(restoreMatch, 'restoreFromTray calls wakeRenderLoop');
});

// ------------------------------------------------------------------------------
// 12. App Store Key Mappings in Dock Indicators
// ------------------------------------------------------------------------------
runTest('App Store installed apps (canvas, arcade, calculator) mapped in getAppKeyForWindow', () => {
  assert.ok(shellJs.includes("'canvas'"), 'getAppKeyForWindow includes canvas');
  assert.ok(shellJs.includes("'arcade'"), 'getAppKeyForWindow includes arcade');
  assert.ok(shellJs.includes("'calculator'"), 'getAppKeyForWindow includes calculator');
});

// ------------------------------------------------------------------------------
// 13. Desktop Context Menu Widget Toggle Auto-Dismiss
// ------------------------------------------------------------------------------
runTest('Desktop context menu auto-dismisses and updates label on widget toggle', () => {
  assert.ok(shellJs.includes("const ctxMenu = document.getElementById('desktop-context-menu');"), 'Queries desktop context menu');
  assert.ok(shellJs.includes("if (ctxMenu) ctxMenu.classList.add('hidden');"), 'Auto-dismisses desktop context menu');
  assert.ok(shellJs.includes("ctxToggleSpan.textContent = isHidden ? '🧩 Show Desktop Widgets' : '🧩 Hide Desktop Widgets';"), 'Dynamic context menu label text');
});

// ------------------------------------------------------------------------------
// 14. Audio Engine Gating Logic Verification
// ------------------------------------------------------------------------------
runTest('PolyAudio properly mutes when disabled or volume is 0', () => {
  assert.ok(shellJs.includes("if (!this.enabled || this.volume <= 0) return null;"), 'PolyAudio ensures context only when enabled AND volume > 0');
});

// ------------------------------------------------------------------------------
// 15. Multi-Display Remote Close Messaging
// ------------------------------------------------------------------------------
runTest('Multi-Display manager notifies remote screen when window closes', () => {
  assert.ok(shellJs.includes("type: 'CLOSE_WINDOW_REMOTE'"), 'Sends CLOSE_WINDOW_REMOTE message to secondary display');
});

// ------------------------------------------------------------------------------
// Summary
// ------------------------------------------------------------------------------
console.log('\n========================================');
console.log(`Issue 20 Tests Completed: ${passedTests}/${totalTests} Passed`);
console.log('========================================');

if (passedTests === totalTests) {
  console.log('🎉 ALL ISSUE 20 TESTS PASSED WITH 100% SUCCESS RATE!\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED!\n');
  process.exit(1);
}
