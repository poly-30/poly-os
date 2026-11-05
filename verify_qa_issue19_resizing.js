/**
 * Independent Window Resizing & Pointer Physics QA Auditor Script
 * Target: Poly OS Issue 19 - 8-Directional Edge & Corner Manual Window Resizing
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const polyShellDir = path.join(__dirname, 'poly-shell');
const shellJsPath = path.join(polyShellDir, 'shell.js');
const styleCssPath = path.join(polyShellDir, 'style.css');

const shellJs = fs.readFileSync(shellJsPath, 'utf8');
const styleCss = fs.readFileSync(styleCssPath, 'utf8');

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  suites: []
};

function describe(suiteName, fn) {
  const currentSuite = { name: suiteName, tests: [] };
  results.suites.push(currentSuite);
  fn(currentSuite);
}

function test(suite, testName, fn) {
  results.total++;
  try {
    fn();
    suite.tests.push({ name: testName, status: 'PASS' });
    results.passed++;
    console.log(`  [PASS] ${testName}`);
  } catch (err) {
    suite.tests.push({ name: testName, status: 'FAIL', error: err.message, stack: err.stack });
    results.failed++;
    console.error(`  [FAIL] ${testName}: ${err.message}`);
  }
}

console.log('================================================================');
console.log('POLY OS ISSUE 19 QA AUDIT: 8-DIRECTIONAL WINDOW RESIZING & POINTER PHYSICS');
console.log('================================================================\n');

// -------------------------------------------------------------
// Suite 1: CSS Structural & Visual Presentation Verification
// -------------------------------------------------------------
describe('1. style.css: Resize Handle Styles & Pointer Cursors', (s) => {
  test(s, 'Base .window-resize-handle rule has absolute position, z-index 50, touch-action none, user-select none', () => {
    const handleBlockMatch = styleCss.match(/\.window-resize-handle\s*\{([^}]+)\}/);
    assert(handleBlockMatch, 'Could not find .window-resize-handle block in style.css');
    const body = handleBlockMatch[1];
    assert(/position\s*:\s*absolute\s*;/.test(body), 'Missing position: absolute');
    assert(/z-index\s*:\s*50\s*;/.test(body), 'Missing z-index: 50');
    assert(/touch-action\s*:\s*none\s*;/.test(body), 'Missing touch-action: none');
    assert(/user-select\s*:\s*none\s*;/.test(body), 'Missing user-select: none');
    assert(/pointer-events\s*:\s*auto\s*;/.test(body), 'Missing pointer-events: auto');
  });

  test(s, 'North/South edge handles have cursor: ns-resize', () => {
    const nMatch = styleCss.match(/\.window-resize-handle\.resize-n\s*\{([^}]+)\}/);
    const sMatch = styleCss.match(/\.window-resize-handle\.resize-s\s*\{([^}]+)\}/);
    assert(nMatch && /cursor\s*:\s*ns-resize\s*;/.test(nMatch[1]), 'resize-n missing cursor: ns-resize');
    assert(sMatch && /cursor\s*:\s*ns-resize\s*;/.test(sMatch[1]), 'resize-s missing cursor: ns-resize');
  });

  test(s, 'East/West edge handles have cursor: ew-resize', () => {
    const eMatch = styleCss.match(/\.window-resize-handle\.resize-e\s*\{([^}]+)\}/);
    const wMatch = styleCss.match(/\.window-resize-handle\.resize-w\s*\{([^}]+)\}/);
    assert(eMatch && /cursor\s*:\s*ew-resize\s*;/.test(eMatch[1]), 'resize-e missing cursor: ew-resize');
    assert(wMatch && /cursor\s*:\s*ew-resize\s*;/.test(wMatch[1]), 'resize-w missing cursor: ew-resize');
  });

  test(s, 'Northwest and Southeast corner handles have cursor: nwse-resize', () => {
    const nwMatch = styleCss.match(/\.window-resize-handle\.resize-nw\s*\{([^}]+)\}/);
    const seMatch = styleCss.match(/\.window-resize-handle\.resize-se\s*\{([^}]+)\}/);
    assert(nwMatch && /cursor\s*:\s*nwse-resize\s*;/.test(nwMatch[1]), 'resize-nw missing cursor: nwse-resize');
    assert(seMatch && /cursor\s*:\s*nwse-resize\s*;/.test(seMatch[1]), 'resize-se missing cursor: nwse-resize');
  });

  test(s, 'Northeast and Southwest corner handles have cursor: nesw-resize', () => {
    const neMatch = styleCss.match(/\.window-resize-handle\.resize-ne\s*\{([^}]+)\}/);
    const swMatch = styleCss.match(/\.window-resize-handle\.resize-sw\s*\{([^}]+)\}/);
    assert(neMatch && /cursor\s*:\s*nesw-resize\s*;/.test(neMatch[1]), 'resize-ne missing cursor: nesw-resize');
    assert(swMatch && /cursor\s*:\s*nesw-resize\s*;/.test(swMatch[1]), 'resize-sw missing cursor: nesw-resize');
  });

  test(s, 'Maximized and Snapped windows suppress resize handles via display: none !important', () => {
    const suppMatch = styleCss.match(/\.window\.maximized\s+\.window-resize-handle\s*,\s*\.window\.snapped\s+\.window-resize-handle\s*\{([^}]+)\}/);
    assert(suppMatch, 'Missing suppression rule for .window.maximized .window-resize-handle, .window.snapped .window-resize-handle');
    assert(/display\s*:\s*none\s*!important\s*;/.test(suppMatch[1]), 'Suppression rule must have display: none !important');
  });

  test(s, 'body.is-resizing-window enforces global user-select: none !important', () => {
    const bodyResizeMatch = styleCss.match(/body\.is-resizing-window\s*\{([^}]+)\}/);
    assert(bodyResizeMatch, 'Missing body.is-resizing-window rule');
    assert(/user-select\s*:\s*none\s*!important\s*;/.test(bodyResizeMatch[1]), 'body.is-resizing-window must have user-select: none !important');
  });
});

// -------------------------------------------------------------
// Suite 2: WindowInstance Constructor & Handle Instantiation
// -------------------------------------------------------------
describe('2. WindowInstance Constructor: 8-Directional Handle DOM Assembly', (s) => {
  // Mock DOM environment
  const globalListeners = {};
  const mockWindowListeners = {};

  class MockElement {
    constructor(tagName) {
      this.tagName = (tagName || 'div').toUpperCase();
      this._className = '';
      this._classList = new Set();
      this.classList = {
        add: (...cls) => cls.forEach(c => {
          this._classList.add(c);
          this._className = Array.from(this._classList).join(' ');
        }),
        remove: (...cls) => cls.forEach(c => {
          this._classList.delete(c);
          this._className = Array.from(this._classList).join(' ');
        }),
        contains: (c) => this._classList.has(c),
        toggle: (c, val) => (val ?? !this._classList.has(c)) ? this.classList.add(c) : this.classList.remove(c)
      };
      this.dataset = {};
      this.style = {};
      this.children = [];
      this.listeners = {};
      this._innerHTML = '';
    }

    set className(val) {
      this._className = val || '';
      this._classList = new Set((val || '').split(/\s+/).filter(Boolean));
    }

    get className() {
      return this._className || '';
    }

    set innerHTML(html) {
      this._innerHTML = html;
      this.children = [];
      const classRegex = /class=["']([^"']+)["']/g;
      let match;
      while ((match = classRegex.exec(html)) !== null) {
        const classNames = match[1].split(/\s+/).filter(Boolean);
        const child = new MockElement('div');
        child.classList.add(...classNames);
        this.children.push(child);
      }
    }

    get innerHTML() {
      return this._innerHTML;
    }

    appendChild(child) {
      this.children.push(child);
      return child;
    }

    querySelector(selector) {
      if (selector.startsWith('.')) {
        const cls = selector.slice(1);
        for (const child of this.children) {
          if (child.classList && child.classList.contains(cls)) return child;
          const found = child.querySelector && child.querySelector(selector);
          if (found) return found;
        }
      }
      return null;
    }

    querySelectorAll(selector) {
      const results = [];
      if (selector.startsWith('.')) {
        const cls = selector.slice(1);
        const search = (node) => {
          for (const c of node.children) {
            if (c.classList && c.classList.contains(cls)) results.push(c);
            search(c);
          }
        };
        search(this);
      }
      return results;
    }

    addEventListener(ev, fn) {
      if (!this.listeners[ev]) this.listeners[ev] = [];
      this.listeners[ev].push(fn);
    }

    removeEventListener(ev, fn) {
      if (!this.listeners[ev]) return;
      this.listeners[ev] = this.listeners[ev].filter(f => f !== fn);
    }

    dispatchEvent(ev, eventData = {}) {
      if (this.listeners[ev]) {
        this.listeners[ev].forEach(fn => fn({
          preventDefault: () => {},
          stopPropagation: () => {},
          ...eventData
        }));
      }
    }
  }

  // Build Sandbox Execution Context
  const sandbox = {
    document: {
      createElement: (tag) => new MockElement(tag),
      getElementById: (id) => new MockElement(id),
      body: new MockElement('body'),
    },
    window: {
      addEventListener: (ev, fn) => {
        if (!mockWindowListeners[ev]) mockWindowListeners[ev] = [];
        mockWindowListeners[ev].push(fn);
      },
      removeEventListener: (ev, fn) => {
        if (!mockWindowListeners[ev]) return;
        mockWindowListeners[ev] = mockWindowListeners[ev].filter(f => f !== fn);
      },
      dispatchEvent: (ev, eventData = {}) => {
        if (mockWindowListeners[ev]) {
          mockWindowListeners[ev].forEach(fn => fn({
            preventDefault: () => {},
            stopPropagation: () => {},
            ...eventData
          }));
        }
      },
      AudioContext: class {},
      webkitAudioContext: class {},
      innerWidth: 1920,
      innerHeight: 1080,
      devicePixelRatio: 2
    },
    performance: { now: () => Date.now() },
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: (id) => clearTimeout(id)
  };

  // Extract Spring1D and WindowInstance from shell.js
  const vm = require('vm');
  const codeToRun = `
    ${shellJs.slice(shellJs.indexOf('class Spring1D'), shellJs.indexOf('// --- 2.5 Poly IndexedDB'))}
    globalThis.Spring1D = Spring1D;
    globalThis.WindowInstance = WindowInstance;
  `;
  vm.runInNewContext(codeToRun, sandbox);

  const { WindowInstance, Spring1D } = sandbox;
  sandbox.polyOS = {
    focusWindow: () => {},
    wakeRenderLoop: () => {},
    closeWindow: () => {},
    minimizeWindow: () => {},
    toggleMaximize: () => {},
    hideSnapLayoutsFlyout: () => {},
    showSnapLayoutsFlyout: () => {},
    displayManager: null
  };
  sandbox.window.polyOS = sandbox.polyOS;

  const expectedDirs = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];

  let winInst = null;
  test(s, 'WindowInstance creates 8 handles matching ["n", "s", "e", "w", "nw", "ne", "sw", "se"]', () => {
    winInst = new WindowInstance('test-1', 'Test App', '🪟', 100, 100, 400, 300, '<div>Content</div>');
    const handles = winInst.element.querySelectorAll('.window-resize-handle');
    assert.strictEqual(handles.length, 8, `Expected 8 resize handles, got ${handles.length}`);

    const foundDirs = handles.map(h => h.dataset.dir);
    assert.deepStrictEqual(foundDirs, expectedDirs, `Expected dirs ${expectedDirs.join(', ')} but got ${foundDirs.join(', ')}`);
  });

  test(s, 'Each handle has classes "window-resize-handle resize-${dir}" and data-dir="${dir}"', () => {
    const handles = winInst.element.querySelectorAll('.window-resize-handle');
    handles.forEach(h => {
      const dir = h.dataset.dir;
      assert(h.classList.contains('window-resize-handle'), `Handle ${dir} missing window-resize-handle class`);
      assert(h.classList.contains(`resize-${dir}`), `Handle ${dir} missing resize-${dir} class`);
      assert.strictEqual(h.dataset.dir, dir, `Handle dataset.dir is ${h.dataset.dir}, expected ${dir}`);
    });
  });
});

// -------------------------------------------------------------
// Suite 3: Pointer Physics, Coordinate Math, Clamping & Lifecycle
// -------------------------------------------------------------
describe('3. WindowInstance.initResize: Pointer Lifecycle & Coordinate Math', (s) => {
  const mockWindowListeners = {};

  class MockElement {
    constructor(tagName) {
      this.tagName = (tagName || 'div').toUpperCase();
      this._className = '';
      this._classList = new Set();
      this.classList = {
        add: (...cls) => cls.forEach(c => {
          this._classList.add(c);
          this._className = Array.from(this._classList).join(' ');
        }),
        remove: (...cls) => cls.forEach(c => {
          this._classList.delete(c);
          this._className = Array.from(this._classList).join(' ');
        }),
        contains: (c) => this._classList.has(c),
        toggle: (c, val) => (val ?? !this._classList.has(c)) ? this.classList.add(c) : this.classList.remove(c)
      };
      this.dataset = {};
      this.style = {};
      this.children = [];
      this.listeners = {};
      this._innerHTML = '';
    }

    set className(val) {
      this._className = val || '';
      this._classList = new Set((val || '').split(/\s+/).filter(Boolean));
    }

    get className() {
      return this._className || '';
    }

    set innerHTML(html) {
      this._innerHTML = html;
      this.children = [];
      const classRegex = /class=["']([^"']+)["']/g;
      let match;
      while ((match = classRegex.exec(html)) !== null) {
        const classNames = match[1].split(/\s+/).filter(Boolean);
        const child = new MockElement('div');
        child.classList.add(...classNames);
        this.children.push(child);
      }
    }

    get innerHTML() {
      return this._innerHTML;
    }

    appendChild(child) {
      this.children.push(child);
      return child;
    }

    querySelector(selector) {
      if (selector.startsWith('.')) {
        const cls = selector.slice(1);
        for (const child of this.children) {
          if (child.classList && child.classList.contains(cls)) return child;
          const found = child.querySelector && child.querySelector(selector);
          if (found) return found;
        }
      }
      return null;
    }

    querySelectorAll(selector) {
      const results = [];
      if (selector.startsWith('.')) {
        const cls = selector.slice(1);
        const search = (node) => {
          for (const c of node.children) {
            if (c.classList && c.classList.contains(cls)) results.push(c);
            search(c);
          }
        };
        search(this);
      }
      return results;
    }

    addEventListener(ev, fn) {
      if (!this.listeners[ev]) this.listeners[ev] = [];
      this.listeners[ev].push(fn);
    }

    removeEventListener(ev, fn) {
      if (!this.listeners[ev]) return;
      this.listeners[ev] = this.listeners[ev].filter(f => f !== fn);
    }

    dispatchEvent(ev, eventData = {}) {
      if (this.listeners[ev]) {
        this.listeners[ev].forEach(fn => fn({
          preventDefault: () => {},
          stopPropagation: () => {},
          ...eventData
        }));
      }
    }
  }

  const sandbox = {
    document: {
      createElement: (tag) => new MockElement(tag),
      getElementById: (id) => new MockElement(id),
      body: new MockElement('body'),
    },
    window: {
      addEventListener: (ev, fn) => {
        if (!mockWindowListeners[ev]) mockWindowListeners[ev] = [];
        mockWindowListeners[ev].push(fn);
      },
      removeEventListener: (ev, fn) => {
        if (!mockWindowListeners[ev]) return;
        mockWindowListeners[ev] = mockWindowListeners[ev].filter(f => f !== fn);
      },
      dispatchEvent: (ev, eventData = {}) => {
        if (mockWindowListeners[ev]) {
          mockWindowListeners[ev].slice().forEach(fn => fn({
            preventDefault: () => {},
            stopPropagation: () => {},
            ...eventData
          }));
        }
      },
      innerWidth: 1920,
      innerHeight: 1080
    },
    performance: { now: () => Date.now() },
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: (id) => clearTimeout(id)
  };

  const vm = require('vm');
  const codeToRun = `
    ${shellJs.slice(shellJs.indexOf('class Spring1D'), shellJs.indexOf('// --- 2.5 Poly IndexedDB'))}
    globalThis.Spring1D = Spring1D;
    globalThis.WindowInstance = WindowInstance;
  `;
  vm.runInNewContext(codeToRun, sandbox);
  const { WindowInstance } = sandbox;

  let wakeCalls = 0;
  let focusCalls = 0;
  sandbox.polyOS = {
    focusWindow: () => { focusCalls++; },
    wakeRenderLoop: () => { wakeCalls++; },
    closeWindow: () => {},
    minimizeWindow: () => {},
    toggleMaximize: () => {},
    hideSnapLayoutsFlyout: () => {},
    showSnapLayoutsFlyout: () => {}
  };
  sandbox.window.polyOS = sandbox.polyOS;

  test(s, 'East handle (e): expands width by dx and clamps to minWidth 260px', () => {
    const win = new WindowInstance('w-e', 'East Test', '🧭', 100, 100, 400, 300, '');
    const eastHandle = win.element.querySelectorAll('.window-resize-handle').find(h => h.dataset.dir === 'e');
    assert(eastHandle, 'East handle not found');

    // Pointer down at x=500, y=250
    eastHandle.dispatchEvent('pointerdown', { clientX: 500, clientY: 250 });
    assert(sandbox.document.body.classList.contains('is-resizing-window'), 'body should have is-resizing-window');

    // Drag +50px right
    sandbox.window.dispatchEvent('pointermove', { clientX: 550, clientY: 250 });
    assert.strictEqual(win.springW.target, 450, `Expected width 450, got ${win.springW.target}`);
    assert.strictEqual(win.springX.target, 100, `Expected X to remain 100, got ${win.springX.target}`);
    assert.strictEqual(win.restoreBounds.w, 450, 'restoreBounds width should be 450');

    // Drag left by -200px (origW 400 - 200 = 200 < 260 minW)
    sandbox.window.dispatchEvent('pointermove', { clientX: 300, clientY: 250 });
    assert.strictEqual(win.springW.target, 260, `Expected width clamped to 260, got ${win.springW.target}`);
    assert.strictEqual(win.restoreBounds.w, 260, 'restoreBounds width should be 260');

    // Pointer up
    sandbox.window.dispatchEvent('pointerup');
    assert(!sandbox.document.body.classList.contains('is-resizing-window'), 'body should remove is-resizing-window');
  });

  test(s, 'South handle (s): expands height by dy and clamps to minHeight 160px', () => {
    const win = new WindowInstance('w-s', 'South Test', '🧭', 100, 100, 400, 300, '');
    const southHandle = win.element.querySelectorAll('.window-resize-handle').find(h => h.dataset.dir === 's');

    southHandle.dispatchEvent('pointerdown', { clientX: 300, clientY: 400 });

    // Drag +100px down
    sandbox.window.dispatchEvent('pointermove', { clientX: 300, clientY: 500 });
    assert.strictEqual(win.springH.target, 400, `Expected height 400, got ${win.springH.target}`);
    assert.strictEqual(win.springY.target, 100, `Expected Y to remain 100, got ${win.springY.target}`);
    assert.strictEqual(win.restoreBounds.h, 400, 'restoreBounds height should be 400');

    // Drag up by -200px (origH 300 - 200 = 100 < 160 minH)
    sandbox.window.dispatchEvent('pointermove', { clientX: 300, clientY: 200 });
    assert.strictEqual(win.springH.target, 160, `Expected height clamped to 160, got ${win.springH.target}`);
    assert.strictEqual(win.restoreBounds.h, 160, 'restoreBounds height should be 160');

    sandbox.window.dispatchEvent('pointerup');
  });

  test(s, 'West handle (w): adjusts width, shifts X coordinate, and clamps to minWidth 260px', () => {
    const win = new WindowInstance('w-w', 'West Test', '🧭', 100, 100, 400, 300, '');
    const westHandle = win.element.querySelectorAll('.window-resize-handle').find(h => h.dataset.dir === 'w');

    westHandle.dispatchEvent('pointerdown', { clientX: 100, clientY: 250 });

    // Drag left by -50px (dx = -50, width expands by 50, X moves left by 50)
    sandbox.window.dispatchEvent('pointermove', { clientX: 50, clientY: 250 });
    assert.strictEqual(win.springW.target, 450, `Expected width 450, got ${win.springW.target}`);
    assert.strictEqual(win.springX.target, 50, `Expected X 50, got ${win.springX.target}`);
    assert.strictEqual(win.restoreBounds.x, 50);
    assert.strictEqual(win.restoreBounds.y, 100);
    assert.strictEqual(win.restoreBounds.w, 450);
    assert.strictEqual(win.restoreBounds.h, 300);

    // Drag right by +250px (potentialW = 400 - 250 = 150 < 260 minW)
    sandbox.window.dispatchEvent('pointermove', { clientX: 350, clientY: 250 });
    // When clamped: newW = 260, newX = origX + (origW - minW) = 100 + (400 - 260) = 240
    assert.strictEqual(win.springW.target, 260, `Expected width clamped to 260, got ${win.springW.target}`);
    assert.strictEqual(win.springX.target, 240, `Expected X clamped to 240, got ${win.springX.target}`);
    assert.strictEqual(win.restoreBounds.x, 240);
    assert.strictEqual(win.restoreBounds.y, 100);
    assert.strictEqual(win.restoreBounds.w, 260);
    assert.strictEqual(win.restoreBounds.h, 300);

    sandbox.window.dispatchEvent('pointerup');
  });

  test(s, 'North handle (n): adjusts height, shifts Y, clamps to minHeight 160px & menubar bounds (>= 38px)', () => {
    const win = new WindowInstance('w-n', 'North Test', '🧭', 100, 100, 400, 300, '');
    const northHandle = win.element.querySelectorAll('.window-resize-handle').find(h => h.dataset.dir === 'n');

    northHandle.dispatchEvent('pointerdown', { clientX: 300, clientY: 100 });

    // Drag up by -40px (dy = -40, height expands by 40 to 340, Y moves to 60 >= 38)
    sandbox.window.dispatchEvent('pointermove', { clientX: 300, clientY: 60 });
    assert.strictEqual(win.springH.target, 340, `Expected height 340, got ${win.springH.target}`);
    assert.strictEqual(win.springY.target, 60, `Expected Y 60, got ${win.springY.target}`);
    assert.strictEqual(win.restoreBounds.x, 100);
    assert.strictEqual(win.restoreBounds.y, 60);
    assert.strictEqual(win.restoreBounds.w, 400);
    assert.strictEqual(win.restoreBounds.h, 340);

    // Drag down by +200px (potentialH = 300 - 200 = 100 < 160 minH)
    sandbox.window.dispatchEvent('pointermove', { clientX: 300, clientY: 300 });
    // When clamped: newH = 160, newY = origY + (origH - minH) = 100 + (300 - 160) = 240
    assert.strictEqual(win.springH.target, 160, `Expected height clamped to 160, got ${win.springH.target}`);
    assert.strictEqual(win.springY.target, 240, `Expected Y clamped to 240, got ${win.springY.target}`);
    assert.strictEqual(win.restoreBounds.x, 100);
    assert.strictEqual(win.restoreBounds.y, 240);
    assert.strictEqual(win.restoreBounds.w, 400);
    assert.strictEqual(win.restoreBounds.h, 160);

    // Drag up into menubar area (dy = -80, origY + dy = 100 - 80 = 20 < 38)
    sandbox.window.dispatchEvent('pointermove', { clientX: 300, clientY: 20 });
    assert(win.springY.target >= 38, `Expected Y to be bounded by menubar >= 38, got ${win.springY.target}`);
    assert.strictEqual(win.springY.target, 38, 'Y must clamp exactly at 38px');

    sandbox.window.dispatchEvent('pointerup');
  });

  test(s, 'Corner Northwest handle (nw): adjusts both X & Y, W & H simultaneously with bounds', () => {
    const win = new WindowInstance('w-nw', 'NW Test', '🧭', 150, 150, 400, 300, '');
    const nwHandle = win.element.querySelectorAll('.window-resize-handle').find(h => h.dataset.dir === 'nw');

    nwHandle.dispatchEvent('pointerdown', { clientX: 150, clientY: 150 });

    // Drag dx = -50, dy = -50
    sandbox.window.dispatchEvent('pointermove', { clientX: 100, clientY: 100 });
    assert.strictEqual(win.springX.target, 100, 'X shifted by -50');
    assert.strictEqual(win.springY.target, 100, 'Y shifted by -50');
    assert.strictEqual(win.springW.target, 450, 'W expanded by 50');
    assert.strictEqual(win.springH.target, 350, 'H expanded by 50');
    assert.strictEqual(win.restoreBounds.x, 100);
    assert.strictEqual(win.restoreBounds.y, 100);
    assert.strictEqual(win.restoreBounds.w, 450);
    assert.strictEqual(win.restoreBounds.h, 350);

    sandbox.window.dispatchEvent('pointerup');
  });

  test(s, 'Corner Southeast handle (se): adjusts both W & H simultaneously with clamping', () => {
    const win = new WindowInstance('w-se', 'SE Test', '🧭', 100, 100, 400, 300, '');
    const seHandle = win.element.querySelectorAll('.window-resize-handle').find(h => h.dataset.dir === 'se');

    seHandle.dispatchEvent('pointerdown', { clientX: 500, clientY: 400 });

    // Drag dx = +100, dy = +100
    sandbox.window.dispatchEvent('pointermove', { clientX: 600, clientY: 500 });
    assert.strictEqual(win.springW.target, 500, 'W expanded to 500');
    assert.strictEqual(win.springH.target, 400, 'H expanded to 400');
    assert.strictEqual(win.springX.target, 100, 'X unchanged');
    assert.strictEqual(win.springY.target, 100, 'Y unchanged');

    // Drag dx = -300, dy = -250 (clamping both)
    sandbox.window.dispatchEvent('pointermove', { clientX: 200, clientY: 150 });
    assert.strictEqual(win.springW.target, 260, 'W clamped to minWidth 260');
    assert.strictEqual(win.springH.target, 160, 'H clamped to minHeight 160');

    sandbox.window.dispatchEvent('pointerup');
  });

  test(s, 'Corner Northeast handle (ne): expands W and adjusts Y & H simultaneously', () => {
    const win = new WindowInstance('w-ne', 'NE Test', '🧭', 100, 100, 400, 300, '');
    const neHandle = win.element.querySelectorAll('.window-resize-handle').find(h => h.dataset.dir === 'ne');

    neHandle.dispatchEvent('pointerdown', { clientX: 500, clientY: 100 });

    // Drag dx = +50, dy = -20
    sandbox.window.dispatchEvent('pointermove', { clientX: 550, clientY: 80 });
    assert.strictEqual(win.springW.target, 450, 'W expanded to 450');
    assert.strictEqual(win.springX.target, 100, 'X stays 100');
    assert.strictEqual(win.springY.target, 80, 'Y shifts to 80');
    assert.strictEqual(win.springH.target, 320, 'H expands to 320');

    sandbox.window.dispatchEvent('pointerup');
  });

  test(s, 'Corner Southwest handle (sw): expands H and adjusts X & W simultaneously', () => {
    const win = new WindowInstance('w-sw', 'SW Test', '🧭', 100, 100, 400, 300, '');
    const swHandle = win.element.querySelectorAll('.window-resize-handle').find(h => h.dataset.dir === 'sw');

    swHandle.dispatchEvent('pointerdown', { clientX: 100, clientY: 400 });

    // Drag dx = -40, dy = +50
    sandbox.window.dispatchEvent('pointermove', { clientX: 60, clientY: 450 });
    assert.strictEqual(win.springX.target, 60, 'X shifts to 60');
    assert.strictEqual(win.springW.target, 440, 'W expands to 440');
    assert.strictEqual(win.springY.target, 100, 'Y stays 100');
    assert.strictEqual(win.springH.target, 350, 'H expands to 350');

    sandbox.window.dispatchEvent('pointerup');
  });

  test(s, 'Resize handles are disabled when isMaximized is true', () => {
    const win = new WindowInstance('w-max', 'Max Test', '🧭', 100, 100, 400, 300, '');
    win.isMaximized = true;
    const eastHandle = win.element.querySelectorAll('.window-resize-handle').find(h => h.dataset.dir === 'e');

    eastHandle.dispatchEvent('pointerdown', { clientX: 500, clientY: 250 });
    assert(!sandbox.document.body.classList.contains('is-resizing-window'), 'Resize must not activate when maximized');
    assert.strictEqual(win.springW.target, 400, 'Width must not change');
  });

  test(s, 'Resize handles are disabled when snapZone is active', () => {
    const win = new WindowInstance('w-snap', 'Snap Test', '🧭', 100, 100, 400, 300, '');
    win.snapZone = 'left';
    const eastHandle = win.element.querySelectorAll('.window-resize-handle').find(h => h.dataset.dir === 'e');

    eastHandle.dispatchEvent('pointerdown', { clientX: 500, clientY: 250 });
    assert(!sandbox.document.body.classList.contains('is-resizing-window'), 'Resize must not activate when snapped');
    assert.strictEqual(win.springW.target, 400, 'Width must not change');
  });

  test(s, 'WindowInstance wakes compositor loop during resize drag', () => {
    const win = new WindowInstance('w-wake', 'Wake Test', '🧭', 100, 100, 400, 300, '');
    const seHandle = win.element.querySelectorAll('.window-resize-handle').find(h => h.dataset.dir === 'se');
    const prevWakeCalls = wakeCalls;

    seHandle.dispatchEvent('pointerdown', { clientX: 500, clientY: 400 });
    sandbox.window.dispatchEvent('pointermove', { clientX: 520, clientY: 420 });

    assert(wakeCalls > prevWakeCalls, 'Compositor render loop must be woken on resize move');
    sandbox.window.dispatchEvent('pointerup');
  });
});

console.log('\n================================================================');
console.log(`QA AUDIT COMPLETE: ${results.passed}/${results.total} PASS (${Math.round((results.passed/results.total)*100)}%)`);
console.log('================================================================');

if (results.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
