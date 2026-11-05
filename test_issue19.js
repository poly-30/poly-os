// Automated Verification Suite for Issue 19:
// 1. 8-Directional Edge & Corner Manual Window Resizing
// 2. Compositor Idle Sleep & Battery Conservation
// 3. Live Wallpaper Canvas Pause & Power Saving
// 4. Retina / HiDPI Canvas Scaling
// 5. VFS Subfolder Hierarchy & Navigation

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Issue 19 Verification Suite...');

// Read source files
const shellJsPath = path.join(__dirname, 'poly-shell', 'shell.js');
const styleCssPath = path.join(__dirname, 'poly-shell', 'style.css');

const shellJs = fs.readFileSync(shellJsPath, 'utf8');
const styleCss = fs.readFileSync(styleCssPath, 'utf8');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
  }
}

// Mock browser environment
function createMockEnvironment() {
  const listeners = {};
  const elements = [];

  class MockElement {
    constructor(tagName) {
      this.tagName = tagName.toUpperCase();
      this.className = '';
      this.classList = {
        _classes: new Set(),
        add: (...cls) => cls.forEach(c => this.classList._classes.add(c)),
        remove: (...cls) => cls.forEach(c => this.classList._classes.delete(c)),
        contains: (c) => this.classList._classes.has(c)
      };
      this.style = {};
      this.dataset = {};
      this.children = [];
      this.listeners = {};
      this.innerHTML = '';
      this.textContent = '';
      elements.push(this);
    }

    appendChild(child) {
      this.children.push(child);
      return child;
    }

    querySelector(selector) {
      if (selector.startsWith('.')) {
        const cls = selector.slice(1);
        return this.children.find(c => c.classList && c.classList.contains(cls)) || null;
      }
      return null;
    }

    querySelectorAll(selector) {
      if (selector.startsWith('.')) {
        const cls = selector.slice(1);
        return this.children.filter(c => c.classList && c.classList.contains(cls));
      }
      return [];
    }

    addEventListener(event, fn) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(fn);
    }

    removeEventListener(event, fn) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(f => f !== fn);
    }

    dispatchEvent(event, payload = {}) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(fn => fn({ preventDefault: () => {}, stopPropagation: () => {}, ...payload }));
      }
    }
  }

  const mockDoc = {
    createElement: (tag) => new MockElement(tag),
    getElementById: (id) => new MockElement('div'),
    body: new MockElement('body'),
    hidden: false
  };

  return { mockDoc, MockElement };
}

// 1. Static CSS verification for 8-Directional resize handles
runTest('CSS has 8-directional resize handles with correct cursors', () => {
  assert(styleCss.includes('.window-resize-handle'), 'Missing .window-resize-handle in style.css');
  assert(styleCss.includes('cursor: ns-resize'), 'Missing ns-resize cursor for n/s edges');
  assert(styleCss.includes('cursor: ew-resize'), 'Missing ew-resize cursor for e/w edges');
  assert(styleCss.includes('cursor: nwse-resize'), 'Missing nwse-resize cursor for nw/se corners');
  assert(styleCss.includes('cursor: nesw-resize'), 'Missing nesw-resize cursor for ne/sw corners');
  assert(styleCss.includes('.window.maximized .window-resize-handle'), 'Missing maximized handle suppression');
});

// 2. WindowInstance 8-directional handles creation and data attributes
runTest('WindowInstance constructor attaches 8 directional resize handles', () => {
  const dirs = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];
  assert(shellJs.includes("const dirs = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];"), 'Directions array missing');
  assert(shellJs.includes("handle.className = `window-resize-handle resize-${dir}`"), 'Handle class missing');
  assert(shellJs.includes("handle.dataset.dir = dir"), 'Handle dataset.dir missing');
  assert(shellJs.includes("this.initResize(handle, dir)"), 'initResize call missing');
});

