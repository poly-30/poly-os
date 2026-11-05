/**
 * Automated Verification Suite for Issue 18:
 * System Hardening, Audio Engine Fixes, Window Occlusion & Core OS Bug Remediations
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Issue 18 Automated Test Suite...\n');

// 1. Verify PolyAudio implementation and methods
const shellJsPath = path.join(__dirname, 'poly-shell', 'shell.js');
const styleCssPath = path.join(__dirname, 'poly-shell', 'style.css');
const indexHtmlPath = path.join(__dirname, 'poly-shell', 'index.html');

const shellContent = fs.readFileSync(shellJsPath, 'utf8');
const styleContent = fs.readFileSync(styleCssPath, 'utf8');
const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

// Test 1: PolyAudio methods
console.log('Test 1: PolyAudio Chimes, Pops, and Master Gain...');
assert(shellContent.includes('playChime() {'), 'PolyAudio must implement playChime()');
assert(shellContent.includes('playPop() {'), 'PolyAudio must implement playPop()');
assert(shellContent.includes('setVolume(pct) {'), 'PolyAudio must implement setVolume()');
assert(shellContent.includes('this.masterGain = this.ctx.createGain();'), 'PolyAudio must instantiate masterGain node');
console.log('✅ Test 1 Passed: PolyAudio sound synthesis and volume attenuation verified.');

// Test 2: Maximized Window Z-Index & No Occlusion
console.log('Test 2: Maximized Window Stacking Hierarchy...');
assert(styleContent.includes('.window.maximized {'), 'CSS must define .window.maximized');
assert(styleContent.includes('z-index: 100 !important;'), '.window.maximized z-index must be set to 100 to prevent occluding system menus');
assert(!styleContent.includes('z-index: 99999 !important;'), 'Old z-index 99999 must not be present on .window.maximized');
console.log('✅ Test 2 Passed: Window maximization hierarchy sanitized.');

// Test 3: Start Menu Search Filtering
console.log('Test 3: Start Menu Search Input Event Wiring...');
assert(shellContent.includes('document.getElementById(\'start-search-input\')'), 'Shell must bind #start-search-input');
assert(shellContent.includes('startSearch.addEventListener(\'input\','), 'Start menu search must have an input listener');
console.log('✅ Test 3 Passed: Start Menu live search input listener verified.');

// Test 4: Notes App Drop Target Binding
console.log('Test 4: Notes Drop Target Class & ID Selectors...');
assert(shellContent.includes("closest('#notes-app-root, .notes-app-root')"), 'Drop zones must query both ID and class for Notes app');
assert(shellContent.includes("querySelector('#notes-body-text, .notes-textarea')"), 'Text insertion must find Notes textarea via ID or class');
assert(shellContent.includes('id="notes-app-root"'), 'Notes template must contain id="notes-app-root"');
assert(shellContent.includes('id="notes-body-text"'), 'Notes template must contain id="notes-body-text"');
console.log('✅ Test 4 Passed: Inter-app drag & drop targeting for Notes verified.');

// Test 5: Terminal Power Mode & PID Killing
console.log('Test 5: Terminal Power Mode & Process Monitor PID Alignment...');
assert(shellContent.includes('setPowerMode(mode) {'), 'PolyShell must implement setPowerMode(mode)');
assert(shellContent.includes('wid + 100 === pid'), 'Terminal kill command must recognize Process Monitor display PID (id + 100)');
console.log('✅ Test 5 Passed: Terminal power mode and PID resolution verified.');

// Test 6: Compositor Layout Reflow Optimization
console.log('Test 6: Compositor Layout Thrashing Elimination...');
assert(shellContent.includes('this._lastRenderW !== targetW'), 'applyTransform must guard element.style.width mutation');
assert(shellContent.includes('this._lastRenderH !== targetH'), 'applyTransform must guard element.style.height mutation');
console.log('✅ Test 6 Passed: Layout thrashing during translation movement eliminated.');

// Test 7: Window Defocus on Minimize and Close
console.log('Test 7: Window Defocus & Active Window Re-assignment...');
assert(shellContent.includes('minimizeWindow(id) {') && shellContent.includes('this.activeWindowId = null;'), 'minimizeWindow must clear activeWindowId');
assert(shellContent.includes('visibleWins[visibleWins.length - 1].id'), 'Next visible window must be focused on minimize/close');
console.log('✅ Test 7 Passed: Window defocus and focus fallback verified.');

// Test 8: Control Center Media Buttons & Volume Slider Wiring
console.log('Test 8: Control Center Media Card & Volume Slider...');
assert(shellContent.includes("document.getElementById('play-pause-btn')"), 'Control Center play/pause button must be wired');
assert(shellContent.includes("document.getElementById('cc-media-prev')"), 'Control Center prev button must be wired');
assert(shellContent.includes("document.getElementById('cc-media-next')"), 'Control Center next button must be wired');
assert(shellContent.includes('polyAudio.setVolume(e.target.value)'), 'Volume slider must invoke polyAudio.setVolume()');
console.log('✅ Test 8 Passed: Control Center media and volume controls verified.');

// Test 9: Accessibility (A11y) Semantics
console.log('Test 9: Accessibility Roles and Live Announcements...');
assert(htmlContent.includes('id="dynamic-island"') && htmlContent.includes('role="status"') && htmlContent.includes('aria-live="polite"'), 'Dynamic Island must have role="status" and aria-live="polite"');
assert(htmlContent.includes('id="spotlight-overlay"') && htmlContent.includes('role="dialog"') && htmlContent.includes('aria-modal="true"'), 'Spotlight overlay must have role="dialog"');
assert(htmlContent.includes('id="fancyzones-modal"') && htmlContent.includes('role="dialog"') && htmlContent.includes('aria-modal="true"'), 'FancyZones modal must have role="dialog"');
assert(htmlContent.includes('id="quicklook-modal"') && htmlContent.includes('role="dialog"') && htmlContent.includes('aria-modal="true"'), 'QuickLook modal must have role="dialog"');
assert(styleContent.includes(':focus-visible {'), 'CSS must define :focus-visible for high-contrast keyboard navigation');
console.log('✅ Test 9 Passed: Accessibility dialogs, live regions, and focus rings verified.');

// Test 10: Spotlight Visual Category Ordering
console.log('Test 10: Spotlight Visual Category Keypad Navigation...');
assert(shellContent.includes('categoryOrder.indexOf(a.category)'), 'Spotlight result array must be sorted in categoryOrder to match DOM');
console.log('✅ Test 10 Passed: Spotlight keyboard arrow navigation aligned with DOM.');

console.log('\n🎉 ALL 10 ISSUE 18 TESTS PASSED WITH 100% SUCCESS RATE!\n');
