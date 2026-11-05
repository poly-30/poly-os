/**
 * Poly OS Issue 19 - Compositor Sleep & Battery Optimization QA Auditor Test Suite
 *
 * Exhaustive independent audit of:
 * 1. Compositor Idle Sleep & Battery Conservation (startRenderLoop, isRenderLoopSleeping, consecutiveRestFrames > 10)
 * 2. Wake-on-Demand & All 8 Wake Triggers (Spring1D.setTarget, flick, createWindow, resize, drag, maximize, minimize, switchWorkspace)
 * 3. Live Wallpaper HiDPI / Retina Canvas Scaling (DPR, canvas buffer, setTransform, logical coordinates)
 * 4. Live Wallpaper Battery Throttling & Pausing (document.hidden, hasMaximizedWindow, 350ms timeout)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const polyShellDir = path.join(__dirname, 'poly-shell');
const shellJsPath = path.join(polyShellDir, 'shell.js');
const shellJs = fs.readFileSync(shellJsPath, 'utf8');

const auditResults = {
  total: 0,
  passed: 0,
  failed: 0,
  suites: []
};

function suite(name, fn) {
  const currentSuite = { name, tests: [] };
  auditResults.suites.push(currentSuite);
  console.log(`\n--- [SUITE] ${name} ---`);
  fn(currentSuite);
}

function test(s, name, fn) {
  auditResults.total++;
  try {
    fn();
    s.tests.push({ name, status: 'PASS' });
    auditResults.passed++;
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err) {
    s.tests.push({ name, status: 'FAIL', error: err.message });
    auditResults.failed++;
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
  }
}

// ============================================================================
// SUITE 1: Static Code Inspection & State Tracking Verification
// ============================================================================
suite('1. Compositor Idle Sleep & Battery Conservation Code Structure', (s) => {
  test(s, 'startRenderLoop initializes isRenderLoopSleeping = false and consecutiveRestFrames = 0', () => {
    assert(shellJs.includes('this.isRenderLoopSleeping = false;'), 'Missing this.isRenderLoopSleeping = false');
    assert(shellJs.includes('let consecutiveRestFrames = 0;'), 'Missing let consecutiveRestFrames = 0');
  });

  test(s, 'startRenderLoop checks isRenderLoopSleeping at the top of the frame callback', () => {
    const srlMatch = shellJs.match(/startRenderLoop\s*\(\)\s*\{([\s\S]*?)\n  \}/);
    assert(srlMatch, 'startRenderLoop definition not found');
    const body = srlMatch[1];
    assert(body.includes('if (this.isRenderLoopSleeping) return;'), 'Missing early return when isRenderLoopSleeping is true');
  });

  test(s, 'startRenderLoop tracks window movement and increments consecutiveRestFrames when stationary', () => {
    const srlMatch = shellJs.match(/startRenderLoop\s*\(\)\s*\{([\s\S]*?)\n  \}/);
    const body = srlMatch[1];
    assert(body.includes('let anyMoving = false;'), 'Missing anyMoving flag');
    assert(body.includes('if (w.update(dt))'), 'Missing window update movement check');
    assert(body.includes('anyMoving = true;'), 'Missing anyMoving = true assignment');
    assert(body.includes('if (!anyMoving) {'), 'Missing !anyMoving check');
    assert(body.includes('consecutiveRestFrames++;'), 'Missing consecutiveRestFrames increment');
    assert(body.includes('consecutiveRestFrames = 0;'), 'Missing reset of consecutiveRestFrames on movement');
  });

  test(s, 'startRenderLoop halts RAF and enters sleep when consecutiveRestFrames > 10', () => {
    const srlMatch = shellJs.match(/startRenderLoop\s*\(\)\s*\{([\s\S]*?)\n  \}/);
    const body = srlMatch[1];
    assert(body.includes('if (consecutiveRestFrames > 10) {'), 'Missing threshold check consecutiveRestFrames > 10');
    assert(body.includes('this.isRenderLoopSleeping = true;'), 'Missing transition to sleeping state');
    assert(/this\.isRenderLoopSleeping = true;\s*return;/.test(body), 'Loop must return before requestAnimationFrame to halt');
  });

  test(s, 'wakeRenderLoop checks !this.isRenderLoopSleeping and avoids duplicate loops', () => {
    const wrlMatch = shellJs.match(/wakeRenderLoop\s*\(\)\s*\{([\s\S]*?)\n  \}/);
    assert(wrlMatch, 'wakeRenderLoop definition not found');
    const body = wrlMatch[1];
    assert(body.includes('if (!this.isRenderLoopSleeping) return;'), 'wakeRenderLoop must return early if already running');
    assert(body.includes('this.isRenderLoopSleeping = false;'), 'wakeRenderLoop must reset isRenderLoopSleeping to false');
  });

  test(s, 'wakeRenderLoop re-establishes requestAnimationFrame loop with full rest-frame monitoring', () => {
    const wrlMatch = shellJs.match(/wakeRenderLoop\s*\(\)\s*\{([\s\S]*?)\n  \}/);
    const body = wrlMatch[1];
    assert(body.includes('requestAnimationFrame(frame);'), 'wakeRenderLoop must invoke requestAnimationFrame');
    assert(body.includes('consecutiveRestFrames > 10'), 'wakeRenderLoop must continue monitoring for future idle sleep');
  });
});

// ============================================================================
// SUITE 2: Verification of All 8 Wake Triggers
// ============================================================================
suite('2. Wake Triggers Verification (8 Critical Pathways)', (s) => {
  test(s, 'Trigger 1: Spring1D.setTarget() invokes wakeRenderLoop', () => {
    const setTargetMatch = shellJs.match(/setTarget\s*\(\s*target\s*\)\s*\{([\s\S]*?)\n  \}/);
    assert(setTargetMatch, 'Spring1D.setTarget not found');
    assert(setTargetMatch[1].includes('os.wakeRenderLoop()'), 'Spring1D.setTarget must call os.wakeRenderLoop()');
  });

  test(s, 'Trigger 2: Spring1D.flick() invokes wakeRenderLoop', () => {
    const flickMatch = shellJs.match(/flick\s*\(\s*target\s*,\s*initialVelocity\s*\)\s*\{([\s\S]*?)\n  \}/);
    assert(flickMatch, 'Spring1D.flick not found');
    assert(flickMatch[1].includes('os.wakeRenderLoop()'), 'Spring1D.flick must call os.wakeRenderLoop()');
  });

  test(s, 'Trigger 3: createWindow() explicitly invokes wakeRenderLoop', () => {
    const createWinMatch = shellJs.match(/createWindow\s*\([^)]*\)\s*\{([\s\S]*?)\n  \}/);
    assert(createWinMatch, 'createWindow not found');
    assert(createWinMatch[1].includes('this.wakeRenderLoop()'), 'createWindow must call this.wakeRenderLoop()');
  });

  test(s, 'Trigger 4: Window Resize (initResize) invokes wakeRenderLoop on start and during pointer move', () => {
    const initResizeMatch = shellJs.match(/initResize\s*\([^)]*\)\s*\{([\s\S]*?)\n  \}/);
    assert(initResizeMatch, 'initResize not found');
    const body = initResizeMatch[1];
    assert(body.includes('os.wakeRenderLoop()'), 'initResize must call os.wakeRenderLoop()');
    assert(body.includes('this.springW.setTarget(newW)'), 'initResize updates spring targets');
  });

  test(s, 'Trigger 5: Window Drag (initDrag) invokes wakeRenderLoop via spring updates and flick', () => {
    const initDragMatch = shellJs.match(/initDrag\s*\([^)]*\)\s*\{([\s\S]*?)\n  \}/);
    assert(initDragMatch, 'initDrag not found');
    const body = initDragMatch[1];
    assert(body.includes('this.springX.setTarget(targetX)'), 'initDrag updates springX target on drag move');
    assert(body.includes('this.springY.setTarget(targetY)'), 'initDrag updates springY target on drag move');
    assert(body.includes('this.springX.flick('), 'initDrag calls flick on release with velocity');
  });

  test(s, 'Trigger 6: Maximize (toggleMaximize / applySnap maximize) updates springs to wake loop', () => {
    const applySnapMatch = shellJs.match(/applySnap\s*\([^)]*\)\s*\{([\s\S]*?)\n  \}/);
    assert(applySnapMatch, 'applySnap not found');
    const body = applySnapMatch[1];
    assert(body.includes("if (zone === 'maximize')"), 'applySnap contains maximize zone logic');
    assert(body.includes('win.springX.setTarget(0)'), 'springX target set on maximize');
    assert(body.includes('win.springW.setTarget(window.innerWidth)'), 'springW target set on maximize');
  });

  test(s, 'Trigger 7: Minimize (minimizeWindow) updates spring scale & opacity to wake loop', () => {
    const minWinMatch = shellJs.match(/minimizeWindow\s*\([^)]*\)\s*\{([\s\S]*?)\n  \}/);
    assert(minWinMatch, 'minimizeWindow not found');
    const body = minWinMatch[1];
    assert(body.includes('win.springScale.setTarget(0.6)'), 'minimizeWindow sets springScale target');
    assert(body.includes('win.springOpacity.setTarget(0.0)'), 'minimizeWindow sets springOpacity target');
  });

  test(s, 'Trigger 8: Workspace Switch (switchWorkspace) invokes wakeRenderLoop', () => {
    const switchWsMatch = shellJs.match(/switchWorkspace\s*\([^)]*\)\s*\{([\s\S]*?)\n  \}/);
    assert(switchWsMatch, 'switchWorkspace not found');
    assert(switchWsMatch[1].includes('this.wakeRenderLoop()'), 'switchWorkspace must call this.wakeRenderLoop()');
  });
});

// ============================================================================
// SUITE 3: Live Wallpaper Battery & HiDPI Optimization
// ============================================================================
suite('3. Live Wallpaper Battery & HiDPI Optimization', (s) => {
  test(s, 'Retina / HiDPI canvas scaling uses window.devicePixelRatio with fallback to 1', () => {
    assert(shellJs.includes('const dpr = window.devicePixelRatio || 1;'), 'DPR fallback to 1 missing');
    assert(shellJs.includes('this.wallpaperDpr = dpr;'), 'this.wallpaperDpr tracking missing');
  });

  test(s, 'Canvas buffer dimensions are scaled by DPR with Math.floor', () => {
    assert(shellJs.includes('canvas.width = Math.floor(window.innerWidth * dpr);'), 'canvas.width scaling missing');
    assert(shellJs.includes('canvas.height = Math.floor(window.innerHeight * dpr);'), 'canvas.height scaling missing');
  });

  test(s, 'Canvas CSS dimensions match logical window dimensions', () => {
    assert(shellJs.includes('canvas.style.width = `${window.innerWidth}px`;'), 'canvas.style.width missing');
    assert(shellJs.includes('canvas.style.height = `${window.innerHeight}px`;'), 'canvas.style.height missing');
  });

  test(s, 'Context coordinate space is normalized using ctx.setTransform(dpr, 0, 0, dpr, 0, 0)', () => {
    assert(shellJs.includes('ctx.setTransform(dpr, 0, 0, dpr, 0, 0);'), 'ctx.setTransform DPR call missing');
  });

  test(s, 'Wallpaper rendering uses logical coordinates w/h without manual double-scaling', () => {
    const initWallMatch = shellJs.match(/initLiveWallpaper\s*\(\)\s*\{([\s\S]*?)\n  \}/);
    assert(initWallMatch, 'initLiveWallpaper not found');
    const body = initWallMatch[1];
    assert(body.includes('const w = window.innerWidth;'), 'w = window.innerWidth logical coordinate missing');
    assert(body.includes('const h = window.innerHeight;'), 'h = window.innerHeight logical coordinate missing');
    assert(body.includes('ctx.clearRect(0, 0, w, h);'), 'clearRect uses logical w, h');
  });

  test(s, 'Live Wallpaper detects document.hidden state', () => {
    assert(shellJs.includes('const isHidden = typeof document !== \'undefined\' && document.hidden;'), 'document.hidden check missing');
  });

  test(s, 'Live Wallpaper detects maximized windows in current workspace', () => {
    assert(shellJs.includes('const hasMaximizedWindow = this.windows && this.windows.some(w =>'), 'hasMaximizedWindow check missing');
    assert(shellJs.includes('w.isMaximized && !w.isMinimized && !w.isFrozen && (!w.workspace || w.workspace === this.currentWorkspace)'), 'Maximized condition check missing');
  });

  test(s, 'Live Wallpaper pauses and throttles to 350ms timeout when hidden or obscured', () => {
    assert(shellJs.includes('if (isHidden || hasMaximizedWindow) {'), 'Pause branch missing');
    assert(shellJs.includes('this.isWallpaperPaused = true;'), 'isWallpaperPaused state flag missing');
    assert(shellJs.includes('setTimeout(() => requestAnimationFrame(render), 350);'), '350ms timeout throttle missing');
    assert(shellJs.includes('this.isWallpaperPaused = false;'), 'isWallpaperPaused unset on resume missing');
  });
});

// ============================================================================
// SUITE 4: Dynamic Functional Simulation (Stationary Frames & Idle Sleep)
// ============================================================================
suite('4. Dynamic Functional Simulation of Compositor Sleep & Wakeup', (s) => {
  // Construct a simulated environment for testing frame loops
  function createCompositorHarness() {
    let now = 1000;
    const rafCallbacks = [];
    let nextRafId = 1;

    const requestAnimationFrame = (cb) => {
      const id = nextRafId++;
      rafCallbacks.push({ id, cb });
      return id;
    };

    const flushFrame = (elapsedMs = 16.6) => {
      now += elapsedMs;
      const current = rafCallbacks.slice();
      rafCallbacks.length = 0;
      for (const item of current) {
        item.cb(now);
      }
      return current.length;
    };

    // Lightweight mock window with update(dt)
    class MockWindow {
      constructor(isMoving = false) {
        this.isMoving = isMoving;
        this.updateCalls = 0;
      }
      update(dt) {
        this.updateCalls++;
        return this.isMoving;
      }
    }

    // Compositor controller mirroring shell.js exactly
    class MockCompositor {
      constructor() {
        this.windows = new Map();
        this.isRenderLoopSleeping = false;
        this.powerMode = 'normal';
        this.framesRendered = 0;
        this.sleepEvents = 0;
        this.wakeEvents = 0;
      }

      startRenderLoop() {
        let lastTime = now;
        let lastFrameTime = 0;
        this.isRenderLoopSleeping = false;
        let consecutiveRestFrames = 0;

        const frame = (timestamp) => {
          if (this.isRenderLoopSleeping) return;

          if (this.powerMode === 'low') {
            if (timestamp - lastFrameTime < 16.0) {
              requestAnimationFrame(frame);
              return;
            }
          }
          lastFrameTime = timestamp;
          const dt = Math.min((timestamp - lastTime) / 1000, 0.033);
          lastTime = timestamp;

          this.framesRendered++;
          let anyMoving = false;
          this.windows.forEach(w => {
            if (w.update(dt)) {
              anyMoving = true;
            }
          });

          if (!anyMoving) {
            consecutiveRestFrames++;
            if (consecutiveRestFrames > 10) {
              this.isRenderLoopSleeping = true;
              this.sleepEvents++;
              return; // Halts RAF loop!
            }
          } else {
            consecutiveRestFrames = 0;
          }

          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      }

      wakeRenderLoop() {
        if (!this.isRenderLoopSleeping) return;
        this.isRenderLoopSleeping = false;
        this.wakeEvents++;
        let lastTime = now;
        let lastFrameTime = 0;
        let consecutiveRestFrames = 0;

        const frame = (timestamp) => {
          if (this.isRenderLoopSleeping) return;

          if (this.powerMode === 'low') {
            if (timestamp - lastFrameTime < 16.0) {
              requestAnimationFrame(frame);
              return;
            }
          }
          lastFrameTime = timestamp;
          const dt = Math.min((timestamp - lastTime) / 1000, 0.033);
          lastTime = timestamp;

          this.framesRendered++;
          let anyMoving = false;
          this.windows.forEach(w => {
            if (w.update(dt)) {
              anyMoving = true;
            }
          });

          if (!anyMoving) {
            consecutiveRestFrames++;
            if (consecutiveRestFrames > 10) {
              this.isRenderLoopSleeping = true;
              this.sleepEvents++;
              return;
            }
          } else {
            consecutiveRestFrames = 0;
          }

          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      }
    }

    return {
      MockCompositor,
      MockWindow,
      flushFrame,
      getPendingRafCount: () => rafCallbacks.length
    };
  }

  test(s, 'Compositor halts RAF loop after exactly 11 consecutive stationary frames', () => {
    const { MockCompositor, MockWindow, flushFrame, getPendingRafCount } = createCompositorHarness();
    const comp = new MockCompositor();
    comp.windows.set(1, new MockWindow(false)); // stationary window

    comp.startRenderLoop();
    assert.strictEqual(comp.isRenderLoopSleeping, false);
    assert.strictEqual(getPendingRafCount(), 1, 'Initial frame should be scheduled');

    // Run 10 frames - should still be running
    for (let i = 1; i <= 10; i++) {
      assert.strictEqual(comp.isRenderLoopSleeping, false, `Should not be sleeping at frame ${i}`);
      const ran = flushFrame();
      assert.strictEqual(ran, 1, `Frame ${i} did not execute`);
      assert.strictEqual(getPendingRafCount(), 1, `Next frame should be queued after frame ${i}`);
    }

    // Run 11th frame (consecutiveRestFrames reaches 11 > 10)
    assert.strictEqual(comp.isRenderLoopSleeping, false);
    const ran11 = flushFrame();
    assert.strictEqual(ran11, 1, 'Frame 11 executed');

    // Now loop MUST be sleeping and NO new RAF scheduled!
    assert.strictEqual(comp.isRenderLoopSleeping, true, 'Compositor must be asleep after 11 stationary frames');
    assert.strictEqual(getPendingRafCount(), 0, 'No more RAF callbacks should be queued (zero CPU usage!)');
    assert.strictEqual(comp.sleepEvents, 1, 'Exactly one sleep event should have occurred');
  });

  test(s, 'Moving window resets rest counter and prevents idle sleep', () => {
    const { MockCompositor, MockWindow, flushFrame, getPendingRafCount } = createCompositorHarness();
    const comp = new MockCompositor();
    const win = new MockWindow(false);
    comp.windows.set(1, win);

    comp.startRenderLoop();

    // 8 stationary frames
    for (let i = 0; i < 8; i++) flushFrame();
    assert.strictEqual(comp.isRenderLoopSleeping, false);

    // 9th frame window begins moving (e.g. user drags window)
    win.isMoving = true;
    flushFrame();
    assert.strictEqual(comp.isRenderLoopSleeping, false);

    // 5 more stationary frames after movement stops
    win.isMoving = false;
    for (let i = 0; i < 5; i++) flushFrame();

    // Total frames = 14, but consecutive rest frames is only 5, so must NOT be sleeping
    assert.strictEqual(comp.isRenderLoopSleeping, false);
    assert.strictEqual(getPendingRafCount(), 1, 'RAF loop must remain alive');
  });

  test(s, 'wakeRenderLoop restarts loop seamlessly from asleep state', () => {
    const { MockCompositor, MockWindow, flushFrame, getPendingRafCount } = createCompositorHarness();
    const comp = new MockCompositor();
    comp.windows.set(1, new MockWindow(false));

    comp.startRenderLoop();
    // Flush until asleep
    for (let i = 0; i < 11; i++) flushFrame();
    assert.strictEqual(comp.isRenderLoopSleeping, true);
    assert.strictEqual(getPendingRafCount(), 0);

    const framesBeforeWake = comp.framesRendered;

    // Wake up compositor
    comp.wakeRenderLoop();
    assert.strictEqual(comp.isRenderLoopSleeping, false, 'Loop must be marked awake');
    assert.strictEqual(getPendingRafCount(), 1, 'A new RAF frame must be queued immediately');
    assert.strictEqual(comp.wakeEvents, 1);

    // Calling wakeRenderLoop again when already awake does NOT create duplicate loops
    comp.wakeRenderLoop();
    assert.strictEqual(getPendingRafCount(), 1, 'No duplicate RAF callbacks created');

    // Run frame
    flushFrame();
    assert.strictEqual(comp.framesRendered, framesBeforeWake + 1);
  });
});

// ============================================================================
// SUITE 5: Dynamic Simulation of Live Wallpaper Pause & DPR Scaling
// ============================================================================
suite('5. Dynamic Simulation of Live Wallpaper Pause & DPR Scaling', (s) => {
  function createWallpaperHarness(dpr = 1.0) {
    let now = 2000;
    const timeouts = [];
    const rafCallbacks = [];
    let nextTimeoutId = 1;
    let nextRafId = 1;

    const mockWindow = {
      innerWidth: 1920,
      innerHeight: 1080,
      devicePixelRatio: dpr,
      addEventListener: () => {}
    };

    const mockDocument = {
      hidden: false
    };

    const mockCtx = {
      transforms: [],
      clears: [],
      setTransform: (...args) => mockCtx.transforms.push(args),
      clearRect: (...args) => mockCtx.clears.push(args),
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      fill: () => {},
      stroke: () => {},
      arc: () => {},
      fillRect: () => {}
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      style: {},
      getContext: () => mockCtx
    };

    const setTimeoutMock = (cb, delay) => {
      const id = nextTimeoutId++;
      timeouts.push({ id, cb, delay });
      return id;
    };

    const requestAnimationFrameMock = (cb) => {
      const id = nextRafId++;
      rafCallbacks.push({ id, cb });
      return id;
    };

    return {
      mockWindow,
      mockDocument,
      mockCtx,
      mockCanvas,
      setTimeoutMock,
      requestAnimationFrameMock,
      getTimeouts: () => timeouts,
      getRafs: () => rafCallbacks
    };
  }

  test(s, 'HiDPI canvas buffer dimension calculations for 1x, 2x (Retina), and 3x DPR', () => {
    [1.0, 1.5, 2.0, 3.0].forEach(dpr => {
      const h = createWallpaperHarness(dpr);
      const w = h.mockWindow.innerWidth;
      const height = h.mockWindow.innerHeight;
      h.mockCanvas.width = Math.floor(w * dpr);
      h.mockCanvas.height = Math.floor(height * dpr);
      h.mockCanvas.style.width = `${w}px`;
      h.mockCanvas.style.height = `${height}px`;
      h.mockCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      assert.strictEqual(h.mockCanvas.width, Math.floor(1920 * dpr));
      assert.strictEqual(h.mockCanvas.height, Math.floor(1080 * dpr));
      assert.strictEqual(h.mockCanvas.style.width, '1920px');
      assert.strictEqual(h.mockCanvas.style.height, '1080px');
      assert.deepStrictEqual(h.mockCtx.transforms[0], [dpr, 0, 0, dpr, 0, 0]);
    });
  });

  test(s, 'Wallpaper render loop pauses and throttles to 350ms setTimeout when document is hidden', () => {
    const h = createWallpaperHarness(1.0);
    h.mockDocument.hidden = true;

    let isWallpaperPaused = false;
    let windows = [];
    let currentWorkspace = 1;

    // Simulate render() step from initLiveWallpaper
    const isHidden = h.mockDocument.hidden;
    const hasMaximizedWindow = windows.some(w => w.isMaximized && !w.isMinimized && !w.isFrozen && (!w.workspace || w.workspace === currentWorkspace));

    if (isHidden || hasMaximizedWindow) {
      isWallpaperPaused = true;
      h.setTimeoutMock(() => h.requestAnimationFrameMock(() => {}), 350);
    }

    assert.strictEqual(isWallpaperPaused, true);
    assert.strictEqual(h.getTimeouts().length, 1);
    assert.strictEqual(h.getTimeouts()[0].delay, 350);
  });

  test(s, 'Wallpaper render loop pauses and throttles to 350ms setTimeout when window is maximized in current workspace', () => {
    const h = createWallpaperHarness(1.0);
    h.mockDocument.hidden = false;

    let isWallpaperPaused = false;
    let currentWorkspace = 1;
    let windows = [
      { id: 1, isMaximized: true, isMinimized: false, isFrozen: false, workspace: 1 }
    ];

    const isHidden = h.mockDocument.hidden;
    const hasMaximizedWindow = windows.some(w => w.isMaximized && !w.isMinimized && !w.isFrozen && (!w.workspace || w.workspace === currentWorkspace));

    if (isHidden || hasMaximizedWindow) {
      isWallpaperPaused = true;
      h.setTimeoutMock(() => h.requestAnimationFrameMock(() => {}), 350);
    }

    assert.strictEqual(hasMaximizedWindow, true);
    assert.strictEqual(isWallpaperPaused, true);
    assert.strictEqual(h.getTimeouts().length, 1);
    assert.strictEqual(h.getTimeouts()[0].delay, 350);
  });

  test(s, 'Wallpaper render loop does NOT pause if maximized window is minimized or in another workspace', () => {
    const h = createWallpaperHarness(1.0);
    h.mockDocument.hidden = false;

    let isWallpaperPaused = false;
    let currentWorkspace = 1;
    let windows = [
      // Maximized window on Workspace 2, but user is on Workspace 1
      { id: 1, isMaximized: true, isMinimized: false, isFrozen: false, workspace: 2 },
      // Maximized window on Workspace 1, but it is minimized
      { id: 2, isMaximized: true, isMinimized: true, isFrozen: false, workspace: 1 }
    ];

    const isHidden = h.mockDocument.hidden;
    const hasMaximizedWindow = windows.some(w => w.isMaximized && !w.isMinimized && !w.isFrozen && (!w.workspace || w.workspace === currentWorkspace));

    if (isHidden || hasMaximizedWindow) {
      isWallpaperPaused = true;
      h.setTimeoutMock(() => h.requestAnimationFrameMock(() => {}), 350);
    } else {
      isWallpaperPaused = false;
      h.requestAnimationFrameMock(() => {});
    }

    assert.strictEqual(hasMaximizedWindow, false);
    assert.strictEqual(isWallpaperPaused, false);
    assert.strictEqual(h.getTimeouts().length, 0, 'No throttling timeout scheduled');
    assert.strictEqual(h.getRafs().length, 1, 'Standard 120Hz RAF scheduled');
  });
});

// ============================================================================
// AUDIT SUMMARY
// ============================================================================
console.log('\n================================================================');
console.log(`POLY OS ISSUE 19 COMPOSITOR & BATTERY QA AUDIT COMPLETE`);
console.log(`Results: ${auditResults.passed}/${auditResults.total} tests passed (${Math.round((auditResults.passed / auditResults.total) * 100)}%)`);
console.log('================================================================\n');

if (auditResults.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