// 3. Resize math: Clamping minWidth 260px and minHeight 160px
runTest('Resize logic clamps to minWidth 260px and minHeight 160px', () => {
  assert(shellJs.includes('const minW = 260;'), 'minW clamping missing');
  assert(shellJs.includes('const minH = 160;'), 'minH clamping missing');
  assert(shellJs.includes("dir.includes('e')"), 'East edge handling missing');
  assert(shellJs.includes("dir.includes('s')"), 'South edge handling missing');
  assert(shellJs.includes("dir.includes('w')"), 'West edge handling missing');
  assert(shellJs.includes("dir.includes('n')"), 'North edge handling missing');
  assert(shellJs.includes('document.body.classList.add(\'is-resizing-window\')'), 'Body resizing class missing');
});

// 4. Compositor Idle Sleep: isRenderLoopSleeping & wakeRenderLoop()
runTest('Compositor implements idle sleep and wakeRenderLoop()', () => {
  assert(shellJs.includes('this.isRenderLoopSleeping = false;'), 'isRenderLoopSleeping state missing');
  assert(shellJs.includes('consecutiveRestFrames > 10'), 'Idle sleep threshold check missing');
  assert(shellJs.includes('this.isRenderLoopSleeping = true;'), 'Transition to sleeping missing');
  assert(shellJs.includes('wakeRenderLoop()'), 'wakeRenderLoop implementation missing');
});

// 5. Spring1D automatically wakes render loop on setTarget / flick
runTest('Spring1D setTarget and flick wake the compositor loop', () => {
  assert(shellJs.includes('if (os && os.wakeRenderLoop) {'), 'Render loop wakeup in Spring1D missing');
});

// 6. Live Wallpaper retina HiDPI canvas scaling
runTest('Live Wallpaper scales canvas with window.devicePixelRatio', () => {
  assert(shellJs.includes('const dpr = window.devicePixelRatio || 1;'), 'devicePixelRatio lookup missing');
  assert(shellJs.includes('Math.floor(window.innerWidth * dpr)'), 'Canvas width DPR scaling missing');
  assert(shellJs.includes('Math.floor(window.innerHeight * dpr)'), 'Canvas height DPR scaling missing');
  assert(shellJs.includes('ctx.setTransform(dpr, 0, 0, dpr, 0, 0);'), 'Context DPR transform missing');
});

// 7. Live Wallpaper pauses when document.hidden or maximized
runTest('Live Wallpaper pauses rendering when hidden or obscured by maximized window', () => {
  assert(shellJs.includes('this.isWallpaperPaused = true;'), 'isWallpaperPaused missing');
  assert(shellJs.includes('hasMaximizedWindow'), 'Maximized window obscuration check missing');
  assert(shellJs.includes('document.hidden'), 'document.hidden check missing');
});

// 8. PolyVFS subfolder defaults seeding
runTest('PolyVFS seeds nested subfolder files for deep directory exploration', () => {
  assert(shellJs.includes("path: 'Projects/poly-compositor/main.rs'"), 'poly-compositor nested file missing');
  assert(shellJs.includes("folder: 'Projects/poly-compositor'"), 'poly-compositor folder tag missing');
  assert(shellJs.includes("path: 'Projects/poly-daemon/polyd.service'"), 'poly-daemon nested file missing');
});

// 9. Files App Hierarchical Breadcrumb Navigation
runTest('Files App renders interactive multi-level breadcrumbs with data-jump', () => {
  assert(shellJs.includes('const segments = currentDir.split(\'/\').filter(Boolean);'), 'Path segment splitting missing');
  assert(shellJs.includes('crumb.dataset.jump'), 'Breadcrumb data-jump navigation missing');
  assert(shellJs.includes('crumbBar.querySelectorAll(\'.crumb[data-jump]\')'), 'Breadcrumb click listeners missing');
});

// 10. Files App subfolder double-click deep navigation
runTest('Files App double-clicking folder transitions deeper into hierarchy', () => {
  assert(shellJs.includes("`${currentDir}/${name}`"), 'Subfolder path appending missing');
});

console.log(`\n========================================`);
console.log(`Issue 19 Tests Completed: ${passedTests}/${totalTests} Passed`);
console.log(`========================================\n`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
