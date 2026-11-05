/**
 * PolyOS Industrial Runtime Audit Suite
 * Verifies window closing buttons, toggle on/off controls, live wallpaper engine,
 * and shell lifecycle resilience in a simulated browser DOM environment.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting PolyOS Industrial Runtime Audit Suite...\n');

// 1. Synthesize minimal browser DOM mock
class MockDOMTokenList extends Set {
  add(token) { super.add(token); }
  remove(token) { super.delete(token); }
  contains(token) { return super.has(token); }
  toggle(token, force) {
    if (force !== undefined) {
      if (force) this.add(token); else this.delete(token);
      return force;
    }
    if (this.contains(token)) { this.delete(token); return false; }
    this.add(token); return true;
  }
}

function parseHTMLInto(html, parent) {
  parent.children = [];
  const tagRegex = /<([a-zA-Z0-9-]+)([^>]*?)(\/?)>|([^<]+)/g;
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  let stack = [parent];
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    const full = match[0];
    const tagName = match[1];
    const attrsStr = match[2];
    const selfClosing = match[3] === '/';
    const text = match[4];

    if (text) {
      if (stack.length > 0) {
        stack[stack.length - 1].textContent += text;
      }
      continue;
    }

    if (full.startsWith('</')) {
      const closeTag = full.match(/<\/([a-zA-Z0-9-]+)>/);
      if (closeTag) {
        const name = closeTag[1].toUpperCase();
        for (let i = stack.length - 1; i > 0; i--) {
          if (stack[i].tagName === name) {
            stack.length = i;
            break;
          }
        }
      }
      continue;
    }

    if (tagName) {
      let id = '';
      let className = '';
      const idMatch = attrsStr.match(/id=["']([^"']+)["']/);
      if (idMatch) id = idMatch[1];
      const classMatch = attrsStr.match(/class=["']([^"']+)["']/);
      if (classMatch) className = classMatch[1];

      const child = new MockElement(tagName, id, className);

      const dataRegex = /data-([a-zA-Z0-9-]+)=["']([^"']+)["']/g;
      let dMatch;
      while ((dMatch = dataRegex.exec(attrsStr)) !== null) {
        child.dataset[dMatch[1]] = dMatch[2];
      }

      if (id) {
        elementsById.set(id, child);
      }

      const currParent = stack[stack.length - 1];
      if (currParent) {
        currParent.appendChild(child);
      }

      if (!selfClosing && !voidTags.has(tagName.toLowerCase())) {
        stack.push(child);
      }
    }
  }
}

class MockElement {
  constructor(tag, id = '', className = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.classList = new MockDOMTokenList();
    if (className) className.split(' ').forEach(c => c && this.classList.add(c));
    this.style = {
      setProperty: (prop, val) => { this.style[prop] = val; },
      removeProperty: (prop) => { delete this.style[prop]; }
    };
    this.dataset = {};
    this.children = [];
    this.parentElement = null;
    this.listeners = {};
    this._innerHTML = '';
    this.textContent = '';
    this.isConnected = true;
  }

  get innerHTML() {
    return this._innerHTML || '';
  }

  set innerHTML(val) {
    this._innerHTML = String(val);
    parseHTMLInto(this._innerHTML, this);
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  dispatchEvent(event) {
    const list = this.listeners[event.type] || [];
    for (const fn of list) {
      fn(event);
    }
  }

  click() {
    this.dispatchEvent({
      type: 'click',
      target: this,
      stopPropagation: () => {},
      preventDefault: () => {}
    });
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const check = (el) => {
      let matches = false;
      if (selector.startsWith('#') && el.id === selector.slice(1)) matches = true;
      else if (selector.startsWith('.') && el.classList.contains(selector.slice(1))) matches = true;
      else if (selector.toLowerCase() === el.tagName.toLowerCase()) matches = true;
      else if (selector.includes('[data-') && el.dataset) {
        const match = selector.match(/\[data-([a-zA-Z0-9-]+)="([^"]+)"\]/);
        if (match && el.dataset[match[1]] === match[2]) matches = true;
      }
      if (matches) results.push(el);
      for (const child of el.children) check(child);
    };
    for (const child of this.children) check(child);
    return results;
  }

  appendChild(el) {
    el.parentElement = this;
    this.children.push(el);
    return el;
  }

  remove() {
    this.isConnected = false;
    if (this.parentElement) {
      this.parentElement.children = this.parentElement.children.filter(c => c !== this);
    }
  }

  closest(selector) {
    let cur = this;
    while (cur) {
      if (selector.startsWith('.') && cur.classList.contains(selector.slice(1))) return cur;
      if (selector.startsWith('#') && cur.id === selector.slice(1)) return cur;
      if (cur.tagName && cur.tagName.toLowerCase() === selector.toLowerCase()) return cur;
      cur = cur.parentElement;
    }
    return null;
  }
}

// 2. Setup global mock environment
const storageStore = {};
global.localStorage = {
  getItem: (k) => storageStore[k] || null,
  setItem: (k, v) => { storageStore[k] = String(v); },
  removeItem: (k) => { delete storageStore[k]; },
  clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
};

const elementsById = new Map();
const body = new MockElement('body');

global.document = {
  body: body,
  hidden: false,
  activeElement: body,
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => elementsById.get(id) || null,
  querySelector: (sel) => {
    if (sel.startsWith('#')) return elementsById.get(sel.slice(1)) || null;
    return body.querySelector(sel);
  },
  querySelectorAll: (sel) => body.querySelectorAll(sel),
  addEventListener: () => {}
};

function registerMockElement(id, tag = 'div', className = '') {
  const el = new MockElement(tag, id, className);
  elementsById.set(id, el);
  body.appendChild(el);
  return el;
}

// Build standard PolyOS shell elements in the mock DOM
registerMockElement('desktop');
registerMockElement('workspace');
registerMockElement('system-clock');
registerMockElement('expose-btn');
registerMockElement('desktop-context-menu', 'div', 'hidden');
registerMockElement('ctx-live-wallpaper');
registerMockElement('ctx-wallpaper');
registerMockElement('ctx-toggle-widgets');
registerMockElement('control-center', 'aside', 'hidden');
registerMockElement('notification-center', 'aside', 'hidden');
registerMockElement('start-menu', 'div', 'hidden');
registerMockElement('dynamic-island');
registerMockElement('island-pill');
registerMockElement('island-expanded-view', 'div', 'hidden');
registerMockElement('island-msg');
registerMockElement('dock');
registerMockElement('dock-container');
registerMockElement('dock-middle-scroll');
registerMockElement('toggle-wifi', 'button', 'active');
registerMockElement('topbar-wifi', 'button');
registerMockElement('toggle-bluetooth', 'button', 'active');
registerMockElement('topbar-bluetooth', 'button');
registerMockElement('toggle-airdrop', 'button');
registerMockElement('toggle-stage', 'button', 'active');
registerMockElement('toggle-appearance-theme', 'button');
registerMockElement('toggle-desktop-widgets', 'button');
registerMockElement('screen-brightness-overlay');
registerMockElement('taskbar-window-strip');

// Mock canvas and 2D context
const canvas = registerMockElement('live-wallpaper-canvas', 'canvas');
canvas.getContext = () => ({
  clearRect: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  createLinearGradient: () => ({ addColorStop: () => {} }),
  createRadialGradient: () => ({ addColorStop: () => {} }),
  fill: () => {},
  stroke: () => {},
  fillRect: () => {},
  arc: () => {},
  setTransform: () => {}
});

global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

global.window = {
  innerWidth: 1920,
  innerHeight: 1080,
  devicePixelRatio: 2,
  addEventListener: () => {},
  removeEventListener: () => {},
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  getSelection: () => ({ toString: () => '' })
};

global.performance = { now: () => Date.now() };

// 3. Load shell.js code to test runtime constructor and execution
const shellCode = fs.readFileSync(path.join(__dirname, 'poly-shell', 'shell.js'), 'utf8');

// Wrap and evaluate inside a function scope exposing our globals
let evaluatedPolyOS = null;
try {
  const runner = new Function(
    'window', 'document', 'localStorage', 'performance', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
    shellCode + '\nreturn { PolyOS, polyAudio };'
  );
  const result = runner(
    global.window, global.document, global.localStorage, global.performance, setTimeout, clearTimeout, setInterval, clearInterval
  );
  evaluatedPolyOS = result.PolyOS;
  console.log('✅ Shell script parsed and evaluated without syntax errors.');
} catch (err) {
  console.error('❌ Failed to evaluate shell.js:', err);
  process.exit(1);
}

// 4. Test PolyOS Constructor and Boot Stability
async function runAudit() {
  console.log('\n--- 1. PolyOS Boot & Global Reference Assignment ---');
  let os = null;
  try {
    os = new evaluatedPolyOS();
    console.log('✅ PolyOS instantiated successfully without uncaught exceptions.');
  } catch (err) {
    console.error('❌ PolyOS constructor threw:', err);
    process.exit(1);
  }

  assert(global.window.polyOS, 'window.polyOS must be assigned on boot');
  assert.strictEqual(global.window.polyOS, os, 'window.polyOS must refer to current PolyOS instance');
  console.log('✅ window.polyOS verified and globally available.');

  // 5. Test Live Wallpaper Engine & Cycling
  console.log('\n--- 2. Live Wallpaper Engine & Next Live Wallpaper Control ---');
  assert.strictEqual(typeof os.cycleLiveWallpaper, 'function', 'os.cycleLiveWallpaper must exist');
  const initialMode = os.liveWallpaperMode;
  console.log(`Initial wallpaper mode: ${initialMode}`);

  os.cycleLiveWallpaper();
  assert.notStrictEqual(os.liveWallpaperMode, initialMode, 'cycleLiveWallpaper must advance wallpaper mode');
  console.log(`Next wallpaper mode: ${os.liveWallpaperMode}`);
  assert.strictEqual(localStorage.getItem('poly_live_wallpaper_mode'), os.liveWallpaperMode, 'Mode must persist in localStorage');

  // Test clicking the context menu item
  const ctxLiveWall = document.getElementById('ctx-live-wallpaper');
  const ctxMenu = document.getElementById('desktop-context-menu');
  ctxMenu.classList.remove('hidden');
  ctxLiveWall.click();
  assert(ctxMenu.classList.contains('hidden'), 'Clicking next live wallpaper must auto-dismiss context menu');
  console.log('✅ Next Live Wallpaper button advances theme and auto-dismisses context menu.');

  // 6. Test Window Creation and Close Button Functionality
  console.log('\n--- 3. Window Lifecycle & Close Button (✕) Diagnostics ---');
  const browserWin = os.createWindow('Browser', '🌐', 100, 100, 800, 600, '<div id="test-browser">Content</div>');
  assert(os.windows.has(browserWin.id), 'Window must be registered in os.windows Map');
  assert(browserWin.element, 'Window DOM element must exist');

  const closeBtn = browserWin.element.querySelector('.btn-close');
  assert(closeBtn, 'Close button (.btn-close) must exist in window titlebar');

  // Click close button on regular window
  closeBtn.click();
  assert.strictEqual(browserWin.springOpacity.target, 0.0, 'Window spring opacity target must be 0 for closing animation');
  await new Promise(r => setTimeout(r, 260));
  assert(!os.windows.has(browserWin.id), 'Regular app window must be completely closed upon clicking close button');
  console.log('✅ Regular app close button properly terminates window and unregisters from PolyOS.');

  // Test Music Player keep-alive close behavior
  const musicWin = os.createWindow('Music Player', '🎵', 150, 150, 720, 500, '<div id="test-music">Audio</div>');
  assert(os.windows.has(musicWin.id), 'Music window must be registered');
  const musicCloseBtn = musicWin.element.querySelector('.btn-close');
  assert(musicCloseBtn, 'Music close button must exist');

  // Single click: should hide to tray
  musicCloseBtn.click();
  assert(musicWin.isBackgroundRunning, 'First click on music player close button must hide to background tray');
  console.log('✅ Music player first close hides to background tray.');

  // Repeat click within 2.5s: should force quit
  musicCloseBtn.click();
  await new Promise(r => setTimeout(r, 260));
  assert(!os.windows.has(musicWin.id), 'Second close within 2.5s must trigger force quit and terminate process');
  console.log('✅ Double-click repeat close terminates keep-alive background process.');

  // 7. Test Centralized Toggle Controls (Wi-Fi, Bluetooth, PolyDrop, Aero Snap, Freezer, Hardware Accel)
  console.log('\n--- 4. Toggle On/Off Controls Audit ---');

  // Wi-Fi toggle
  const initialWifi = os.wifiEnabled;
  os.toggleWifi();
  assert.strictEqual(os.wifiEnabled, !initialWifi, 'toggleWifi must invert wifiEnabled');
  assert.strictEqual(localStorage.getItem('poly_wifi_enabled'), String(!initialWifi), 'Wi-Fi preference must persist');
  console.log(`✅ Wi-Fi toggle verified: ${initialWifi} -> ${os.wifiEnabled}`);

  // Bluetooth toggle
  const initialBt = os.bluetoothEnabled;
  os.toggleBluetooth();
  assert.strictEqual(os.bluetoothEnabled, !initialBt, 'toggleBluetooth must invert bluetoothEnabled');
  assert.strictEqual(localStorage.getItem('poly_bluetooth_enabled'), String(!initialBt), 'Bluetooth preference must persist');
  console.log(`✅ Bluetooth toggle verified: ${initialBt} -> ${os.bluetoothEnabled}`);

  // PolyDrop toggle
  const p1 = os.polyDropMode;
  os.togglePolyDrop();
  assert.notStrictEqual(os.polyDropMode, p1, 'togglePolyDrop must advance mode');
  console.log(`✅ PolyDrop toggle verified: ${p1} -> ${os.polyDropMode}`);

  // Aero Snap toggle
  const initialSnap = os.aeroSnapEnabled;
  os.setAeroSnap(!initialSnap);
  assert.strictEqual(os.aeroSnapEnabled, !initialSnap, 'setAeroSnap must update state');
  console.log(`✅ Aero Snap toggle verified: ${initialSnap} -> ${os.aeroSnapEnabled}`);

  // Process Freezer toggle
  const initialFreezer = os.freezerEnabled;
  os.setFreezer(!initialFreezer);
  assert.strictEqual(os.freezerEnabled, !initialFreezer, 'setFreezer must update state');
  console.log(`✅ Process Freezer toggle verified: ${initialFreezer} -> ${os.freezerEnabled}`);

  // Hardware Acceleration toggle
  const initialHw = os.hwAccelEnabled;
  os.setHwAcceleration(!initialHw);
  assert.strictEqual(os.hwAccelEnabled, !initialHw, 'setHwAcceleration must update state');
  console.log(`✅ Hardware Acceleration toggle verified: ${initialHw} -> ${os.hwAccelEnabled}`);

  console.log('\n======================================================');
  console.log(' 🎉 ALL INDUSTRIAL RUNTIME AUDIT CHECKS PASSED (100%)');
  console.log('======================================================\n');
  process.exit(0);
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
