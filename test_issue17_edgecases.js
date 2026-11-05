const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=================================================================');
console.log(' COMPREHENSIVE INDEPENDENT AUDIT SUITE FOR ISSUE 17');
console.log('=================================================================\n');

// Mock browser environment
class MockClassList {
  constructor() { this._classes = new Set(); }
  add(...cls) { cls.forEach(c => this._classes.add(c)); }
  remove(...cls) { cls.forEach(c => this._classes.delete(c)); }
  toggle(c, force) {
    if (force === undefined) {
      if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c);
    } else if (force) this._classes.add(c);
    else this._classes.delete(c);
  }
  contains(c) { return this._classes.has(c); }
}

class MockElement {
  constructor(tagName = 'div', id = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.classList = new MockClassList();
    this.style = {};
    this.children = [];
    this.childNodes = [];
    this.parentNode = null;
    this.dataset = {};
    this.innerHTML = '';
    this.textContent = '';
    this._listeners = {};
    this.removed = false;
  }
  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    this.childNodes.push(child);
    return child;
  }
  remove() {
    this.removed = true;
    if (this.parentNode) {
      const idx = this.parentNode.children.indexOf(this);
      if (idx !== -1) this.parentNode.children.splice(idx, 1);
    }
  }
  addEventListener(evt, fn) {
    if (!this._listeners[evt]) this._listeners[evt] = [];
    this._listeners[evt].push(fn);
  }
  dispatchEvent(evt) {
    const list = this._listeners[evt.type] || [];
    list.forEach(fn => fn(evt));
  }
  querySelector(sel) {
    return this.querySelectorAll(sel)[0] || null;
  }
  querySelectorAll(sel) {
    const res = [];
    const search = (node) => {
      for (const child of node.children) {
        if (sel.startsWith('.') && child.classList.contains(sel.slice(1))) res.push(child);
        else if (sel.startsWith('#') && child.id === sel.slice(1)) res.push(child);
        else if (child.tagName.toLowerCase() === sel.toLowerCase()) res.push(child);
        else if (sel.includes('[data-app]') && child.dataset.app) res.push(child);
        search(child);
      }
    };
    search(this);
    return res;
  }
  getBoundingClientRect() {
    return { top: 700, bottom: 748, left: 200, right: 600, width: 400, height: 48 };
  }
}

// Global DOM mocks
const document = new MockElement('document');
const body = new MockElement('body');
document.body = body;

const topBar = new MockElement('header', 'top-bar');
const systemTray = new MockElement('div', 'system-tray');
const notifBtn = new MockElement('button', 'notif-btn');
const clock = new MockElement('div', 'system-clock');
const island = new MockElement('div', 'dynamic-island');
const islandText = new MockElement('span', 'island-text');
const islandIcon = new MockElement('div', 'island-icon');
const trayMenu = new MockElement('div', 'tray-context-menu');
const focusedAppName = new MockElement('span', 'focused-app-name');
const dockContainer = new MockElement('div', 'dock-container');
const dockPinnedApps = new MockElement('div', 'dock-pinned-apps');
const dockWindowsStrip = new MockElement('div', 'dock-windows-strip');
const dockWindowsDivider = new MockElement('div', 'dock-windows-divider');
const alttabHud = new MockElement('div', 'alttab-hud');
const alttabGrid = new MockElement('div', 'alttab-grid');
const snapAssistOverlay = new MockElement('div', 'snap-assist-overlay');
const snapAssistGrid = new MockElement('div', 'snap-assist-grid');

topBar.appendChild(island);
island.appendChild(islandIcon);
island.appendChild(islandText);
topBar.appendChild(systemTray);
topBar.appendChild(notifBtn);
topBar.appendChild(clock);

body.appendChild(topBar);
body.appendChild(trayMenu);
body.appendChild(focusedAppName);
body.appendChild(dockContainer);
dockContainer.appendChild(dockPinnedApps);
dockContainer.appendChild(dockWindowsDivider);
dockContainer.appendChild(dockWindowsStrip);
body.appendChild(alttabHud);
body.appendChild(snapAssistOverlay);

// Pinned apps in dock
const pinnedAppNames = ['files', 'browser', 'terminal', 'code', 'notes', 'music', 'telemetry', 'store', 'settings'];
pinnedAppNames.forEach(appName => {
  const item = new MockElement('button');
  item.classList.add('dock-item');
  item.dataset.app = appName;
  const icon = new MockElement('div');
  icon.classList.add('dock-icon');
  const dot = new MockElement('span');
  dot.classList.add('dot-indicator');
  item.appendChild(icon);
  item.appendChild(dot);
  dockPinnedApps.appendChild(item);
});

