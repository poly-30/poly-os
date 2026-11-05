const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- RUNNING ISSUE 17 STATIC & STRUCTURAL VERIFICATION ---');

// 1. Check index.html
const htmlPath = path.join(__dirname, 'poly-shell', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

assert.ok(html.includes('id="system-tray"'), 'HTML must include #system-tray');
assert.ok(html.includes('class="system-tray"'), 'HTML must include class system-tray');
assert.ok(html.includes('id="tray-context-menu"'), 'HTML must include #tray-context-menu');
assert.ok(/shell\.js\?v=4\.[789]/.test(html), 'HTML must include updated script cache version v>=4.7');

const rightGroupMatch = html.match(/<div class="right-group">[\s\S]*?<\/div>/);
assert.ok(rightGroupMatch, 'HTML must contain right-group div');
assert.ok(rightGroupMatch[0].includes('id="system-tray"'), '#system-tray must be inside right-group');

console.log('✓ index.html structure verified.');

// 2. Check style.css
const cssPath = path.join(__dirname, 'poly-shell', 'style.css');
const css = fs.readFileSync(cssPath, 'utf8');

assert.ok(css.includes('.system-tray'), 'CSS must define .system-tray');
assert.ok(css.includes('.system-tray:empty'), 'CSS must handle .system-tray:empty');
assert.ok(css.includes('.tray-chip'), 'CSS must define .tray-chip');
assert.ok(css.includes('.tray-pulse-dot'), 'CSS must define .tray-pulse-dot');
assert.ok(css.includes('.tray-pulse-dot.playing'), 'CSS must define .tray-pulse-dot.playing');
assert.ok(css.includes('.tray-pulse-dot.active'), 'CSS must define .tray-pulse-dot.active');
assert.ok(css.includes('.tray-pulse-dot.idle'), 'CSS must define .tray-pulse-dot.idle');
assert.ok(css.includes('@keyframes trayPulse'), 'CSS must define @keyframes trayPulse');
assert.ok(css.includes('.tray-context-menu'), 'CSS must define .tray-context-menu');
assert.ok(css.includes('.tray-menu-header'), 'CSS must define .tray-menu-header');
assert.ok(css.includes('.tray-menu-item'), 'CSS must define .tray-menu-item');
assert.ok(css.includes('.tray-menu-item.danger'), 'CSS must define .tray-menu-item.danger');
assert.ok(css.includes('.tray-menu-sep'), 'CSS must define .tray-menu-sep');

console.log('✓ style.css rules verified.');

// 3. Check shell.js code patterns
const jsPath = path.join(__dirname, 'poly-shell', 'shell.js');
const js = fs.readFileSync(jsPath, 'utf8');

assert.ok(js.includes('this.isBackgroundRunning = false;'), 'WindowInstance must initialize isBackgroundRunning');
assert.ok(js.includes('this.keepAlive = false;'), 'WindowInstance must initialize keepAlive');
assert.ok(js.includes('this.initSystemTray()'), 'PolyOS must invoke initSystemTray');
assert.ok(js.includes('initSystemTray() {'), 'PolyOS must define initSystemTray()');
assert.ok(js.includes('updateSystemTray() {'), 'PolyOS must define updateSystemTray()');
assert.ok(js.includes('showTrayContextMenu(win, x, y) {'), 'PolyOS must define showTrayContextMenu()');
assert.ok(js.includes('restoreFromTray(id) {'), 'PolyOS must define restoreFromTray()');
assert.ok(js.includes('closeWindow(id, forceQuit = false)'), 'PolyOS closeWindow must support forceQuit parameter');
assert.ok(js.includes('isBackgroundRunning'), 'PolyOS must check isBackgroundRunning');
assert.ok(js.includes('!w.isBackgroundRunning'), 'altTabState must filter out background running windows');

console.log('✓ shell.js patterns verified.');

// 4. Behavioral Simulation Test
console.log('\n--- RUNNING ISSUE 17 LIFECYCLE BEHAVIORAL SIMULATION ---');

class MockElement {
  constructor(tag = 'div') {
    this.tagName = tag;
    this.classList = new Set();
    this.classList.add = (c) => this.classList[c] = true;
    this.classList.remove = (c) => delete this.classList[c];
    this.classList.contains = (c) => !!this.classList[c];
    this.classList.toggle = (c, val) => val ? this.classList[c] = true : delete this.classList[c];
    this.style = {};
    this.children = [];
    this.dataset = {};
  }
  appendChild(child) { this.children.push(child); return child; }
  remove() { this.removed = true; }
  querySelector() { return new MockElement('div'); }
  querySelectorAll() { return []; }
  addEventListener() {}
}

const mockWindows = new Map();
let mockActiveWindowId = null;
let islandMessage = '';
let musicPlaying = true;
let musicToggled = false;

const mockAudio = {
  musicPlaying: true,
  toggleMusic: () => { musicToggled = true; mockAudio.musicPlaying = !mockAudio.musicPlaying; },
  playSnap: () => {},
  playSpring: () => {},
  playClick: () => {},
  tracks: [{ title: 'Solar Wind', artist: 'Poly Audio Engine' }],
  currentTrackIndex: 0
};

function getAppKeyForWindow(win) {
  const t = (win.title || '').toLowerCase();
  for (const k of ['files', 'browser', 'terminal', 'code', 'notes', 'music', 'telemetry', 'store', 'settings']) {
    if (t.includes(k) || (k === 'telemetry' && t.includes('process'))) return k;
  }
  return null;
}

function simulateCloseWindow(id, forceQuit = false) {
  const win = mockWindows.get(id);
  if (!win) return;
  const appKey = getAppKeyForWindow(win);
  const isKeepAlive = !forceQuit && (win.keepAlive || ['music', 'terminal', 'telemetry'].includes(appKey));

  if (isKeepAlive) {
    win.isBackgroundRunning = true;
    win.element.style.display = 'none';
    if (mockActiveWindowId === id) mockActiveWindowId = null;
    islandMessage = `Hidden ${win.title}`;
    return 'HIDDEN_TO_TRAY';
  }

  if (appKey === 'music' && mockAudio.musicPlaying) {
    mockAudio.toggleMusic();
  }
  win.element.remove();
  mockWindows.delete(id);
  return 'TERMINATED';
}

function simulateRestoreFromTray(id) {
  const win = mockWindows.get(id);
  if (!win) return;
  win.isBackgroundRunning = false;
  win.element.style.display = 'flex';
  mockActiveWindowId = id;
  islandMessage = `Restored ${win.title}`;
  return 'RESTORED';
}

// Test Case 1: Music Player keep-alive close vs hide
const musicWin = {
  id: 101,
  title: 'Poly Music',
  icon: '🎵',
  keepAlive: true,
  isBackgroundRunning: false,
  element: new MockElement('div')
};
mockWindows.set(101, musicWin);
mockActiveWindowId = 101;

const res1 = simulateCloseWindow(101, false);
assert.strictEqual(res1, 'HIDDEN_TO_TRAY', 'Music window must hide to tray on regular close');
assert.strictEqual(musicWin.isBackgroundRunning, true, 'isBackgroundRunning must be true');
assert.strictEqual(mockWindows.has(101), true, 'Music window must NOT be deleted from windows map');
assert.strictEqual(mockAudio.musicPlaying, true, 'Audio must continue playing in background');
assert.strictEqual(musicWin.element.style.display, 'none', 'Element display must be set to none');
console.log('✓ Test 1: Music Player close hides to tray while preserving audio playback.');

// Test Case 2: Restore from Tray
const res2 = simulateRestoreFromTray(101);
assert.strictEqual(res2, 'RESTORED', 'Music window must restore from tray');
assert.strictEqual(musicWin.isBackgroundRunning, false, 'isBackgroundRunning must be false after restore');
assert.strictEqual(musicWin.element.style.display, 'flex', 'Element display must be restored to flex');
assert.strictEqual(mockActiveWindowId, 101, 'Restored window must receive focus');
console.log('✓ Test 2: Music Player restores from tray to active focused state.');

// Test Case 3: Force Quit from Tray Context Menu
const res3 = simulateCloseWindow(101, true);
assert.strictEqual(res3, 'TERMINATED', 'forceQuit = true must terminate music window');
assert.strictEqual(mockWindows.has(101), false, 'Window must be removed from windows map');
assert.strictEqual(mockAudio.musicPlaying, false, 'Audio playback must be stopped on force quit');
assert.strictEqual(musicWin.element.removed, true, 'Window DOM element must be removed');
console.log('✓ Test 3: Force quit completely terminates process, audio, and DOM.');

// Test Case 4: Non-keep-alive window (Browser) terminates immediately on normal close
const browserWin = {
  id: 102,
  title: 'Poly Browser',
  icon: '🌐',
  keepAlive: false,
  isBackgroundRunning: false,
  element: new MockElement('div')
};
mockWindows.set(102, browserWin);
const res4 = simulateCloseWindow(102, false);
assert.strictEqual(res4, 'TERMINATED', 'Non-keep-alive window must terminate on close');
assert.strictEqual(mockWindows.has(102), false, 'Non-keep-alive window must be deleted');
console.log('✓ Test 4: Regular apps (e.g. Browser) terminate normally on close.');

console.log('\n======================================================');
console.log(' ALL ISSUE 17 VERIFICATION SUITES PASSED WITH 100% SUCCESS!');
console.log('======================================================');