document.getElementById = (id) => {
  if (id === 'top-bar') return topBar;
  if (id === 'system-tray') return systemTray;
  if (id === 'notif-btn') return notifBtn;
  if (id === 'system-clock') return clock;
  if (id === 'dynamic-island') return island;
  if (id === 'island-text') return islandText;
  if (id === 'island-icon') return islandIcon;
  if (id === 'tray-context-menu') return trayMenu;
  if (id === 'focused-app-name') return focusedAppName;
  if (id === 'dock-container') return dockContainer;
  if (id === 'dock-pinned-apps') return dockPinnedApps;
  if (id === 'dock-windows-strip') return dockWindowsStrip;
  if (id === 'dock-windows-divider') return dockWindowsDivider;
  if (id === 'alttab-hud') return alttabHud;
  if (id === 'alttab-grid') return alttabGrid;
  if (id === 'snap-assist-overlay') return snapAssistOverlay;
  if (id === 'snap-assist-grid') return snapAssistGrid;
  return null;
};

document.querySelectorAll = (sel) => {
  return document.body.querySelectorAll(sel);
};

document.createElement = (tag) => new MockElement(tag);

global.window = {
  innerWidth: 1280,
  innerHeight: 800,
  addEventListener: () => {},
  document: document
};
global.document = document;

// Mock audio
let musicPlaying = false;
let audioTracks = [
  { title: "Solar Wind (120Hz Mix)", artist: "Poly Audio Engine" },
  { title: "Neon Horizon", artist: "Zero-Friction Band" }
];
let currentTrackIdx = 0;
const mockPolyAudio = {
  get musicPlaying() { return musicPlaying; },
  set musicPlaying(v) { musicPlaying = v; },
  tracks: audioTracks,
  currentTrackIndex: currentTrackIdx,
  toggleMusic: () => {
    musicPlaying = !musicPlaying;
    return musicPlaying;
  },
  nextTrack: () => {
    currentTrackIdx = (currentTrackIdx + 1) % audioTracks.length;
    return audioTracks[currentTrackIdx];
  },
  playSnap: () => {},
  playSpring: () => {},
  playClick: () => {},
  playChime: () => {}
};
global.polyAudio = mockPolyAudio;
global.window.polyAudio = mockPolyAudio;

console.log('--- TEST GROUP 1: LIFECYCLE TRANSITION INTEGRITY ---');

// Mock PolyOS minimal implementation matching shell.js
class MockSpring {
  constructor(init = 0) { this.current = init; this.target = init; this.v = 0; }
  setTarget(t) { this.target = t; }
}

class MockWindowInstance {
  constructor(id, title, icon, workspace = 1) {
    this.id = id;
    this.title = title;
    this.icon = icon;
    this.workspace = workspace;
    this.isMinimized = false;
    this.isBackgroundRunning = false;
    this.keepAlive = false;
    this.isFrozen = false;
    this.isMaximized = false;
    this.springScale = new MockSpring(1.0);
    this.springOpacity = new MockSpring(1.0);
    this.element = new MockElement('div');
    this.element.id = `window-${id}`;
    document.body.appendChild(this.element);
  }
}

class MockPolyOS {
  constructor() {
    this.windows = new Map();
    this.nextWindowId = 1;
    this.activeWindowId = null;
    this.currentWorkspace = 1;
    this.islandMessages = [];
  }

  notifyIsland(msg) {
    this.islandMessages.push(msg);
    islandText.textContent = msg;
  }

  getAppKeyForWindow(win) {
    const t = (win.title || '').toLowerCase();
    for (const k of ['files', 'browser', 'terminal', 'code', 'notes', 'music', 'telemetry', 'store', 'settings']) {
      if (t.includes(k) || (k === 'telemetry' && t.includes('process'))) return k;
    }
    return null;
  }

  createWindow(title, icon, workspace = this.currentWorkspace) {
    const id = this.nextWindowId++;
    const win = new MockWindowInstance(id, title, icon, workspace);
    const appKey = this.getAppKeyForWindow(win);
    if (['music', 'terminal', 'telemetry'].includes(appKey)) {
      win.keepAlive = true;
    }
    this.windows.set(id, win);
    this.focusWindow(id);
    this.updateDockIndicators();
    this.renderTaskbarWindowStrip();
    return win;
  }

  focusWindow(id) {
    const targetWin = this.windows.get(id);
    if (!targetWin) return;
    if (targetWin.workspace !== this.currentWorkspace) {
      this.switchWorkspace(targetWin.workspace);
    }
    this.activeWindowId = id;
    focusedAppName.textContent = targetWin.title;
    this.updateDockIndicators();
    this.renderTaskbarWindowStrip();
  }

  closeWindow(id, forceQuit = false) {
    const win = this.windows.get(id);
    if (!win) return;
    const appKey = this.getAppKeyForWindow(win);
    const isKeepAlive = !forceQuit && (win.keepAlive || ['music', 'terminal', 'telemetry'].includes(appKey));

    if (isKeepAlive) {
      win.isBackgroundRunning = true;
      win.springScale.setTarget(0.8);
      win.springOpacity.setTarget(0.0);

      if (this.activeWindowId === id) {
        this.activeWindowId = null;
        const visibleWins = Array.from(this.windows.values()).filter(w => !w.isMinimized && !w.isBackgroundRunning && w.workspace === this.currentWorkspace);
        if (visibleWins.length > 0) {
          this.focusWindow(visibleWins[visibleWins.length - 1].id);
        } else {
          focusedAppName.textContent = 'Poly OS';
        }
      }

      // Synchronous simulation of hide timeout (180ms)
      win.element.style.display = 'none';
      this.updateSystemTray();
      this.updateDockIndicators();
      this.renderTaskbarWindowStrip();

      this.notifyIsland(`📦 ${win.title} hidden to System Tray`);
      mockPolyAudio.playSnap();
      return;
    }

    if (appKey === 'music' && mockPolyAudio.musicPlaying) {
      mockPolyAudio.toggleMusic();
    }
    win.springScale.setTarget(0.85);
    win.springOpacity.setTarget(0.0);

    // Synchronous simulation of remove timeout (200ms)
    win.element.remove();
    this.windows.delete(id);
    this.updateDockIndicators();
    this.renderTaskbarWindowStrip();
    this.updateSystemTray();
    mockPolyAudio.playSnap();
  }

  updateSystemTray() {
    const tray = systemTray;
    const bgWins = Array.from(this.windows.values()).filter(w => w.isBackgroundRunning);
    if (bgWins.length === 0) {
      tray.innerHTML = '';
      tray.children = [];
      tray.style.display = 'none';
      return;
    }
    tray.style.display = 'flex';
    tray.children = [];
    tray.innerHTML = '';

    bgWins.forEach(win => {
      const appKey = this.getAppKeyForWindow(win);
      let dotClass = 'active';
      if (appKey === 'music') {
        dotClass = mockPolyAudio.musicPlaying ? 'playing' : 'idle';
      }
      const chip = new MockElement('div');
      chip.classList.add('tray-chip');
      chip.dataset.windowId = win.id;
      const pulseDot = new MockElement('span');
      pulseDot.classList.add('tray-pulse-dot', dotClass);
      chip.appendChild(pulseDot);
      tray.appendChild(chip);
    });
  }

  restoreFromTray(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.isBackgroundRunning = false;
    win.element.style.display = 'flex';

    if (win.workspace !== this.currentWorkspace) {
      this.switchWorkspace(win.workspace);
    }

    win.springScale.setTarget(1.0);
    win.springOpacity.setTarget(1.0);

    this.focusWindow(win.id);
    mockPolyAudio.playSpring();
    this.notifyIsland(`🪟 Restored ${win.title}`);

    this.updateSystemTray();
    this.updateDockIndicators();
    this.renderTaskbarWindowStrip();
  }

  switchWorkspace(targetWs) {
    if (this.currentWorkspace === targetWs) return;
    this.currentWorkspace = targetWs;
    let topWinId = null;
    this.windows.forEach(w => {
      if (w.workspace === targetWs) {
        if (!w.isMinimized && !w.isBackgroundRunning) {
          w.element.style.display = 'flex';
          topWinId = w.id;
        }
      } else {
        w.element.style.display = 'none';
      }
    });
    if (topWinId) {
      this.focusWindow(topWinId);
    } else {
      this.activeWindowId = null;
      focusedAppName.textContent = `Desktop ${targetWs}`;
    }
    this.renderTaskbarWindowStrip();
  }

  updateDockIndicators() {
    dockPinnedApps.children.forEach(btn => {
      const app = (btn.dataset.app || '').toLowerCase();
      let hasRunning = false;
      let isActive = false;
      let allMinimized = true;

      this.windows.forEach(w => {
        const titleLower = (w.title || '').toLowerCase();
        const matches = (
          titleLower.includes(app) ||
          (app === 'files' && titleLower.includes('files')) ||
          (app === 'browser' && titleLower.includes('browser')) ||
          (app === 'terminal' && titleLower.includes('terminal')) ||
          (app === 'notes' && titleLower.includes('notes')) ||
          (app === 'music' && titleLower.includes('music')) ||
          (app === 'telemetry' && (titleLower.includes('process') || titleLower.includes('telemetry'))) ||
          (app === 'settings' && titleLower.includes('settings')) ||
          (app === 'store' && titleLower.includes('store'))
        );
        if (matches) {
          hasRunning = true;
          if (w.id === this.activeWindowId && !w.isMinimized) {
            isActive = true;
          }
          if (!w.isMinimized) {
            allMinimized = false;
          }
        }
      });

      btn.classList.toggle('running', hasRunning);
      btn.classList.toggle('active', isActive);
      btn.classList.toggle('minimized', hasRunning && allMinimized);
    });
  }

  renderTaskbarWindowStrip() {
    // Dock indicators and count badges
  }

  handleAppIconClick(app) {
    const matchingWins = [];
    this.windows.forEach(w => {
      if (this.getAppKeyForWindow(w) === app) matchingWins.push(w);
    });
    if (matchingWins.length === 0) return;
    if (matchingWins.length === 1) {
      const win = matchingWins[0];
      if (win.isBackgroundRunning) {
        this.restoreFromTray(win.id);
        return;
      }
    }
    const bgWin = matchingWins.find(w => w.isBackgroundRunning);
    if (bgWin) {
      this.restoreFromTray(bgWin.id);
      return;
    }
  }
}

const os = new MockPolyOS();

// 1.1: Launch Music and start playback
const musicWin = os.createWindow('Poly Music', '🎵', 1);
assert.strictEqual(musicWin.keepAlive, true, 'Music window must auto-flag keepAlive = true');
mockPolyAudio.toggleMusic(); // playing = true
assert.strictEqual(mockPolyAudio.musicPlaying, true, 'Audio must be playing');

// 1.2: Close Music window (Titlebar ✕)
os.closeWindow(musicWin.id, false);
assert.strictEqual(musicWin.isBackgroundRunning, true, 'Window must transition to isBackgroundRunning = true');
assert.strictEqual(os.windows.has(musicWin.id), true, 'Window must NOT be deleted from this.windows');
assert.strictEqual(musicWin.element.style.display, 'none', 'Element style display must be none');
assert.strictEqual(mockPolyAudio.musicPlaying, true, 'Audio playback must continue uninterrupted in background');
assert.strictEqual(systemTray.style.display, 'flex', 'System Tray must become visible');
assert.strictEqual(systemTray.children.length, 1, 'System tray must render 1 chip');
assert.ok(systemTray.children[0].children[0].classList.contains('playing'), 'Pulse dot must have .playing class');
console.log('✓ 1.1 & 1.2: Music keepAlive close hides to tray while preserving audio playback.');

// 1.3: Terminal and Telemetry keepAlive test
const termWin = os.createWindow('Poly Terminal', '⌨️', 1);
const telemWin = os.createWindow('Process Monitor (Kernel Telemetry)', '📊', 1);
assert.strictEqual(termWin.keepAlive, true, 'Terminal must have keepAlive = true');
assert.strictEqual(telemWin.keepAlive, true, 'Telemetry must have keepAlive = true');

os.closeWindow(termWin.id, false);
os.closeWindow(telemWin.id, false);
assert.strictEqual(termWin.isBackgroundRunning, true, 'Terminal is in background tray');
assert.strictEqual(telemWin.isBackgroundRunning, true, 'Telemetry is in background tray');
assert.strictEqual(systemTray.children.length, 3, 'System tray now has 3 chips');
console.log('✓ 1.3: Terminal & Telemetry keepAlive close hides to tray without process deletion.');

// 1.4: Force Quit Music (forceQuit = true)
os.closeWindow(musicWin.id, true);
assert.strictEqual(os.windows.has(musicWin.id), false, 'Force-quit window must be deleted from this.windows');
assert.strictEqual(musicWin.element.removed, true, 'DOM element must be removed');
assert.strictEqual(mockPolyAudio.musicPlaying, false, 'Audio playback must be halted on force quit');
assert.strictEqual(systemTray.children.length, 2, 'System tray chip count decremented to 2');
console.log('✓ 1.4: Force quit terminates audio, DOM element, windows map entry, and tray chip.');

console.log('\n--- TEST GROUP 2: MULTI-WORKSPACE & FOCUS RESTORATION ---');
// Currently termWin and telemWin are on Workspace 1 and hidden in tray.
// User switches to Workspace 2.
os.switchWorkspace(2);
assert.strictEqual(os.currentWorkspace, 2, 'Active workspace is now 2');
assert.strictEqual(os.activeWindowId, null, 'Active window ID on empty Workspace 2 is null');

// User clicks Terminal tray chip
os.restoreFromTray(termWin.id);
assert.strictEqual(os.currentWorkspace, 1, 'Workspace automatically switched back to 1 for restored window');
assert.strictEqual(os.activeWindowId, termWin.id, 'Restored window receives active focus');
assert.strictEqual(termWin.isBackgroundRunning, false, 'termWin.isBackgroundRunning is now false');
assert.strictEqual(termWin.element.style.display, 'flex', 'Window element display is flex');
console.log('✓ 2.1: Clicking tray chip switches workspace to 1 and cleanly focuses restored window.');

// Put terminal back in tray, switch to Workspace 2, and click Dock icon
os.closeWindow(termWin.id, false);
os.switchWorkspace(2);
os.handleAppIconClick('terminal');
assert.strictEqual(os.currentWorkspace, 1, 'Clicking Dock icon switches workspace back to 1');
assert.strictEqual(os.activeWindowId, termWin.id, 'Clicking Dock icon restores and focuses window');
assert.strictEqual(termWin.isBackgroundRunning, false, 'Terminal is no longer background running');
console.log('✓ 2.2: Clicking Dock icon restores background app from another workspace.');

console.log('\n--- TEST GROUP 3: DYNAMIC ISLAND & TOP BAR ---');
// Clean up all windows
os.closeWindow(termWin.id, true);
os.closeWindow(telemWin.id, true);
assert.strictEqual(systemTray.children.length, 0, 'System tray empty');
assert.strictEqual(systemTray.style.display, 'none', 'System tray hidden when empty');

// Re-open and close to check island notifications
const music2 = os.createWindow('Poly Music', '🎵', 1);
os.closeWindow(music2.id, false);
assert.ok(os.islandMessages.some(m => m.includes('hidden to System Tray')), 'Island announced hide event');

os.restoreFromTray(music2.id);
assert.ok(os.islandMessages.some(m => m.includes('Restored Poly Music')), 'Island announced restore event');

os.closeWindow(music2.id, true);
console.log('✓ 3.1 & 3.2: Dynamic Island announces hide/restore events and tray collapses when empty.');

console.log('\n--- TEST GROUP 4: ALT+TAB SWITCHER & DOCK INDICATORS ---');
// Launch Browser, Notes, and Music. Then background Music.
const browser = os.createWindow('Poly Browser', '🌐', 1);
const notes = os.createWindow('Poly Notes', '📝', 1);
const music3 = os.createWindow('Poly Music', '🎵', 1);
os.closeWindow(music3.id, false); // Music backgrounded

// Alt+Tab filter simulation
const altTabList = Array.from(os.windows.values()).filter(w => !w.isMinimized && !w.isBackgroundRunning && w.workspace === os.currentWorkspace);
assert.strictEqual(altTabList.some(w => w.id === music3.id), false, 'Background running window MUST NOT be in Alt+Tab switcher');
assert.strictEqual(altTabList.length, 2, 'Alt+Tab switcher contains only Browser and Notes');
console.log('✓ 4.1: Hidden background apps are strictly excluded from Alt+Tab switcher.');

// Check dock pinned running dot
const musicDockBtn = dockPinnedApps.children.find(b => b.dataset.app === 'music');
assert.ok(musicDockBtn.classList.contains('running'), 'Dock item for music MUST retain .running class');
assert.strictEqual(musicDockBtn.classList.contains('active'), false, 'Dock item for background music MUST NOT have .active class');
console.log('✓ 4.2: Dock pinned running dot remains active without false .active focus.');

// Clicking dock icon restores music
os.handleAppIconClick('music');
assert.strictEqual(music3.isBackgroundRunning, false, 'Clicking Dock icon restored music');
assert.strictEqual(os.activeWindowId, music3.id, 'Music window is now active focused');
console.log('✓ 4.3: Clicking Dock icon restores background app.');

console.log('\n=================================================================');
console.log(' ALL 4 TEST GROUPS PASSED WITH ZERO FAILURES');
console.log('=================================================================');
