/**
 * Poly OS Interactive Shell Engine
 * Blends iOS Mass-Spring-Damper Physics with Windows Multi-Window Snapping
 */

// --- 0. Poly Acoustic Audio Engine (Synthesized Web Audio API) ---
class PolyAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicPlaying = false;
    this.musicTimer = null;
    this.analyser = null;
    this.analyserData = null;
    this.currentTrackIndex = 0;
    this.tracks = [
      { title: "Solar Wind (120Hz Mix)", artist: "Poly Audio Engine", bpm: 110, root: 220 },
      { title: "Neon Horizon (PipeWire Ambient)", artist: "Zero-Friction Band", bpm: 95, root: 196 },
      { title: "Cupertino Dreams (Lo-Fi Spring)", artist: "ProMotion Orchestra", bpm: 84, root: 261.63 }
    ];
  }

  ensureContext() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setupMusicEngine() {
    const ctx = this.ensureContext();
    if (!ctx || this.analyser) return;
    try {
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyserData = new Uint8Array(this.analyser.frequencyBinCount);
    } catch(e) {}
  }

  toggleMusic() {
    if (this.musicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  startMusic() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.setupMusicEngine();
    this.musicPlaying = true;
    let step = 0;
    const notes = [0, 3, 7, 10, 12, 7, 5, 3];

    const playStep = () => {
      if (!this.musicPlaying) return;
      try {
        const track = this.tracks[this.currentTrackIndex];
        const semitone = notes[step % notes.length];
        const freq = track.root * Math.pow(2, semitone / 12);
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = (step % 4 === 0) ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.045, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.36);
        
        osc.connect(gain);
        if (this.analyser) {
          gain.connect(this.analyser);
          this.analyser.connect(ctx.destination);
        } else {
          gain.connect(ctx.destination);
        }
        osc.start();
        osc.stop(ctx.currentTime + 0.38);
      } catch(e) {}

      step++;
      const track = this.tracks[this.currentTrackIndex];
      const interval = (60 / track.bpm) * 450;
      this.musicTimer = setTimeout(playStep, interval);
    };

    playStep();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    if (this.musicPlaying) {
      this.stopMusic();
      this.startMusic();
    }
    return this.tracks[this.currentTrackIndex];
  }

  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    if (this.musicPlaying) {
      this.stopMusic();
      this.startMusic();
    }
    return this.tracks[this.currentTrackIndex];
  }

  getFrequencyData() {
    if (this.analyser && this.analyserData) {
      this.analyser.getByteFrequencyData(this.analyserData);
      return this.analyserData;
    }
    return null;
  }

  playClick() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch(e) {}
  }

  playSnap() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch(e) {}
  }

  playSpring() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch(e) {}
  }

  playSuccess() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [523.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.25);
      });
    } catch(e) {}
  }

  playAlert() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch(e) {}
  }
}
const polyAudio = new PolyAudio();

// --- 1. Damped Harmonic Oscillator (Spring Physics) ---
class Spring1D {
  constructor(initial = 0, stiffness = 220, dampingRatio = 0.82, mass = 1.0) {
    this.current = initial;
    this.target = initial;
    this.velocity = 0;
    this.stiffness = stiffness;
    this.dampingRatio = dampingRatio;
    this.mass = mass;
    this.threshold = 0.05;
  }

  setTarget(target) {
    this.target = target;
  }

  flick(target, initialVelocity) {
    this.target = target;
    this.velocity = initialVelocity;
  }

  update(dt) {
    const displacement = this.current - this.target;
    if (Math.abs(displacement) < this.threshold && Math.abs(this.velocity) < this.threshold) {
      this.current = this.target;
      this.velocity = 0;
      return false; // At rest
    }

    const c = 2 * this.dampingRatio * Math.sqrt(this.stiffness * this.mass);
    const springForce = -this.stiffness * displacement;
    const dampingForce = -c * this.velocity;
    const acceleration = (springForce + dampingForce) / this.mass;

    this.velocity += acceleration * dt;
    this.current += this.velocity * dt;
    return true; // Still moving
  }
}

// --- 2. Window Class ---
class WindowInstance {
  constructor(id, title, icon, x, y, w, h, contentHtml, workspace = 1) {
    this.id = id;
    this.title = title;
    this.icon = icon;
    this.workspace = workspace;
    this.springX = new Spring1D(x, 260, 0.85);
    this.springY = new Spring1D(y, 260, 0.85);
    this.springW = new Spring1D(w, 260, 0.85);
    this.springH = new Spring1D(h, 260, 0.85);
    this.springScale = new Spring1D(1.0, 240, 0.82);
    this.springOpacity = new Spring1D(1.0, 240, 0.82);

    this.restoreBounds = { x, y, w, h };
    this.snapZone = null;
    this.isMaximized = false;
    this.isMinimized = false;
    this.isFrozen = false;
    this.lastActiveTime = Date.now();
    this.contentHtml = contentHtml;

    this.element = null;
    this.createDom();
  }

  createDom() {
    const el = document.createElement('div');
    el.className = 'window focused';
    el.id = `window-${this.id}`;
    el.innerHTML = `
      <div class="window-titlebar">
        <div class="window-traffic-lights">
          <button class="traffic-light btn-close" title="Close">✕</button>
          <button class="traffic-light btn-min" title="Minimize (Spring)">−</button>
          <button class="traffic-light btn-max" title="Aero Maximize / Full Screen">□</button>
        </div>
        <div class="window-title">${this.icon} ${this.title}</div>
        <div class="window-actions-right">
          <button class="btn-exit-fullscreen" title="Exit Full Screen (Esc)">⤡ Exit Full Screen</button>
        </div>
      </div>
      <div class="window-body">
        ${this.contentHtml}
      </div>
    `;

    // Traffic light events
    const closeBtn = el.querySelector('.btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const os = window.polyOS || polyOS;
        if (os) os.closeWindow(this.id);
      });
    }

    const minBtn = el.querySelector('.btn-min');
    if (minBtn) {
      minBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const os = window.polyOS || polyOS;
        if (os) os.minimizeWindow(this.id);
      });
    }

    const maxBtn = el.querySelector('.btn-max');
    if (maxBtn) {
      let hoverTimer = null;
      maxBtn.addEventListener('mouseenter', () => {
        hoverTimer = setTimeout(() => {
          const os = window.polyOS || polyOS;
          if (os) os.showSnapLayoutsFlyout(this.id, maxBtn);
        }, 160);
      });
      maxBtn.addEventListener('mouseleave', () => {
        if (hoverTimer) clearTimeout(hoverTimer);
      });
      maxBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const os = window.polyOS || polyOS;
        if (os) {
          os.hideSnapLayoutsFlyout();
          os.toggleMaximize(this.id);
        }
      });
    }

    const exitFsBtn = el.querySelector('.btn-exit-fullscreen');
    if (exitFsBtn) {
      exitFsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const os = window.polyOS || polyOS;
        if (os) os.toggleMaximize(this.id);
      });
    }

    // Bring to front on click
    el.addEventListener('mousedown', () => {
      const os = window.polyOS || polyOS;
      if (os) os.focusWindow(this.id);
    });

    // Dragging setup
    const titlebar = el.querySelector('.window-titlebar');
    this.initDrag(titlebar);

    // Double-click titlebar to toggle full-screen
    titlebar.addEventListener('dblclick', (e) => {
      if (e.target.closest('.traffic-light') || e.target.closest('.btn-exit-fullscreen')) return;
      const os = window.polyOS || polyOS;
      if (os) os.toggleMaximize(this.id);
    });

    this.element = el;
    this.el = el;
    document.getElementById('workspace').appendChild(el);
    this.applyTransform();
  }

  initDrag(titlebar) {
    let startX, startY, origX, origY;
    let prevMouseX, prevMouseY, prevTime;
    let velX = 0, velY = 0;
    let isDragging = false;

    const onMouseDown = (e) => {
      if (e.target.closest('.traffic-light') || e.target.closest('.btn-exit-fullscreen')) return;
      isDragging = true;
      polyOS.focusWindow(this.id);

      startX = e.clientX;
      startY = e.clientY;
      origX = this.springX.current;
      origY = this.springY.current;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      prevTime = performance.now();

      // If snapped or maximized, smoothly restore to floating window on drag pull
      if (this.snapZone || this.isMaximized) {
        const wasMaximized = this.isMaximized;
        this.snapZone = null;
        this.isMaximized = false;
        if (this.element) {
          this.element.classList.remove('maximized', 'snapped', 'snapped-left', 'snapped-right');
          const maxBtn = this.element.querySelector('.btn-max');
          if (maxBtn) {
            maxBtn.title = "Aero Maximize / Full Screen";
            maxBtn.classList.remove('is-restore');
            maxBtn.textContent = "□";
          }
          const exitFsBtn = this.element.querySelector('.btn-exit-fullscreen');
          if (exitFsBtn) {
            exitFsBtn.innerHTML = '⤡ Exit Full Screen';
            exitFsBtn.title = "Exit Full Screen (Esc)";
          }
        }
        if (wasMaximized) {
          polyOS.exitImmersiveMode();
        }
        this.springW.setTarget(this.restoreBounds.w);
        this.springH.setTarget(this.restoreBounds.h);
        origX = e.clientX - this.restoreBounds.w / 2;
        origY = e.clientY - 15;
      }

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const now = performance.now();
      const dt = Math.max((now - prevTime) / 1000, 0.001);

      velX = (e.clientX - prevMouseX) / dt;
      velY = (e.clientY - prevMouseY) / dt;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      prevTime = now;

      const targetX = origX + (e.clientX - startX);
      const targetY = Math.max(origY + (e.clientY - startY), 38);

      this.springX.current = targetX;
      this.springX.setTarget(targetX);
      this.springY.current = targetY;
      this.springY.setTarget(targetY);

      // Check FancyZones (Shift key held) vs Magnetic Aero Snap Zones
      if (e.shiftKey) {
        polyOS.hideSnapGhost();
        polyOS.showFancyZonesOverlay(e.clientX, e.clientY);
      } else {
        polyOS.hideFancyZonesOverlay();
        polyOS.checkSnapZones(e.clientX, e.clientY);
      }
    };

    const onMouseUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      // Check if released in a FancyZone or standard Aero Snap zone
      if (polyOS.activeFancyZoneIndex !== null) {
        const zoneIdx = polyOS.activeFancyZoneIndex;
        polyOS.hideFancyZonesOverlay();
        polyOS.applyFancyZoneSnap(this.id, zoneIdx);
      } else if (polyOS.activeSnapZone) {
        const snap = polyOS.activeSnapZone;
        polyOS.hideSnapGhost();
        polyOS.applySnap(this.id, snap);
      } else {
        polyOS.hideSnapGhost();
        polyOS.hideFancyZonesOverlay();
        // Natural release with velocity momentum
        const clampedVelX = Math.max(Math.min(velX * 0.15, 600), -600);
        const clampedVelY = Math.max(Math.min(velY * 0.15, 600), -600);
        this.springX.flick(this.springX.current + clampedVelX, velX);
        this.springY.flick(Math.max(this.springY.current + clampedVelY, 45), velY);
      }
    };

    titlebar.addEventListener('mousedown', onMouseDown);
  }

  update(dt) {
    const mx = this.springX.update(dt);
    const my = this.springY.update(dt);
    const mw = this.springW.update(dt);
    const mh = this.springH.update(dt);
    const ms = this.springScale.update(dt);
    const mo = this.springOpacity.update(dt);

    if (mx || my || mw || mh || ms || mo) {
      this.applyTransform();
      return true;
    }
    return false;
  }

  applyTransform() {
    if (!this.element) return;
    if (this.isMaximized) {
      this.element.style.position = 'fixed';
      this.element.style.top = '0px';
      this.element.style.left = '0px';
      this.element.style.right = '0px';
      this.element.style.bottom = '0px';
      this.element.style.width = '100vw';
      this.element.style.height = '100vh';
      this.element.style.transform = 'none';
      this.element.style.borderRadius = '0px';
      this.element.style.border = 'none';
      this.element.style.boxShadow = 'none';
      this.element.style.margin = '0px';
      this.element.style.zIndex = '99999';
    } else {
      this.element.style.position = 'absolute';
      this.element.style.top = '';
      this.element.style.left = '';
      this.element.style.right = '';
      this.element.style.bottom = '';
      this.element.style.borderRadius = '';
      this.element.style.border = '';
      this.element.style.boxShadow = '';
      this.element.style.margin = '';
      this.element.style.zIndex = this.element.classList.contains('focused') ? '100' : '10';
      this.element.style.transform = `translate3d(${this.springX.current}px, ${this.springY.current}px, 0) scale(${this.springScale.current})`;
      this.element.style.width = `${Math.max(this.springW.current, 200)}px`;
      this.element.style.height = `${Math.max(this.springH.current, 120)}px`;
    }
    this.element.style.opacity = `${Math.max(this.springOpacity.current, 0)}`;
    const os = window.polyOS || polyOS;
    const isCurrentWs = !os || (this.workspace === os.currentWorkspace);
    if (this.springOpacity.current < 0.05 || !isCurrentWs || this.isMinimized) {
      this.element.style.display = 'none';
    } else {
      this.element.style.display = 'flex';
    }
  }
}

// --- 3. Poly OS Shell Controller ---
class PolyOS {
  constructor() {
    this.windows = new Map();
    this.activeWindowId = null;
    this.activeSnapZone = null;
    this.dockMode = 'floating'; // 'floating' (iOS) or 'taskbar' (Windows)
    this.dockPos = 'bottom';    // 'bottom', 'left', 'right'
    this.dockAlign = 'center';  // 'center', 'start'
    this.nextWindowId = 1;
    this.isExposeActive = false;
    this.powerMode = 'balanced'; // 'low', 'balanced', 'turbo'
    this.systemMetrics = {
      cpu: 14,
      ramUsage: 195,
      maxRam: 1024,
      activeCount: 0,
      frozenCount: 0,
      refreshRate: 120,
      temperature: 41,
      thermalState: 'Optimal'
    };
    this.installedApps = new Set(['files', 'browser', 'terminal', 'notes', 'music', 'telemetry', 'settings', 'store']);
    this.activeWallpaper = 'cupertino';
    this.spotlightSelectedIndex = 0;
    this.spotlightCurrentResults = [];
    this.currentWorkspace = 1;

    this.initClock();
    this.initAudioAndThemes();
    this.initEventListeners();
    this.initDockControls();
    this.initSpotlight();
    this.initWorkspaces();
    this.initDesktopFiles();
    this.initDynamicIslandExpansion();
    this.initSystemMenu();
    this.initSmartWidget();
    this.initQuickLook();
    this.immersiveWindowId = null;
    this.initImmersiveHoverListeners();
    this.initAltTabHUD();
    this.initSnapAssist();
    this.initFancyZones();
    this.initLiveWallpaper();
    this.initDesktopWidgets();
    this.initPWA();
    this.startRenderLoop();
    this.startProcessLifecycleDaemon();
    this.seedDefaultApps();
  }

  initAltTabHUD() {
    this.altTabState = {
      active: false,
      selectedIndex: 0,
      windowList: []
    };

    const hud = document.getElementById('alttab-hud');
    const grid = document.getElementById('alttab-grid');

    const renderHUD = () => {
      if (!grid) return;
      grid.innerHTML = this.altTabState.windowList.map((win, idx) => `
        <div class="alttab-card ${idx === this.altTabState.selectedIndex ? 'active' : ''}" data-index="${idx}" data-id="${win.id}">
          <div class="alttab-card-icon">${win.icon}</div>
          <div class="alttab-card-title">${win.title}</div>
        </div>
      `).join('');

      grid.querySelectorAll('.alttab-card').forEach(card => {
        card.addEventListener('click', () => {
          const id = parseInt(card.dataset.id);
          this.focusWindow(id);
          this.closeAltTabHUD();
        });
      });
    };

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && e.altKey && !e.ctrlKey) {
        e.preventDefault();
        if (!this.altTabState.active) {
          const wins = Array.from(this.windows.values()).filter(w => !w.isMinimized && w.workspace === this.currentWorkspace);
          if (wins.length === 0) return;
          this.altTabState.active = true;
          this.altTabState.windowList = wins;
          this.altTabState.selectedIndex = (wins.length > 1) ? 1 : 0;
          if (hud) hud.classList.remove('hidden');
          polyAudio.playClick();
          renderHUD();
        } else {
          if (e.shiftKey) {
            this.altTabState.selectedIndex = (this.altTabState.selectedIndex - 1 + this.altTabState.windowList.length) % this.altTabState.windowList.length;
          } else {
            this.altTabState.selectedIndex = (this.altTabState.selectedIndex + 1) % this.altTabState.windowList.length;
          }
          polyAudio.playClick();
          renderHUD();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'Alt' && this.altTabState.active) {
        const selectedWin = this.altTabState.windowList[this.altTabState.selectedIndex];
        this.closeAltTabHUD();
        if (selectedWin) {
          this.focusWindow(selectedWin.id);
        }
      }
    });
  }

  closeAltTabHUD() {
    this.altTabState.active = false;
    const hud = document.getElementById('alttab-hud');
    if (hud) hud.classList.add('hidden');
  }

  initSnapAssist() {
    const overlay = document.getElementById('snap-assist-overlay');
    const closeBtn = document.getElementById('snap-assist-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeSnapAssist());
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) {
        this.closeSnapAssist();
      }
    });
  }

  triggerSnapAssist(targetZone, snappedWinId) {
    const overlay = document.getElementById('snap-assist-overlay');
    const grid = document.getElementById('snap-assist-grid');
    if (!overlay || !grid) return;

    const others = Array.from(this.windows.values()).filter(w => w.id !== snappedWinId && !w.isMinimized && w.workspace === this.currentWorkspace);
    if (others.length === 0) {
      this.closeSnapAssist();
      return;
    }

    const b = this.getWorkspaceBounds();
    const colW = (b.availW - b.innerGap) / 2;

    overlay.style.top = `${b.availY}px`;
    overlay.style.height = `${b.availH}px`;
    overlay.style.bottom = 'auto';

    if (targetZone === 'right-half') {
      overlay.style.left = `${b.availX + colW + b.innerGap}px`;
      overlay.style.width = `${colW}px`;
      overlay.style.right = 'auto';
    } else {
      overlay.style.left = `${b.availX}px`;
      overlay.style.width = `${colW}px`;
      overlay.style.right = 'auto';
    }

    grid.innerHTML = others.map(win => `
      <div class="snap-assist-card" data-id="${win.id}">
        <span class="card-icon">${win.icon}</span>
        <span class="card-title">${win.title}</span>
      </div>
    `).join('');

    grid.querySelectorAll('.snap-assist-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        this.applySnap(id, targetZone);
        this.focusWindow(id);
        this.closeSnapAssist();
      });
    });

    overlay.classList.remove('hidden');
  }

  closeSnapAssist() {
    const overlay = document.getElementById('snap-assist-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  initFancyZones() {
    this.fancyZonesLayout = localStorage.getItem('poly_fz_layout') || 'priority';
    this.fancyZonesGap = parseInt(localStorage.getItem('poly_fz_gap')) || 16;
    this.activeFancyZoneIndex = null;
    this.snapLayoutTargetWinId = null;

    const flyout = document.getElementById('snap-layouts-flyout');
    const modal = document.getElementById('fancyzones-modal');
    const modalClose = document.getElementById('fz-modal-close');
    const applyBtn = document.getElementById('fz-apply-btn');
    const gapSlider = document.getElementById('fz-gap-slider');
    const gapVal = document.getElementById('fz-gap-val');

    // Snap Layouts Flyout mini-slot click handlers
    if (flyout) {
      flyout.querySelectorAll('.mini-slot').forEach(slot => {
        slot.addEventListener('click', (e) => {
          e.stopPropagation();
          const card = slot.closest('.snap-layout-card');
          const layout = card ? card.dataset.layout : this.fancyZonesLayout;
          const zone = parseInt(slot.dataset.zone);
          const targetId = this.snapLayoutTargetWinId || this.activeWindowId;

          if (targetId) {
            this.applyFancyZoneSnap(targetId, zone, layout);
          }
          this.hideSnapLayoutsFlyout();
        });
      });

      let flyoutTimer = null;
      flyout.addEventListener('mouseleave', () => {
        flyoutTimer = setTimeout(() => this.hideSnapLayoutsFlyout(), 280);
      });
      flyout.addEventListener('mouseenter', () => {
        if (flyoutTimer) clearTimeout(flyoutTimer);
      });
    }

    // Modal template card selection
    if (modal) {
      modal.querySelectorAll('.fz-template-card').forEach(card => {
        card.addEventListener('click', () => {
          modal.querySelectorAll('.fz-template-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          this.fancyZonesLayout = card.dataset.template;
          polyAudio.playClick();
        });
      });

      if (gapSlider && gapVal) {
        gapSlider.value = this.fancyZonesGap;
        gapVal.textContent = `${this.fancyZonesGap} px`;
        gapSlider.addEventListener('input', (e) => {
          this.fancyZonesGap = parseInt(e.target.value);
          gapVal.textContent = `${this.fancyZonesGap} px`;
        });
      }

      if (applyBtn) {
        applyBtn.addEventListener('click', () => {
          localStorage.setItem('poly_fz_layout', this.fancyZonesLayout);
          localStorage.setItem('poly_fz_gap', this.fancyZonesGap);
          this.closeFancyZonesModal();
          this.notifyIsland(`📐 FancyZones: ${this.fancyZonesLayout.toUpperCase()} Layout Applied`);
          polyAudio.playSuccess();
        });
      }

      if (modalClose) {
        modalClose.addEventListener('click', () => this.closeFancyZonesModal());
      }
    }

    // Context menu link
    const ctxFz = document.getElementById('ctx-fancyzones');
    if (ctxFz) {
      ctxFz.addEventListener('click', () => this.openFancyZonesModal());
    }

    // Global keyboard shortcuts for FancyZones
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.altKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          this.openFancyZonesModal();
        } else {
          if (flyout && !flyout.classList.contains('hidden')) {
            this.hideSnapLayoutsFlyout();
          } else {
            this.showSnapLayoutsFlyout(this.activeWindowId);
          }
        }
      } else if ((e.metaKey || e.altKey) && ['1', '2', '3', '4'].includes(e.key) && !e.ctrlKey) {
        if (this.activeWindowId) {
          e.preventDefault();
          const zoneIndex = parseInt(e.key) - 1;
          this.applyFancyZoneSnap(this.activeWindowId, zoneIndex);
        }
      }
    });

    // Close flyout on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#snap-layouts-flyout') && !e.target.closest('.btn-max')) {
        this.hideSnapLayoutsFlyout();
      }
    });
  }

  getFancyZonesRects(layout = this.fancyZonesLayout, gap = this.fancyZonesGap) {
    const b = this.getWorkspaceBounds();
    const rects = [];

    if (layout === 'split') {
      const colW = (b.availW - gap) / 2;
      rects.push({ x: b.availX, y: b.availY, w: colW, h: b.availH });
      rects.push({ x: b.availX + colW + gap, y: b.availY, w: colW, h: b.availH });
    } else if (layout === 'priority') {
      const totalW = b.availW - (gap * 2);
      const sideW = totalW * 0.25;
      const centerW = totalW * 0.50;
      rects.push({ x: b.availX, y: b.availY, w: sideW, h: b.availH });
      rects.push({ x: b.availX + sideW + gap, y: b.availY, w: centerW, h: b.availH });
      rects.push({ x: b.availX + sideW + gap + centerW + gap, y: b.availY, w: sideW, h: b.availH });
    } else if (layout === 'quad') {
      const colW = (b.availW - gap) / 2;
      const rowH = (b.availH - gap) / 2;
      rects.push({ x: b.availX, y: b.availY, w: colW, h: rowH });
      rects.push({ x: b.availX + colW + gap, y: b.availY, w: colW, h: rowH });
      rects.push({ x: b.availX, y: b.availY + rowH + gap, w: colW, h: rowH });
      rects.push({ x: b.availX + colW + gap, y: b.availY + rowH + gap, w: colW, h: rowH });
    } else if (layout === 'master-stack') {
      const masterW = (b.availW - gap) * 0.65;
      const stackW = (b.availW - gap) * 0.35;
      const stackH = (b.availH - gap) / 2;
      rects.push({ x: b.availX, y: b.availY, w: masterW, h: b.availH });
      rects.push({ x: b.availX + masterW + gap, y: b.availY, w: stackW, h: stackH });
      rects.push({ x: b.availX + masterW + gap, y: b.availY + stackH + gap, w: stackW, h: stackH });
    }

    return rects;
  }

  showFancyZonesOverlay(mouseX, mouseY) {
    const overlay = document.getElementById('fancyzones-overlay');
    const container = document.getElementById('fancyzones-slots-container');
    if (!overlay || !container) return;

    const rects = this.getFancyZonesRects();
    overlay.classList.remove('hidden');

    let activeIdx = null;
    rects.forEach((r, idx) => {
      if (mouseX >= r.x && mouseX <= r.x + r.w && mouseY >= r.y && mouseY <= r.y + r.h) {
        activeIdx = idx;
      }
    });

    this.activeFancyZoneIndex = activeIdx;

    container.innerHTML = rects.map((r, idx) => `
      <div class="fancyzone-slot ${idx === activeIdx ? 'active' : ''}" style="left:${r.x}px; top:${r.y}px; width:${r.w}px; height:${r.h}px;">
        <span>Zone ${idx + 1}</span>
      </div>
    `).join('');
  }

  hideFancyZonesOverlay() {
    const overlay = document.getElementById('fancyzones-overlay');
    if (overlay) overlay.classList.add('hidden');
    this.activeFancyZoneIndex = null;
  }

  applyFancyZoneSnap(winId, zoneIndex, layout = this.fancyZonesLayout) {
    const win = this.windows.get(winId);
    if (!win) return;

    const rects = this.getFancyZonesRects(layout);
    const r = rects[zoneIndex % rects.length];
    if (!r) return;

    if (!win.isMaximized && !win.snapZone) {
      win.restoreBounds = {
        x: win.springX.current,
        y: win.springY.current,
        w: win.springW.current,
        h: win.springH.current
      };
    }

    if (win.isMaximized) {
      win.isMaximized = false;
      if (win.element) {
        win.element.classList.remove('maximized');
        const maxBtn = win.element.querySelector('.btn-max');
        if (maxBtn) {
          maxBtn.title = "Aero Maximize / Full Screen";
          maxBtn.classList.remove('is-restore');
          maxBtn.textContent = "□";
        }
      }
      this.exitImmersiveMode();
    }

    win.snapZone = `fz-${layout}-${zoneIndex}`;
    if (win.element) {
      win.element.classList.add('snapped');
    }
    win.springX.setTarget(r.x);
    win.springY.setTarget(r.y);
    win.springW.setTarget(r.w);
    win.springH.setTarget(r.h);
    polyAudio.playSnap();
    this.notifyIsland(`📐 FancyZones: Snapped ${win.title} into Zone ${zoneIndex + 1} (${layout.toUpperCase()})`);

    // Trigger Snap Assist for adjacent zones
    if (layout === 'split') {
      setTimeout(() => this.triggerSnapAssist(zoneIndex === 0 ? 'right-half' : 'left-half', win.id), 120);
    }
  }

  showSnapLayoutsFlyout(winId, anchorElement) {
    const flyout = document.getElementById('snap-layouts-flyout');
    if (!flyout) return;

    this.snapLayoutTargetWinId = winId;
    let targetX = 140;
    let targetY = 70;

    if (anchorElement) {
      const rect = anchorElement.getBoundingClientRect();
      targetX = Math.min(window.innerWidth - 330, Math.max(12, rect.left - 130));
      targetY = rect.bottom + 8;
    } else {
      const win = this.windows.get(winId);
      if (win && win.element) {
        const rect = win.element.getBoundingClientRect();
        targetX = Math.min(window.innerWidth - 330, Math.max(12, rect.left + rect.width / 2 - 150));
        targetY = rect.top + 34;
      }
    }

    flyout.style.left = `${targetX}px`;
    flyout.style.top = `${targetY}px`;
    flyout.classList.remove('hidden');
    polyAudio.playClick();
  }

  hideSnapLayoutsFlyout() {
    const flyout = document.getElementById('snap-layouts-flyout');
    if (flyout) flyout.classList.add('hidden');
    this.snapLayoutTargetWinId = null;
  }

  openFancyZonesModal() {
    const modal = document.getElementById('fancyzones-modal');
    if (!modal) return;

    modal.querySelectorAll('.fz-template-card').forEach(card => {
      card.classList.toggle('active', card.dataset.template === this.fancyZonesLayout);
    });

    const gapSlider = document.getElementById('fz-gap-slider');
    const gapVal = document.getElementById('fz-gap-val');
    if (gapSlider && gapVal) {
      gapSlider.value = this.fancyZonesGap;
      gapVal.textContent = `${this.fancyZonesGap} px`;
    }

    modal.classList.remove('hidden');
    polyAudio.playClick();
  }

  closeFancyZonesModal() {
    const modal = document.getElementById('fancyzones-modal');
    if (modal) modal.classList.add('hidden');
  }

  initLiveWallpaper() {
    const canvas = document.getElementById('live-wallpaper-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.liveWallpaperMode = 'aurora';

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = 55;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: 1.5 + Math.random() * 2
      });
    }

    let mouseX = -999;
    let mouseY = -999;
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    let t = 0;
    const render = () => {
      t += 0.015;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (this.liveWallpaperMode === 'aurora') {
        const w = canvas.width;
        const h = canvas.height;

        for (let band = 0; band < 3; band++) {
          ctx.beginPath();
          ctx.moveTo(0, h);
          for (let x = 0; x <= w; x += 20) {
            const yOffset = Math.sin(x * 0.003 + t + band * 1.5) * 60 +
                            Math.sin(x * 0.007 - t * 0.8) * 35;
            const y = h * 0.45 + band * 70 + yOffset;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(w, h);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, h * 0.2, w, h);
          if (band === 0) {
            grad.addColorStop(0, 'rgba(10, 132, 255, 0.22)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          } else if (band === 1) {
            grad.addColorStop(0, 'rgba(48, 209, 88, 0.18)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          } else {
            grad.addColorStop(0, 'rgba(191, 90, 242, 0.2)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          }
          ctx.fillStyle = grad;
          ctx.fill();
        }
      } else if (this.liveWallpaperMode === 'particles') {
        const w = canvas.width;
        const h = canvas.height;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;

          const dxMouse = mouseX - p.x;
          const dyMouse = mouseY - p.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          if (distMouse < 140) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(10, 132, 255, ${0.45 * (1 - distMouse / 140)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
          }

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 110) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(255, 255, 255, ${0.18 * (1 - dist / 110)})`;
              ctx.lineWidth = 0.8;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(100, 210, 255, 0.7)';
          ctx.fill();
        }
      } else if (this.liveWallpaperMode === 'cupertino') {
        const w = canvas.width;
        const h = canvas.height;
        const pulse = 0.85 + Math.sin(t * 0.8) * 0.15;
        const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 100 * pulse, w * 0.5, h * 0.5, w * 0.7);
        grad.addColorStop(0, 'rgba(28, 38, 70, 0.35)');
        grad.addColorStop(1, 'rgba(10, 12, 18, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      requestAnimationFrame(render);
    };

    render();

    const liveWallBtn = document.getElementById('ctx-live-wallpaper');
    if (liveWallBtn) {
      liveWallBtn.addEventListener('click', () => {
        this.cycleLiveWallpaper();
      });
    }

    window.addEventListener('keydown', (e) => {
      if ((e.key === 'l' || e.key === 'L') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          this.cycleLiveWallpaper();
        }
      }
    });
  }

  cycleLiveWallpaper() {
    const modes = ['aurora', 'particles', 'cupertino', 'off'];
    const nextIdx = (modes.indexOf(this.liveWallpaperMode) + 1) % modes.length;
    this.liveWallpaperMode = modes[nextIdx];
    const canvas = document.getElementById('live-wallpaper-canvas');
    if (canvas) {
      canvas.style.opacity = (this.liveWallpaperMode === 'off') ? '0' : '0.92';
    }
    this.notifyIsland(`🌌 Live Wallpaper: ${this.liveWallpaperMode.toUpperCase()}`);
    polyAudio.playClick();
  }

  initDesktopWidgets() {
    this.topWidgetZIndex = 20;

    const widgets = document.querySelectorAll('.desktop-widget');
    const savedPositionsRaw = localStorage.getItem('poly_widget_positions');
    let savedPositions = {};
    if (savedPositionsRaw) {
      try {
        savedPositions = JSON.parse(savedPositionsRaw) || {};
      } catch(e) {}
    }

    // Apply saved positions if present
    widgets.forEach(w => {
      const id = w.dataset.widgetId;
      if (id && savedPositions[id]) {
        w.style.left = savedPositions[id].left + 'px';
        w.style.top = savedPositions[id].top + 'px';
        w.style.right = 'auto';
        w.style.bottom = 'auto';
      }
    });

    // Make each widget freely draggable anywhere on screen
    widgets.forEach(widget => {
      const header = widget.querySelector('.widget-header');
      if (!header) return;

      header.addEventListener('mousedown', (e) => {
        // Do not drag if interacting with buttons, color pickers, or inputs
        if (e.target.closest('button, .color-dot, input, textarea')) return;

        e.preventDefault();
        this.topWidgetZIndex++;
        widget.style.zIndex = this.topWidgetZIndex;
        widget.classList.add('is-dragging');

        const rect = widget.getBoundingClientRect();
        const startMouseX = e.clientX;
        const startMouseY = e.clientY;
        const startLeft = rect.left;
        const startTop = rect.top;

        widget.style.left = startLeft + 'px';
        widget.style.top = startTop + 'px';
        widget.style.right = 'auto';
        widget.style.bottom = 'auto';

        let currentX = startLeft;
        let currentY = startTop;

        const onMouseMove = (ev) => {
          const deltaX = ev.clientX - startMouseX;
          const deltaY = ev.clientY - startMouseY;
          let newX = startLeft + deltaX;
          let newY = startTop + deltaY;

          // Clamping to visible desktop bounds
          const minX = 10;
          const maxX = window.innerWidth - widget.offsetWidth - 10;
          const minY = 44; // Top bar clearance
          const maxY = window.innerHeight - widget.offsetHeight - 64; // Dock clearance

          newX = Math.max(minX, Math.min(maxX, newX));
          newY = Math.max(minY, Math.min(maxY, newY));

          currentX = newX;
          currentY = newY;

          widget.style.left = newX + 'px';
          widget.style.top = newY + 'px';
        };

        const onMouseUp = () => {
          widget.classList.remove('is-dragging');
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);

          const id = widget.dataset.widgetId;
          if (id) {
            savedPositions[id] = { left: Math.round(currentX), top: Math.round(currentY) };
            localStorage.setItem('poly_widget_positions', JSON.stringify(savedPositions));
          }
          polyAudio.playClick();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });

    // Reset widgets layout from context menu
    const resetWidgetsBtn = document.getElementById('ctx-reset-widgets');
    if (resetWidgetsBtn) {
      resetWidgetsBtn.addEventListener('click', () => {
        localStorage.removeItem('poly_widget_positions');
        savedPositions = {};
        widgets.forEach(w => {
          w.style.left = '';
          w.style.top = '';
          w.style.right = '';
          w.style.bottom = '';
          w.style.zIndex = '';
        });
        this.notifyIsland('📍 Desktop Widgets Reset to Default Layout');
        polyAudio.playSuccess();
      });
    }

    const updateClock = () => {
      const timeElem = document.getElementById('clock-widget-time');
      const dateElem = document.getElementById('clock-widget-date');
      const now = new Date();
      if (timeElem) timeElem.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (dateElem) dateElem.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    };
    updateClock();
    setInterval(updateClock, 1000);

    let currentTemp = 22;
    setInterval(() => {
      const tempElem = document.getElementById('weather-temp');
      if (tempElem) {
        currentTemp = 21 + Math.floor(Math.sin(Date.now() * 0.0001) * 3);
        tempElem.textContent = `${currentTemp}°C`;
      }
    }, 5000);

    const stickyText = document.getElementById('desktop-sticky-text');
    const stickyWidget = document.getElementById('desktop-sticky-widget');
    if (stickyText) {
      const saved = localStorage.getItem('poly_sticky_note');
      if (saved) stickyText.value = saved;
      stickyText.addEventListener('input', () => {
        localStorage.setItem('poly_sticky_note', stickyText.value);
      });
    }

    document.querySelectorAll('.sticky-color-picker .color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        document.querySelectorAll('.sticky-color-picker .color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        const color = dot.dataset.color;
        if (stickyWidget) {
          stickyWidget.className = `desktop-widget glass-sticky-widget theme-${color}`;
        }
        polyAudio.playClick();
      });
    });

    const toggleWidgetsBtn = document.getElementById('ctx-toggle-widgets');
    if (toggleWidgetsBtn) {
      toggleWidgetsBtn.addEventListener('click', () => {
        document.body.classList.toggle('desktop-widgets-hidden');
        const isHidden = document.body.classList.contains('desktop-widgets-hidden');
        this.notifyIsland(isHidden ? '🧩 Desktop Widgets Hidden' : '🧩 Desktop Widgets Visible');
        polyAudio.playClick();
      });
    }
  }

  initPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach(r => r.unregister());
      });
    }
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach(n => caches.delete(n));
      });
    }

    this.deferredInstallPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      const pill = document.getElementById('install-status-pill');
      if (pill) pill.textContent = '1-Click Install';
      this.notifyIsland('📥 Poly OS is ready to install as a standalone desktop app!');
    });

    const installBtn = document.getElementById('sys-install');
    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (this.deferredInstallPrompt) {
          this.deferredInstallPrompt.prompt();
          const { outcome } = await this.deferredInstallPrompt.userChoice;
          if (outcome === 'accepted') {
            this.notifyIsland('🚀 Poly OS installed to desktop!');
          }
          this.deferredInstallPrompt = null;
        } else {
          this.notifyIsland('✨ Poly OS PWA is active with 100% offline desktop caching!');
        }
      });
    }
  }

  initClock() {
    const updateTime = () => {
      const now = new Date();
      document.getElementById('system-clock').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  setWallpaper(name) {
    const desktop = document.getElementById('desktop');
    if (!desktop) return;
    desktop.classList.remove('wallpaper-cupertino', 'wallpaper-redmond', 'wallpaper-aurora', 'wallpaper-cyber');
    desktop.classList.add(`wallpaper-${name}`);
    this.activeWallpaper = name;
    this.notifyIsland(`🎨 Theme: ${name.charAt(0).toUpperCase() + name.slice(1)} Active`);
    polyAudio.playClick();
  }

  initAudioAndThemes() {
    // Set default wallpaper
    this.setWallpaper('cupertino');

    // Attach click sound to interactive buttons across the shell
    document.addEventListener('click', (e) => {
      if (e.target.closest('button, .dock-item, .grid-app, .sidebar-item, .seg-btn, .file-card, .crumb, .store-card, .store-category-btn')) {
        polyAudio.playClick();
      }
    });

    // Control center volume slider
    const volSlider = document.getElementById('volume-slider');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        polyAudio.enabled = (parseInt(e.target.value) > 0);
      });
    }
  }

  openSpotlight() {
    const overlay = document.getElementById('spotlight-overlay');
    const input = document.getElementById('spotlight-input');
    if (!overlay || !input) return;
    overlay.classList.remove('hidden');
    input.value = '';
    input.focus();
    polyAudio.playClick();
    this.updateSpotlightResults('');
  }

  closeSpotlight() {
    const overlay = document.getElementById('spotlight-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  toggleSpotlight() {
    const overlay = document.getElementById('spotlight-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      this.closeSpotlight();
    } else {
      this.openSpotlight();
    }
  }

  initSpotlight() {
    const overlay = document.getElementById('spotlight-overlay');
    const input = document.getElementById('spotlight-input');
    const closeBtn = document.getElementById('spotlight-close-btn');
    const topbarBtn = document.getElementById('spotlight-btn');

    if (topbarBtn) {
      topbarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openSpotlight();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeSpotlight());
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (!e.target.closest('#spotlight-box')) {
          this.closeSpotlight();
        }
      });
    }

    // Global keyboard shortcut: Cmd+Space / Ctrl+Space / Alt+Space
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey || e.altKey) && e.code === 'Space') {
        e.preventDefault();
        this.toggleSpotlight();
      } else if (e.key === 'Escape') {
        if (overlay && !overlay.classList.contains('hidden')) {
          e.preventDefault();
          this.closeSpotlight();
        }
      }
    });

    if (input) {
      input.addEventListener('input', (e) => {
        this.updateSpotlightResults(e.target.value.trim());
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (this.spotlightCurrentResults.length > 0) {
            this.spotlightSelectedIndex = (this.spotlightSelectedIndex + 1) % this.spotlightCurrentResults.length;
            this.renderSpotlightResults();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (this.spotlightCurrentResults.length > 0) {
            this.spotlightSelectedIndex = (this.spotlightSelectedIndex - 1 + this.spotlightCurrentResults.length) % this.spotlightCurrentResults.length;
            this.renderSpotlightResults();
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.executeSpotlightSelected();
        }
      });
    }
  }

  updateSpotlightResults(query) {
    this.spotlightSelectedIndex = 0;
    const results = [];

    // 1. Math calculation detection
    if (query.length > 0) {
      const mathResult = this.tryEvaluateMath(query);
      if (mathResult !== null) {
        results.push({
          type: 'calc',
          icon: '🧮',
          title: `${mathResult}`,
          subtitle: `Math calculation result for: ${query}`,
          badge: 'Copy Result',
          action: () => {
            navigator.clipboard?.writeText(String(mathResult));
            this.notifyIsland(`📋 Copied: ${mathResult}`);
            polyAudio.playSuccess();
          }
        });
      }
    }

    // 2. Apps database
    const allApps = [
      { id: 'files', name: 'Files & Workspace', icon: '📁', desc: 'Browse folders, NVMe SSD, tags & projects', category: 'App' },
      { id: 'browser', name: 'Poly Browser', icon: '🌐', desc: 'Fast, decoupled 120 FPS web engine', category: 'App' },
      { id: 'terminal', name: 'Terminal & Shell', icon: '⌨️', desc: 'Preemptible Linux bash shell & cgroups telemetry', category: 'App' },
      { id: 'notes', name: 'Notes & Ideas', icon: '📝', desc: 'Fluid scratchpad & markdown notepad', category: 'App' },
      { id: 'music', name: 'Poly Music', icon: '🎵', desc: 'Zero-friction player with PipeWire audio lease', category: 'App' },
      { id: 'telemetry', name: 'Process Monitor (polyd)', icon: '⚡', desc: 'Real-time cgroups v2 background process tree', category: 'App' },
      { id: 'store', name: 'Poly App Store', icon: '🛍️', desc: 'Package manager & app ecosystem', category: 'App' },
      { id: 'settings', name: 'System Settings', icon: '⚙️', desc: 'Display 120Hz, wallpapers, sound & energy', category: 'App' },
      { id: 'code', name: 'Poly Code Studio', icon: '💻', desc: 'Developer IDE with syntax tabs & runner', category: 'App' },
      { id: 'canvas', name: 'Vector Canvas', icon: '🎨', desc: 'Freehand sketching & whiteboard canvas', category: 'App' },
      { id: 'arcade', name: 'Retro Arcade (Pong)', icon: '🕹️', desc: '120Hz smooth physics arcade game', category: 'App' },
      { id: 'calculator', name: 'Poly Calculator', icon: '🧮', desc: 'Scientific math & equations engine', category: 'App' }
    ];

    const qLower = query.toLowerCase();

    // Filter apps
    allApps.forEach(app => {
      if (!query || app.name.toLowerCase().includes(qLower) || app.desc.toLowerCase().includes(qLower) || app.id.includes(qLower)) {
        results.push({
          type: 'app',
          icon: app.icon,
          title: app.name,
          subtitle: app.desc,
          badge: this.installedApps.has(app.id) ? 'Installed' : 'Store App',
          action: () => {
            this.launchApp(app.id);
            polyAudio.playClick();
          }
        });
      }
    });

    // 3. System Actions
    const actions = [
      {
        title: 'Toggle Taskbar Mode (Windows ↔ iOS)',
        icon: '↔️',
        desc: 'Switch between floating pill and full-width taskbar',
        action: () => {
          this.setDockMode(this.dockMode === 'floating' ? 'taskbar' : 'floating');
          polyAudio.playSnap();
        }
      },
      {
        title: 'App Exposé View (Win + Tab)',
        icon: '🪟',
        desc: 'Overview grid of all running windows',
        action: () => {
          this.toggleExpose();
        }
      },
      {
        title: 'Free Inactive Apps Memory (polyd purge)',
        icon: '⚡',
        desc: 'Force cgroups v2 freezing on background tasks',
        action: () => {
          this.windows.forEach(w => {
            if (w.id !== this.activeWindowId && !w.title.includes('Music')) {
              w.isFrozen = true;
              w.element.classList.add('frozen');
            }
          });
          this.notifyIsland('⚡ polyd: Background processes frozen & ZRAM compacted');
          polyAudio.playSuccess();
        }
      },
      {
        title: 'Switch Wallpaper: Cupertino Glass',
        icon: '🌌',
        desc: 'Deep indigo & violet Apple-style glass gradient',
        action: () => this.setWallpaper('cupertino')
      },
      {
        title: 'Switch Wallpaper: Redmond Horizon',
        icon: '🌊',
        desc: 'Windows 11 cobalt blue flowing silk wallpaper',
        action: () => this.setWallpaper('redmond')
      },
      {
        title: 'Switch Wallpaper: Nordic Aurora',
        icon: '🌲',
        desc: 'Teal & emerald ambient glow theme',
        action: () => this.setWallpaper('aurora')
      },
      {
        title: 'Switch Wallpaper: Cyber Dusk',
        icon: '🌆',
        desc: 'Neon magenta and obsidian twilight theme',
        action: () => this.setWallpaper('cyber')
      },
      {
        title: 'Toggle System Acoustic Sounds',
        icon: '🔊',
        desc: 'Enable or disable haptic clicks and window snap chimes',
        action: () => {
          polyAudio.enabled = !polyAudio.enabled;
          this.notifyIsland(`🔊 System Sounds: ${polyAudio.enabled ? 'Enabled' : 'Muted'}`);
          if (polyAudio.enabled) polyAudio.playSuccess();
        }
      }
    ];

    actions.forEach(act => {
      if (!query || act.title.toLowerCase().includes(qLower) || act.desc.toLowerCase().includes(qLower)) {
        results.push({
          type: 'action',
          icon: act.icon,
          title: act.title,
          subtitle: act.desc,
          badge: 'Command',
          action: act.action
        });
      }
    });

    // 4. Virtual Files
    const files = [
      { name: 'poly-compositor', icon: '📁', meta: 'Rust Smithay Wayland Server' },
      { name: 'SPECIFICATION.md', icon: '📄', meta: 'Poly OS Architecture Math & Spec' },
      { name: 'physics.rs', icon: '🦀', meta: 'Rust Spring Mass-Damper Equations' },
      { name: 'polyd.py', icon: '🐍', meta: 'cgroups v2 Process Freezer Daemon' },
      { name: 'build-iso.sh', icon: '⚙️', meta: 'Alpine Linux Rootfs ISO Builder' },
      { name: 'wallpaper-glass.heic', icon: '🖼️', meta: '5K Glassmorphic Wallpaper' }
    ];

    files.forEach(f => {
      if (query && (f.name.toLowerCase().includes(qLower) || f.meta.toLowerCase().includes(qLower))) {
        results.push({
          type: 'file',
          icon: f.icon,
          title: f.name,
          subtitle: f.meta,
          badge: 'File',
          action: () => {
            this.launchApp('files');
            this.notifyIsland(`📁 Opening file: ${f.name}`);
            polyAudio.playClick();
          }
        });
      }
    });

    this.spotlightCurrentResults = results;
    this.renderSpotlightResults();
  }

  tryEvaluateMath(str) {
    try {
      let cleaned = str.trim().toLowerCase();
      // Percent of: e.g. 20% of 500
      cleaned = cleaned.replace(/(\d+(?:\.\d+)?)\s*%\s*(?:of)?\s*(\d+(?:\.\d+)?)/g, '($1 / 100 * $2)');
      // Power: 2^8 -> 2**8
      cleaned = cleaned.replace(/\^/g, '**');
      // Functions
      cleaned = cleaned.replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)');
      cleaned = cleaned.replace(/sin\(([^)]+)\)/g, 'Math.sin($1)');
      cleaned = cleaned.replace(/cos\(([^)]+)\)/g, 'Math.cos($1)');
      cleaned = cleaned.replace(/abs\(([^)]+)\)/g, 'Math.abs($1)');
      cleaned = cleaned.replace(/\bpi\b/g, 'Math.PI');
      cleaned = cleaned.replace(/\be\b/g, 'Math.E');

      // Only allow safe math tokens
      if (!/^[\d\s\+\-\*\/\.\(\)\%\,Math\.\w]+$/.test(cleaned)) {
        return null;
      }
      // Must contain at least one math operator or number
      if (!/\d/.test(cleaned)) return null;

      const fn = new Function(`return (${cleaned});`);
      const val = fn();
      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        // Format nicely
        return Math.round(val * 100000) / 100000;
      }
      return null;
    } catch(e) {
      return null;
    }
  }

  renderSpotlightResults() {
    const container = document.getElementById('spotlight-results');
    if (!container) return;

    if (this.spotlightCurrentResults.length === 0) {
      container.innerHTML = `
        <div style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 13px;">
          No matching apps, files, math, or commands found.
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    this.spotlightCurrentResults.slice(0, 8).forEach((item, idx) => {
      if (item.type === 'calc') {
        const card = document.createElement('div');
        card.className = `spotlight-calc-card ${idx === this.spotlightSelectedIndex ? 'active' : ''}`;
        card.innerHTML = `
          <div>
            <div class="spotlight-calc-expr">🧮 Calculator Answer</div>
            <div class="spotlight-calc-ans">${item.title}</div>
          </div>
          <span class="spotlight-item-badge">↵ Copy</span>
        `;
        card.addEventListener('click', () => {
          item.action();
          this.closeSpotlight();
        });
        container.appendChild(card);
      } else {
        const row = document.createElement('div');
        row.className = `spotlight-item ${idx === this.spotlightSelectedIndex ? 'active' : ''}`;
        row.innerHTML = `
          <div class="spotlight-item-icon">${item.icon}</div>
          <div class="spotlight-item-info">
            <div class="spotlight-item-title">${item.title}</div>
            <div class="spotlight-item-sub">${item.subtitle}</div>
          </div>
          <span class="spotlight-item-badge">${item.badge}</span>
        `;
        row.addEventListener('click', () => {
          item.action();
          this.closeSpotlight();
        });
        container.appendChild(row);
      }
    });
  }

  executeSpotlightSelected() {
    if (this.spotlightCurrentResults.length > 0 && this.spotlightCurrentResults[this.spotlightSelectedIndex]) {
      const item = this.spotlightCurrentResults[this.spotlightSelectedIndex];
      item.action();
      this.closeSpotlight();
    }
  }

  initEventListeners() {
    const cc = document.getElementById('control-center');
    const notifCenter = document.getElementById('notification-center');
    const startMenu = document.getElementById('start-menu');

    // Control Center Toggle
    const ccBtn = document.getElementById('cc-btn');
    if (ccBtn && cc) {
      ccBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cc.classList.toggle('hidden');
        if (!cc.classList.contains('hidden') && notifCenter) {
          notifCenter.classList.add('hidden');
        }
      });
    }

    // Notification Center Toggle
    const notifBtn = document.getElementById('notif-btn');
    if (notifBtn && notifCenter) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifCenter.classList.toggle('hidden');
        if (!notifCenter.classList.contains('hidden') && cc) {
          cc.classList.add('hidden');
        }
      });
    }

    // Clear all notifications
    const notifClearBtn = document.getElementById('notif-clear-btn');
    if (notifClearBtn) {
      notifClearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        polyAudio.playClick();
        document.querySelectorAll('.notif-card.unread').forEach(c => c.classList.remove('unread'));
        const badge = document.getElementById('notif-badge');
        if (badge) badge.classList.add('hidden');
        const countBadge = document.getElementById('notif-count-badge');
        if (countBadge) {
          countBadge.textContent = '0 New';
          countBadge.style.opacity = '0.5';
        }
      });
    }

    // Battery / Power Indicator Click (opens Energy Engine in Control Center)
    const batteryBtn = document.getElementById('battery-btn');
    if (batteryBtn && cc) {
      batteryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cc.classList.remove('hidden');
        if (notifCenter) notifCenter.classList.add('hidden');
        polyAudio.playClick();
      });
    }

    // Start Menu Toggle
    const startBtn = document.getElementById('start-btn');
    if (startBtn && startMenu) {
      startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startMenu.classList.toggle('hidden');
      });
    }

    // Click outside to close menus and flyouts
    window.addEventListener('click', (e) => {
      if (cc && !e.target.closest('#control-center') && !e.target.closest('#cc-btn') && !e.target.closest('#battery-btn')) {
        cc.classList.add('hidden');
      }
      if (notifCenter && !e.target.closest('#notification-center') && !e.target.closest('#notif-btn')) {
        notifCenter.classList.add('hidden');
      }
      if (startMenu && !e.target.closest('#start-menu') && !e.target.closest('#start-btn')) {
        startMenu.classList.add('hidden');
      }
    });

    // Exposé Toggle (Win + Tab / button)
    document.getElementById('expose-btn').addEventListener('click', () => {
      this.toggleExpose();
    });

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Tab') {
        e.preventDefault();
        this.toggleExpose();
      }
    });

    // Windows-Style Magnetic Aero Snap Keyboard Shortcuts (Win + Arrows or Alt + Arrows)
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.altKey) && !e.ctrlKey) {
        if (!this.activeWindowId) return;
        const win = this.windows.get(this.activeWindowId);
        if (!win || win.isMinimized) return;

        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (e.shiftKey) {
            this.applySnap(win.id, 'top-left');
          } else {
            this.applySnap(win.id, 'left-half');
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (e.shiftKey) {
            this.applySnap(win.id, 'top-right');
          } else {
            this.applySnap(win.id, 'right-half');
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.applySnap(win.id, 'maximize');
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (win.isMaximized) {
            this.restoreMaximize(win.id);
          } else if (win.snapZone) {
            win.snapZone = null;
            win.springX.setTarget(win.restoreBounds.x);
            win.springY.setTarget(win.restoreBounds.y);
            win.springW.setTarget(win.restoreBounds.w);
            win.springH.setTarget(win.restoreBounds.h);
            polyAudio.playSpring();
            this.notifyIsland(`🪟 Restored ${win.title}`);
          } else {
            this.minimizeWindow(win.id);
          }
        }
      }
    });

    // F11 Fullscreen & Esc Exit Fullscreen
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F11') {
        e.preventDefault();
        if (this.activeWindowId) {
          this.toggleMaximize(this.activeWindowId);
        }
      } else if (e.key === 'Escape') {
        const qlModal = document.getElementById('quicklook-modal');
        const spotlightOverlay = document.getElementById('spotlight-overlay');
        const exposeOverlay = document.getElementById('expose-overlay');
        const sysMenu = document.getElementById('poly-system-menu');
        const isOverlayOpen = (qlModal && !qlModal.classList.contains('hidden')) ||
                              (spotlightOverlay && !spotlightOverlay.classList.contains('hidden')) ||
                              (exposeOverlay && !exposeOverlay.classList.contains('hidden')) ||
                              (sysMenu && !sysMenu.classList.contains('hidden'));
        if (!isOverlayOpen && document.body.classList.contains('immersive-mode')) {
          if (this.activeWindowId) {
            this.restoreMaximize(this.activeWindowId);
          } else {
            for (const win of this.windows.values()) {
              if (win.isMaximized) {
                this.restoreMaximize(win.id);
                break;
              }
            }
          }
        }
      }
    });

    // On browser window resize, re-anchor maximized windows to 100vw x 100vh
    window.addEventListener('resize', () => {
      for (const win of this.windows.values()) {
        if (win.isMaximized) {
          win.springX.setTarget(0);
          win.springY.setTarget(0);
          win.springW.setTarget(window.innerWidth);
          win.springH.setTarget(window.innerHeight);
        }
      }
    });

    // Workspace Switching Keyboard Shortcuts (Ctrl + Alt + 1/2 or Ctrl + Alt + Left/Right)
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          this.switchWorkspace(1);
        } else if (e.key === '2') {
          e.preventDefault();
          this.switchWorkspace(2);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          this.switchWorkspace(this.currentWorkspace === 1 ? 2 : 1);
        }
      }
    });

    // Dock app launches & intelligent focus / unminimize toggle
    document.querySelectorAll('.dock-item[data-app]').forEach(btn => {
      btn.addEventListener('click', () => {
        const app = btn.dataset.app;
        this.handleAppIconClick(app);
      });
    });

    // Start menu app launches
    document.querySelectorAll('.grid-app[data-launch]').forEach(btn => {
      btn.addEventListener('click', () => {
        const app = btn.dataset.launch;
        this.handleAppIconClick(app);
        document.getElementById('start-menu').classList.add('hidden');
      });
    });

    // Power modes
    document.querySelectorAll('.mode-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.mode-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.powerMode = pill.dataset.mode;
        this.syncSystemMetrics();
        this.notifyIsland(`⚡ Energy Engine: ${pill.textContent}`);
      });
    });
  }

  initWorkspaces() {
    document.querySelectorAll('.ws-pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wsId = parseInt(btn.dataset.ws);
        this.switchWorkspace(wsId);
      });
    });
  }

  switchWorkspace(targetWs) {
    if (this.currentWorkspace === targetWs) return;
    const prev = this.currentWorkspace;
    this.currentWorkspace = targetWs;

    document.querySelectorAll('.ws-pill-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.ws) === targetWs);
    });

    const wsEl = document.getElementById('workspace');
    if (wsEl) {
      wsEl.classList.remove('switching-left', 'switching-right');
      void wsEl.offsetWidth;
      wsEl.classList.add(targetWs > prev ? 'switching-left' : 'switching-right');
      setTimeout(() => wsEl.classList.remove('switching-left', 'switching-right'), 400);
    }

    let topWinId = null;
    this.windows.forEach(w => {
      if (w.workspace === targetWs) {
        if (!w.isMinimized) {
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
      const focusedNameEl = document.getElementById('focused-app-name');
      if (focusedNameEl) focusedNameEl.textContent = `Desktop ${targetWs}`;
    }

    this.renderTaskbarWindowStrip();
    polyAudio.playSnap();
    this.notifyIsland(`🖥️ Workspace: Desktop ${targetWs}`);
  }

  handleAppIconClick(app) {
    const matchingWins = [];
    this.windows.forEach(w => {
      const key = this.getAppKeyForWindow(w);
      if (key === app) {
        matchingWins.push(w);
      }
    });

    if (matchingWins.length === 0) {
      this.launchApp(app);
      return;
    }

    if (matchingWins.length === 1) {
      const win = matchingWins[0];
      if (win.workspace !== this.currentWorkspace) {
        this.switchWorkspace(win.workspace);
      }
      if (win.isMinimized) {
        win.isMinimized = false;
        win.springScale.setTarget(1.0);
        win.springOpacity.setTarget(1.0);
        this.focusWindow(win.id);
        polyAudio.playSpring();
      } else if (this.activeWindowId === win.id) {
        this.minimizeWindow(win.id);
      } else {
        this.focusWindow(win.id);
        polyAudio.playClick();
      }
      return;
    }

    // Multiple windows open for this app: cycle or bring to focus
    const activeIdx = matchingWins.findIndex(w => w.id === this.activeWindowId && !w.isMinimized);
    let nextWin = null;
    if (activeIdx === -1) {
      nextWin = matchingWins.find(w => !w.isMinimized) || matchingWins[0];
    } else {
      nextWin = matchingWins[(activeIdx + 1) % matchingWins.length];
    }

    if (nextWin.workspace !== this.currentWorkspace) {
      this.switchWorkspace(nextWin.workspace);
    }
    if (nextWin.isMinimized) {
      nextWin.isMinimized = false;
      nextWin.springScale.setTarget(1.0);
      nextWin.springOpacity.setTarget(1.0);
    }
    this.focusWindow(nextWin.id);
    polyAudio.playClick();
  }

  initDesktopFiles() {
    const desktopFiles = document.querySelectorAll('.desktop-file');
    const ctxMenu = document.getElementById('desktop-context-menu');
    let activeCtxTarget = null;

    desktopFiles.forEach(fileEl => {
      fileEl.addEventListener('dragstart', (e) => {
        const fileName = fileEl.dataset.file;
        fileEl.classList.add('dragging');
        e.dataTransfer.setData('text/plain', fileName);
        polyAudio.playClick();
      });

      fileEl.addEventListener('dragend', () => {
        fileEl.classList.remove('dragging');
      });

      fileEl.addEventListener('click', (e) => {
        e.stopPropagation();
        desktopFiles.forEach(f => f.classList.remove('selected'));
        fileEl.classList.add('selected');
        polyAudio.playClick();
        if (ctxMenu) ctxMenu.classList.add('hidden');
      });

      fileEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const fileName = fileEl.dataset.file;
        this.openQuickLook(fileName);
      });

      fileEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        desktopFiles.forEach(f => f.classList.remove('selected'));
        fileEl.classList.add('selected');
        activeCtxTarget = fileEl.dataset.file;

        if (ctxMenu) {
          ctxMenu.classList.remove('hidden');
          const posX = Math.min(e.clientX, window.innerWidth - 220);
          const posY = Math.min(e.clientY, window.innerHeight - 240);
          ctxMenu.style.left = `${posX}px`;
          ctxMenu.style.top = `${posY}px`;
          polyAudio.playClick();
        }
      });
    });

    // Right-click on empty desktop background
    const desktopEl = document.getElementById('desktop');
    if (desktopEl && ctxMenu) {
      desktopEl.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.desktop-file') || e.target.closest('#dock-container') || e.target.closest('#top-bar') || e.target.closest('.window')) {
          return;
        }
        e.preventDefault();
        activeCtxTarget = null;
        ctxMenu.classList.remove('hidden');
        const posX = Math.min(e.clientX, window.innerWidth - 220);
        const posY = Math.min(e.clientY, window.innerHeight - 240);
        ctxMenu.style.left = `${posX}px`;
        ctxMenu.style.top = `${posY}px`;
        polyAudio.playClick();
      });
    }

    // Context menu item actions
    document.getElementById('ctx-open')?.addEventListener('click', () => {
      ctxMenu?.classList.add('hidden');
      if (activeCtxTarget) {
        this.openQuickLook(activeCtxTarget);
      }
    });

    document.getElementById('ctx-quicklook')?.addEventListener('click', () => {
      ctxMenu?.classList.add('hidden');
      if (activeCtxTarget) {
        this.openQuickLook(activeCtxTarget);
      }
    });

    document.getElementById('ctx-files-app')?.addEventListener('click', () => {
      ctxMenu?.classList.add('hidden');
      this.launchApp('files');
      if (activeCtxTarget) {
        this.notifyIsland(`📁 Revealed ${activeCtxTarget} in Files`);
      }
    });

    document.getElementById('ctx-wallpaper')?.addEventListener('click', () => {
      ctxMenu?.classList.add('hidden');
      const wallpapers = ['cupertino', 'redmond', 'aurora', 'cyber'];
      const nextIdx = (wallpapers.indexOf(this.activeWallpaper) + 1) % wallpapers.length;
      this.setWallpaper(wallpapers[nextIdx]);
      this.notifyIsland(`🖼️ Switched wallpaper to ${wallpapers[nextIdx]}`);
      polyAudio.playSuccess();
    });

    document.getElementById('ctx-clean-icons')?.addEventListener('click', () => {
      ctxMenu?.classList.add('hidden');
      const filesContainer = document.getElementById('desktop-files');
      if (filesContainer) {
        filesContainer.style.transform = 'scale(0.96)';
        setTimeout(() => {
          filesContainer.style.transform = 'scale(1)';
        }, 150);
      }
      this.notifyIsland(`🧹 Desktop icons aligned to grid`);
      polyAudio.playSuccess();
    });

    document.getElementById('ctx-trash')?.addEventListener('click', () => {
      ctxMenu?.classList.add('hidden');
      if (activeCtxTarget) {
        const fileEl = document.querySelector(`.desktop-file[data-file="${activeCtxTarget}"]`);
        if (fileEl) {
          fileEl.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
          fileEl.style.transform = 'scale(0) translateY(40px)';
          fileEl.style.opacity = '0';
          setTimeout(() => fileEl.remove(), 300);
          this.notifyIsland(`🗑️ Moved ${activeCtxTarget} to Trash`);
          polyAudio.playSuccess();
        }
      }
    });

    // Keyboard navigation on desktop (Space = Quick Look, Enter = Open)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const selected = document.querySelector('.desktop-file.selected');
      if (!selected) return;

      if (e.code === 'Space') {
        e.preventDefault();
        const qlModal = document.getElementById('quicklook-modal');
        if (qlModal && !qlModal.classList.contains('hidden')) {
          qlModal.classList.add('hidden');
        } else {
          this.openQuickLook(selected.dataset.file);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.openQuickLook(selected.dataset.file);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        selected.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        selected.style.transform = 'scale(0) translateY(40px)';
        selected.style.opacity = '0';
        setTimeout(() => selected.remove(), 300);
        this.notifyIsland(`🗑️ Deleted ${selected.dataset.file}`);
        polyAudio.playSuccess();
      }
    });

    window.addEventListener('click', (e) => {
      if (!e.target.closest('.desktop-file')) {
        document.querySelectorAll('.desktop-file').forEach(f => f.classList.remove('selected'));
      }
      if (ctxMenu && !e.target.closest('#desktop-context-menu')) {
        ctxMenu.classList.add('hidden');
      }
    });

    this.attachDropZones();
  }

  initSystemMenu() {
    const logoBtn = document.getElementById('poly-logo-btn');
    const sysMenu = document.getElementById('poly-system-menu');
    if (!logoBtn || !sysMenu) return;

    logoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sysMenu.classList.toggle('hidden');
      polyAudio.playClick();
    });

    window.addEventListener('click', (e) => {
      if (!e.target.closest('#poly-system-menu') && !e.target.closest('#poly-logo-btn')) {
        sysMenu.classList.add('hidden');
      }
    });

    document.getElementById('sys-about')?.addEventListener('click', () => {
      sysMenu.classList.add('hidden');
      this.launchApp('telemetry');
      this.notifyIsland(`⚡ Poly OS 1.0 (Compositor Kernel v4.19)`);
    });

    document.getElementById('sys-settings')?.addEventListener('click', () => {
      sysMenu.classList.add('hidden');
      this.launchApp('settings');
    });

    document.getElementById('sys-appstore')?.addEventListener('click', () => {
      sysMenu.classList.add('hidden');
      this.launchApp('store');
    });

    document.getElementById('sys-activity')?.addEventListener('click', () => {
      sysMenu.classList.add('hidden');
      this.launchApp('telemetry');
    });

    document.getElementById('sys-sleep')?.addEventListener('click', () => {
      sysMenu.classList.add('hidden');
      const desktop = document.getElementById('desktop');
      if (desktop) {
        desktop.style.transition = 'filter 0.5s ease, opacity 0.5s ease';
        desktop.style.filter = 'brightness(0.15) contrast(1.2)';
        this.notifyIsland('🌙 Sleep Mode • Click anywhere to wake');
        const wakeUp = () => {
          desktop.style.filter = '';
          polyAudio.playSuccess();
          window.removeEventListener('click', wakeUp);
        };
        setTimeout(() => window.addEventListener('click', wakeUp), 200);
      }
    });

    document.getElementById('sys-restart')?.addEventListener('click', () => {
      sysMenu.classList.add('hidden');
      this.notifyIsland('🔄 Restarting Poly Engine Compositor...');
      polyAudio.playPop();
      setTimeout(() => {
        window.location.reload();
      }, 700);
    });

    document.getElementById('sys-reset')?.addEventListener('click', () => {
      sysMenu.classList.add('hidden');
      this.windows.forEach((win, i) => {
        win.pos = { x: 80 + i * 40, y: 80 + i * 35 };
        win.size = { width: 720, height: 480 };
        win.targetPos = { ...win.pos };
        win.targetSize = { ...win.size };
        win.isMaximized = false;
        win.el.classList.remove('maximized');
      });
      this.notifyIsland('🧹 Restored clean cascade window layout');
      polyAudio.playSuccess();
    });
  }

  initSmartWidget() {
    const widget = document.getElementById('desktop-smart-widget');
    if (widget) {
      widget.addEventListener('click', () => {
        this.launchApp('telemetry');
        polyAudio.playClick();
      });
      widget.style.cursor = 'pointer';
      widget.title = 'Click to open Process Monitor';
    }

    this.syncSystemMetrics();
  }

  syncSystemMetrics() {
    const { cpu, ramUsage, maxRam, refreshRate, temperature, thermalState } = this.systemMetrics;

    // 1. Performance Monitor Floating Widget
    const cpuFill = document.getElementById('widget-cpu-fill');
    const cpuVal = document.getElementById('widget-cpu-val');
    if (cpuFill) cpuFill.style.width = `${cpu}%`;
    if (cpuVal) cpuVal.textContent = `${cpu}%`;

    const ramFill = document.getElementById('widget-ram-fill');
    const ramVal = document.getElementById('widget-ram-val');
    const ramSub = document.getElementById('widget-ram-sub');
    if (ramFill) ramFill.style.width = `${Math.min(100, Math.round((ramUsage / maxRam) * 100))}%`;
    if (ramVal) ramVal.textContent = `${ramUsage} MB`;
    if (ramSub) ramSub.textContent = `${maxRam} MB ZRAM Pool`;

    const hzVal = document.getElementById('widget-hz-val');
    const hzFill = document.getElementById('widget-hz-fill');
    const hzBadge = document.getElementById('widget-hz-badge');
    if (hzVal) hzVal.textContent = `${refreshRate} Hz`;
    if (hzFill) hzFill.style.width = refreshRate === 120 ? '100%' : '50%';
    if (hzBadge) hzBadge.textContent = `${refreshRate} Hz ${this.powerMode === 'turbo' ? 'Turbo' : 'Active'}`;

    const tempVal = document.getElementById('widget-temp-val');
    const tempFill = document.getElementById('widget-temp-fill');
    const tempStatus = document.getElementById('widget-temp-status');
    if (tempVal) tempVal.textContent = `${temperature}°C`;
    if (tempFill) tempFill.style.width = `${Math.min(100, temperature)}%`;
    if (tempStatus) tempStatus.textContent = `Thermal State: ${thermalState}`;

    // 2. Control Center Telemetry Snapshot
    const ccRam = document.getElementById('cc-ram-val');
    const ccCpu = document.getElementById('cc-cpu-val');
    const ccHz = document.getElementById('cc-hz-val');
    if (ccRam) ccRam.textContent = `${ramUsage} MB`;
    if (ccCpu) ccCpu.textContent = `${cpu}%`;
    if (ccHz) ccHz.textContent = `${refreshRate} Hz`;

    // 3. Battery / Power Pill in Top Bar
    const batteryBtn = document.getElementById('battery-btn');
    if (batteryBtn) {
      batteryBtn.title = `Power: 98% (Power Adapter Connected • ${refreshRate}Hz • ${this.powerMode.toUpperCase()})`;
    }
  }

  initQuickLook() {
    const modal = document.getElementById('quicklook-modal');
    const closeBtn = document.getElementById('ql-close');
    const openAppBtn = document.getElementById('ql-open-app');
    if (!modal) return;

    closeBtn?.addEventListener('click', () => {
      modal.classList.add('hidden');
      polyAudio.playClick();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        polyAudio.playClick();
      }
    });

    openAppBtn?.addEventListener('click', () => {
      modal.classList.add('hidden');
      const curFile = modal.dataset.currentFile || '';
      if (curFile.endsWith('.rs')) {
        this.launchApp('terminal');
      } else {
        this.launchApp('files');
      }
      this.notifyIsland(`🚀 Opened ${curFile} in application`);
    });
  }

  openQuickLook(fileName) {
    const modal = document.getElementById('quicklook-modal');
    if (!modal) return;

    modal.dataset.currentFile = fileName;
    const nameEl = document.getElementById('ql-name');
    const metaEl = document.getElementById('ql-meta');
    const iconEl = document.getElementById('ql-icon');
    const bodyEl = document.getElementById('ql-body');

    polyAudio.playPop();

    if (fileName === 'Poly_Whitepaper.pdf') {
      nameEl.textContent = 'Poly_Whitepaper.pdf';
      metaEl.textContent = 'PDF Document • 4.2 MB • Updated Today';
      iconEl.textContent = '📄';
      bodyEl.innerHTML = `
        <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:20px; font-family:'SF Pro Display',sans-serif; color:#e4e4e7;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">
            <div>
              <h2 style="margin:0; font-size:18px; color:#fff;">Poly OS: A Hybrid Reactive OS Architecture</h2>
              <span style="font-size:11px; color:#a1a1aa;">Rahul & DeepMind Agentic Systems • October 2026</span>
            </div>
            <span style="background:rgba(10,132,255,0.2); border:1px solid rgba(10,132,255,0.4); color:#64d2ff; padding:3px 8px; border-radius:8px; font-size:10px; font-weight:600;">PAGE 1 OF 18</span>
          </div>
          <p style="font-size:12.5px; line-height:1.6; color:#d4d4d8; margin-bottom:14px;">
            <b>Abstract:</b> Poly OS synthesizes the physics-driven tactile responsiveness of mobile interfaces (iOS 120Hz mass-spring-damper kinetics, zero-delay gesture interruption) with the industrial multi-tasking and magnetic window ergonomics of desktop platforms (Windows Magnetic Snap, DirectStorage VFS).
          </p>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:16px;">
            <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); padding:12px; border-radius:10px;">
              <div style="font-size:11px; font-weight:600; color:#30d158; margin-bottom:4px;">⚡ Composite Latency Benchmark</div>
              <div style="font-size:20px; font-weight:700; color:#fff;">8.33 ms <span style="font-size:11px; color:#a1a1aa;">(Pure 120 Hz)</span></div>
              <div style="font-size:11px; color:#a1a1aa; margin-top:4px;">Zero visual tearing under multi-window loads.</div>
            </div>
            <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); padding:12px; border-radius:10px;">
              <div style="font-size:11px; font-weight:600; color:#0a84ff; margin-bottom:4px;">📉 Idle RAM Consumption</div>
              <div style="font-size:20px; font-weight:700; color:#fff;">218 MB <span style="font-size:11px; color:#a1a1aa;">vs 2.4 GB Win11</span></div>
              <div style="font-size:11px; color:#a1a1aa; margin-top:4px;">Intelligent background process freezing.</div>
            </div>
          </div>
        </div>
      `;
    } else if (fileName === '120Hz_Demo.mp4') {
      nameEl.textContent = '120Hz_Demo.mp4';
      metaEl.textContent = 'HEVC 4K60 / 120Hz Simulation • 18.5 MB';
      iconEl.textContent = '🎬';
      bodyEl.innerHTML = `
        <div style="background:#0a0a0f; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:18px; display:flex; flex-direction:column; align-items:center; gap:12px;">
          <div style="position:relative; width:100%; height:180px; background:radial-gradient(circle at center, rgba(10,132,255,0.15) 0%, #000 100%); border-radius:10px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
            <div id="ql-spring-ball" style="width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg, #0a84ff, #bf5af2); box-shadow:0 0 24px rgba(10,132,255,0.6); animation:demoSpring 1.4s infinite cubic-bezier(0.16,1,0.3,1); display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff; font-size:12px;">120Hz</div>
          </div>
          <div style="width:100%; display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#a1a1aa;">
            <span>Physics: Mass-Spring-Damper (k=380, c=32)</span>
            <span style="color:#30d158; font-weight:600;">● Active 120 FPS V-Sync</span>
          </div>
        </div>
      `;
    } else if (fileName === 'Cupertino_5K.heic') {
      nameEl.textContent = 'Cupertino_5K.heic';
      metaEl.textContent = 'High Dynamic Range 5K Wallpaper • 8.1 MB';
      iconEl.textContent = '🖼️';
      bodyEl.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; align-items:center;">
          <div style="width:100%; height:220px; border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.15); background:radial-gradient(circle at 20% 20%, #1a1a2e 0%, #0c0c14 100%), radial-gradient(at 0% 0%, rgba(10, 132, 255, 0.4) 0px, transparent 60%); display:flex; align-items:center; justify-content:center; position:relative;">
            <span style="font-size:13px; font-weight:600; color:#fff; background:rgba(0,0,0,0.5); backdrop-filter:blur(8px); padding:6px 14px; border-radius:20px; border:1px solid rgba(255,255,255,0.2);">Cupertino Dynamic 5K Preview</span>
          </div>
          <button id="ql-set-wallpaper-btn" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:6px 16px; border-radius:10px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s ease;">
            🖼️ Apply as Desktop Wallpaper
          </button>
        </div>
      `;
      setTimeout(() => {
        document.getElementById('ql-set-wallpaper-btn')?.addEventListener('click', () => {
          this.setWallpaper('cupertino');
          this.notifyIsland('🖼️ Set Cupertino 5K as Active Wallpaper');
          polyAudio.playSuccess();
        });
      }, 50);
    } else if (fileName === 'daemon.rs') {
      nameEl.textContent = 'daemon.rs';
      metaEl.textContent = 'Rust Kernel Service • 24 KB • UTF-8';
      iconEl.textContent = '🦀';
      bodyEl.innerHTML = `
        <pre style="background:#0d0d12; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:16px; font-family:'JetBrains Mono',monospace; font-size:11.5px; color:#64d2ff; line-height:1.55; overflow-x:auto; margin:0;">
<span style="color:#bf5af2;">use</span> poly_core::compositor::{SurfaceManager, VSync120Hz};
<span style="color:#bf5af2;">use</span> std::sync::atomic::{AtomicBool, Ordering};

<span style="color:#30d158;">/// Hybrid Compositor loop executing at target 120 FPS</span>
<span style="color:#ff9f0a;">#[tokio::main]</span>
<span style="color:#0a84ff;">pub async fn</span> <span style="color:#ffd60a;">run_poly_daemon</span>() -> Result&lt;(), PolyError&gt; {
    <span style="color:#bf5af2;">let</span> vsync = VSync120Hz::bind_primary_display()?;
    <span style="color:#bf5af2;">let</span> mut surface = SurfaceManager::new_low_latency();

    <span style="color:#a1a1aa;">// Zero-delay frame presentation</span>
    <span style="color:#bf5af2;">while</span> RUNNING.load(Ordering::Relaxed) {
        vsync.wait_for_vblank().<span style="color:#0a84ff;">await</span>;
        surface.composite_spring_layers();
        surface.swap_buffers_direct();
    }
    Ok(())
}
        </pre>
      `;
    } else {
      nameEl.textContent = fileName;
      metaEl.textContent = 'Folder Container • 12 Items';
      iconEl.textContent = '📁';
      bodyEl.innerHTML = `
        <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:8px;">
          <div style="font-size:13px; font-weight:600; color:#fff;">Project Files in ${fileName}:</div>
          <div style="font-size:12px; color:#a1a1aa;">• Cargo.toml (Poly Core Manifest)</div>
          <div style="font-size:12px; color:#a1a1aa;">• src/main.rs (Compositor Entrypoint)</div>
          <div style="font-size:12px; color:#a1a1aa;">• assets/wallpapers/cupertino.heic</div>
          <div style="font-size:12px; color:#a1a1aa;">• tests/120hz_physics_test.rs</div>
        </div>
      `;
    }

    modal.classList.remove('hidden');
  }

  attachDropZones() {
    const attachToFilesApp = () => {
      const filesGrid = document.getElementById('files-items-grid');
      if (filesGrid && !filesGrid.dataset.dropReady) {
        filesGrid.dataset.dropReady = 'true';
        filesGrid.addEventListener('dragover', (e) => {
          e.preventDefault();
          filesGrid.classList.add('file-drop-zone-active');
        });
        filesGrid.addEventListener('dragleave', () => {
          filesGrid.classList.remove('file-drop-zone-active');
        });
        filesGrid.addEventListener('drop', (e) => {
          e.preventDefault();
          filesGrid.classList.remove('file-drop-zone-active');
          const fileName = e.dataTransfer.getData('text/plain');
          if (!fileName) return;

          const card = document.createElement('div');
          card.className = 'file-card';
          card.dataset.name = fileName;
          card.dataset.type = 'imported';
          card.dataset.tag = 'personal';
          card.innerHTML = `
            <div class="file-tag-dot tag-personal"></div>
            <div class="file-icon">📄</div>
            <div class="file-name">${fileName}</div>
            <div class="file-meta">Imported • Just now</div>
          `;
          filesGrid.prepend(card);
          polyAudio.playSuccess();
          this.notifyIsland(`📥 Dropped ${fileName} into Projects!`);
        });
      }
    };
    attachToFilesApp();
    setInterval(attachToFilesApp, 1000);
  }

  initDynamicIslandExpansion() {
    const island = document.getElementById('dynamic-island');
    if (!island) return;

    island.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDynamicIslandExpansion();
    });

    window.addEventListener('click', (e) => {
      if (!e.target.closest('#dynamic-island')) {
        this.collapseDynamicIsland();
      }
    });
  }

  toggleDynamicIslandExpansion() {
    const island = document.getElementById('dynamic-island');
    if (!island) return;
    if (island.classList.contains('island-expanded')) {
      this.collapseDynamicIsland();
    } else {
      this.expandDynamicIsland();
    }
  }

  expandDynamicIsland() {
    const island = document.getElementById('dynamic-island');
    if (!island) return;
    island.classList.add('island-expanded');
    polyAudio.playSpring();

    const activeCount = Array.from(this.windows.values()).filter(w => !w.isFrozen && !w.isMinimized).length;
    const frozenCount = Array.from(this.windows.values()).filter(w => w.isFrozen).length;

    island.innerHTML = `
      <div class="island-expanded-header">
        <div style="font-size:20px;">⚡</div>
        <div class="island-expanded-content">
          <span class="island-expanded-title">Poly System Intelligence</span>
          <span class="island-expanded-sub">120Hz Decoupled • ${activeCount} Active / ${frozenCount} Frozen Tasks</span>
        </div>
      </div>
      <div style="background:rgba(255,255,255,0.06); border-radius:10px; padding:8px 12px; font-size:11px; display:flex; justify-content:space-between; align-items:center;">
        <span>🎵 Now Playing: <b>Solar Wind (120Hz Mix)</b></span>
        <button id="island-quick-play-btn" style="background:#ff2d55; border:none; color:#fff; padding:3px 10px; border-radius:6px; cursor:pointer; font-weight:600;">Pause</button>
      </div>
      <div class="island-actions-row">
        <button class="island-action-btn btn-primary" id="island-freeze-btn">⚡ Free Background RAM</button>
        <button class="island-action-btn" id="island-spotlight-btn">🔍 Search</button>
        <button class="island-action-btn" id="island-collapse-btn" style="margin-left:auto;">✕</button>
      </div>
    `;

    setTimeout(() => {
      document.getElementById('island-freeze-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.windows.forEach(w => {
          if (w.id !== this.activeWindowId && !w.title.includes('Music')) {
            w.isFrozen = true;
            w.element.classList.add('frozen');
          }
        });
        polyAudio.playSuccess();
        this.collapseDynamicIsland('⚡ Background tasks frozen into ZRAM');
      });

      document.getElementById('island-spotlight-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.collapseDynamicIsland();
        this.openSpotlight();
      });

      document.getElementById('island-quick-play-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        polyAudio.playClick();
        const btn = document.getElementById('island-quick-play-btn');
        if (btn) btn.textContent = btn.textContent === 'Pause' ? 'Play' : 'Pause';
      });

      document.getElementById('island-collapse-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.collapseDynamicIsland();
      });
    }, 20);
  }

  collapseDynamicIsland(restoreText) {
    const island = document.getElementById('dynamic-island');
    if (!island || !island.classList.contains('island-expanded')) return;
    island.classList.remove('island-expanded');
    island.innerHTML = `
      <div class="island-icon" id="island-icon">🎵</div>
      <span class="island-text" id="island-text">${restoreText || 'Poly OS • Smooth 120Hz Engine Active'}</span>
    `;
    polyAudio.playClick();
  }

  initDockControls() {
    // 1. Quick Mode Switcher button (Floating <-> Taskbar)
    const modeBtn = document.getElementById('dock-mode-toggle');
    if (modeBtn) {
      modeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDockMode();
      });
    }

    // 2. Quick Position Switcher button (Bottom -> Left -> Right)
    const posBtn = document.getElementById('dock-pos-toggle');
    if (posBtn) {
      posBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.cycleDockPosition();
      });
    }

    // 3. Settings flyout popup toggle
    const settingsBtn = document.getElementById('dock-settings-btn');
    const popup = document.getElementById('dock-settings-popup');
    if (settingsBtn && popup) {
      settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.classList.toggle('hidden');
      });
    }

    const closeBtn = document.getElementById('close-dock-settings');
    if (closeBtn && popup) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.classList.add('hidden');
      });
    }

    // 4. Right-click context menu on dock surface
    const dockEl = document.getElementById('dock');
    if (dockEl && popup) {
      dockEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        popup.classList.remove('hidden');
        if (this.dockPos === 'bottom') {
          popup.style.bottom = '84px';
          popup.style.left = `${Math.min(Math.max(e.clientX - 160, 20), window.innerWidth - 340)}px`;
          popup.style.right = 'auto';
          popup.style.top = 'auto';
        } else if (this.dockPos === 'left') {
          popup.style.left = '84px';
          popup.style.top = `${Math.min(Math.max(e.clientY - 100, 50), window.innerHeight - 250)}px`;
          popup.style.bottom = 'auto';
          popup.style.right = 'auto';
        } else if (this.dockPos === 'right') {
          popup.style.right = '84px';
          popup.style.top = `${Math.min(Math.max(e.clientY - 100, 50), window.innerHeight - 250)}px`;
          popup.style.bottom = 'auto';
          popup.style.left = 'auto';
        }
      });
    }

    // 5. Segmented control handlers inside settings popup
    document.querySelectorAll('#pref-style .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setDockMode(btn.dataset.style);
      });
    });

    document.querySelectorAll('#pref-pos .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setDockPosition(btn.dataset.pos);
      });
    });

    document.querySelectorAll('#pref-align .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setDockAlignment(btn.dataset.align);
      });
    });

    // Close popup on outside click
    window.addEventListener('click', (e) => {
      if (popup && !e.target.closest('#dock-settings-popup') && !e.target.closest('#dock-settings-btn')) {
        popup.classList.add('hidden');
      }
    });

    // 6. Initialize mouse wheel and overflow arrow scrolling
    this.initDockScrolling();
  }

  initDockScrolling() {
    const dockMiddle = document.getElementById('dock-middle-scroll');
    const dock = document.getElementById('dock');
    if (!dockMiddle) return;

    if (dock) {
      dock.addEventListener('wheel', (e) => {
        const isVertical = (this.dockPos === 'left' || this.dockPos === 'right');
        if (isVertical) {
          if (dockMiddle.scrollHeight > dockMiddle.clientHeight) {
            e.preventDefault();
            dockMiddle.scrollTop += e.deltaY;
          }
        } else {
          if (dockMiddle.scrollWidth > dockMiddle.clientWidth) {
            e.preventDefault();
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            dockMiddle.scrollLeft += delta;
          }
        }
      }, { passive: false });
    }

    window.addEventListener('resize', () => {
      this.updateDockAutoScaling();
    });

    this.updateDockAutoScaling();
  }

  setDockMode(mode) {
    this.dockMode = mode;
    const dock = document.getElementById('dock');
    const container = document.getElementById('dock-container');
    if (dock) {
      if (mode === 'taskbar') {
        dock.classList.remove('mode-floating');
        dock.classList.add('mode-taskbar');
        if (container) container.classList.add('has-taskbar');
        const icon = document.getElementById('dock-mode-icon');
        if (icon) icon.textContent = '📱';
        const tooltip = document.getElementById('dock-mode-tooltip');
        if (tooltip) tooltip.textContent = 'Switch to Pill Dock';
      } else {
        dock.classList.remove('mode-taskbar');
        dock.classList.add('mode-floating');
        if (container) container.classList.remove('has-taskbar');
        const icon = document.getElementById('dock-mode-icon');
        if (icon) icon.textContent = '↔️';
        const tooltip = document.getElementById('dock-mode-tooltip');
        if (tooltip) tooltip.textContent = 'Switch to Full Taskbar';
      }
    }

    document.querySelectorAll('#pref-style .seg-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.style === mode);
    });

    this.renderTaskbarWindowStrip();
    this.updateDockAutoScaling();
  }

  toggleDockMode() {
    this.setDockMode(this.dockMode === 'floating' ? 'taskbar' : 'floating');
  }

  setDockPosition(pos) {
    this.dockPos = pos;
    const container = document.getElementById('dock-container');
    const desktop = document.getElementById('desktop');
    if (container) {
      container.classList.remove('pos-bottom', 'pos-left', 'pos-right');
      container.classList.add(`pos-${pos}`);
    }
    if (desktop) {
      desktop.classList.remove('dock-pos-bottom', 'dock-pos-left', 'dock-pos-right');
      desktop.classList.add(`dock-pos-${pos}`);
    }

    const posIcons = { bottom: '⬇️', left: '⬅️', right: '➡️' };
    const posTitles = { bottom: 'Bottom Bar', left: 'Left Side Dock', right: 'Right Side Dock' };
    const iconEl = document.getElementById('dock-pos-icon');
    if (iconEl) iconEl.textContent = posIcons[pos] || '📍';
    const tooltipEl = document.getElementById('dock-pos-tooltip');
    if (tooltipEl) tooltipEl.textContent = `Position: ${posTitles[pos]}`;

    document.querySelectorAll('#pref-pos .seg-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.pos === pos);
    });

    this.notifyIsland(`📍 Dock Position: ${posTitles[pos]}`);
    this.updateDockAutoScaling();
  }

  cycleDockPosition() {
    const order = ['bottom', 'left', 'right'];
    const nextIdx = (order.indexOf(this.dockPos) + 1) % order.length;
    this.setDockPosition(order[nextIdx]);
  }

  setDockAlignment(align) {
    this.dockAlign = align;
    const container = document.getElementById('dock-container');
    if (container) {
      container.classList.remove('align-center', 'align-start');
      container.classList.add(`align-${align}`);
    }

    document.querySelectorAll('#pref-align .seg-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.align === align);
    });

    this.notifyIsland(`📐 Dock Alignment: ${align === 'center' ? 'Centered' : 'Left / Top'}`);
    this.updateDockAutoScaling();
  }

  getAppKeyForWindow(w) {
    const titleLower = (w.title || '').toLowerCase();
    const appKeys = ['files', 'browser', 'terminal', 'code', 'notes', 'music', 'telemetry', 'store', 'settings'];
    for (const key of appKeys) {
      if (titleLower.includes(key) || (key === 'telemetry' && titleLower.includes('process'))) {
        return key;
      }
    }
    return null;
  }

  isPinnedApp(w) {
    return !!this.getAppKeyForWindow(w);
  }

  updateDockAutoScaling() {
    const dock = document.getElementById('dock');
    if (!dock) return;

    const pinnedItems = document.querySelectorAll('#dock-pinned-apps .dock-item');
    const stripItems = document.querySelectorAll('#dock-windows-strip .dock-item');
    const totalItems = pinnedItems.length + stripItems.length;

    const isVertical = (this.dockPos === 'left' || this.dockPos === 'right');
    if (isVertical) {
      const availH = window.innerHeight - 140;
      const normalNeeded = totalItems * 52;
      if (normalNeeded > availH) {
        const size = Math.max(20, Math.min(42, Math.floor((availH / Math.max(1, totalItems)) - 6)));
        const gap = Math.max(2, Math.min(6, Math.floor(size * 0.12)));
        dock.style.setProperty('--dock-icon-size', `${size}px`);
        dock.style.setProperty('--dock-gap', `${gap}px`);
      } else {
        dock.style.removeProperty('--dock-icon-size');
        dock.style.removeProperty('--dock-gap');
      }
      return;
    }

    // Horizontal calculation: total available space for items between Start button and Tray
    const screenW = window.innerWidth;
    const availForItems = Math.max(180, (this.dockMode === 'taskbar' ? screenW - 280 : screenW - 320));
    const normalNeeded = totalItems * 50;

    if (normalNeeded > availForItems) {
      const itemSpan = availForItems / Math.max(1, totalItems);
      const iconSize = Math.max(18, Math.min(42, Math.floor(itemSpan - 4)));
      const gap = Math.max(2, Math.min(6, Math.floor(iconSize * 0.12)));
      dock.style.setProperty('--dock-icon-size', `${iconSize}px`);
      dock.style.setProperty('--dock-gap', `${gap}px`);
    } else {
      dock.style.removeProperty('--dock-icon-size');
      dock.style.removeProperty('--dock-gap');
    }
  }

  renderTaskbarWindowStrip() {
    const strip = document.getElementById('dock-windows-strip');
    const divider = document.getElementById('dock-windows-divider');
    if (!strip) return;
    strip.innerHTML = '';

    // Count open windows per pinned app
    const pinnedCounts = new Map();
    const unpinnedWindows = [];

    this.windows.forEach(w => {
      const appKey = this.getAppKeyForWindow(w);
      if (appKey) {
        pinnedCounts.set(appKey, (pinnedCounts.get(appKey) || 0) + 1);
      } else {
        unpinnedWindows.push(w);
      }
    });

    // Update pinned apps: running indicator, active highlight, and count badge
    document.querySelectorAll('#dock-pinned-apps .dock-item').forEach(btn => {
      const app = btn.dataset.app;
      const count = pinnedCounts.get(app) || 0;
      btn.classList.toggle('running', count > 0);

      const activeWin = this.windows.get(this.activeWindowId);
      const isFocused = activeWin && this.getAppKeyForWindow(activeWin) === app && !activeWin.isMinimized;
      btn.classList.toggle('active', !!isFocused);

      let badge = btn.querySelector('.dock-count-badge');
      if (count > 1) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'dock-count-badge';
          btn.appendChild(badge);
        }
        badge.textContent = count;
      } else if (badge) {
        badge.remove();
      }
    });

    if (divider) {
      divider.style.display = unpinnedWindows.length > 0 ? 'block' : 'none';
    }

    unpinnedWindows.forEach(w => {
      const isActive = (w.id === this.activeWindowId && !w.isMinimized);
      const isMinimized = w.isMinimized;
      const item = document.createElement('button');
      item.className = `dock-item window-dock-item ${isActive ? 'active' : ''} ${isMinimized ? 'minimized' : ''} running`;
      item.dataset.windowId = w.id;
      item.title = `${w.title} (${w.isFrozen ? 'Frozen' : 'Active'})`;
      item.innerHTML = `
        <div class="dock-icon">
          <span>${w.icon}</span>
          <span class="dock-item-close-badge" title="Close window">&times;</span>
        </div>
        <span class="dot-indicator"></span>
        <span class="dock-item-tooltip">${w.title}</span>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.closest('.dock-item-close-badge')) {
          e.stopPropagation();
          polyAudio.playClick();
          this.closeWindow(w.id);
          return;
        }
        if (this.activeWindowId === w.id && !w.isMinimized) {
          this.minimizeWindow(w.id);
        } else {
          if (w.isMinimized) {
            w.isMinimized = false;
            w.springScale.setTarget(1.0);
            w.springOpacity.setTarget(1.0);
            polyAudio.playSpring();
          } else {
            polyAudio.playClick();
          }
          this.focusWindow(w.id);
        }
      });

      strip.appendChild(item);
    });

    this.updateDockAutoScaling();
  }

  notifyIsland(text) {
    const island = document.getElementById('dynamic-island');
    if (!island) return;
    if (island.classList.contains('island-expanded')) {
      const sub = island.querySelector('.island-expanded-sub');
      if (sub) sub.textContent = text;
      return;
    }
    const label = document.getElementById('island-text');
    if (label) label.textContent = text;
    island.style.transform = 'scale(1.08)';
    setTimeout(() => { if (island) island.style.transform = 'scale(1)'; }, 250);
  }

  launchApp(appName) {
    switch(appName) {
      case 'browser':
        this.createWindow('Poly Browser', '🌐', 120, 80, 850, 520, `
          <div style="display:flex; flex-direction:column; height:100%; gap:10px;">
            <div style="display:flex; gap:8px; background:rgba(255,255,255,0.06); padding:6px 12px; border-radius:10px; align-items:center;">
              <span style="opacity:0.6;">🔒 https://</span>
              <input type="text" value="poly-os.org/explore" style="flex:1; background:none; border:none; color:#fff; font-family:inherit; outline:none;" readonly>
              <span style="font-size:11px; background:#0a84ff; padding:2px 8px; border-radius:6px;">120 FPS</span>
            </div>
            <div style="flex:1; background:rgba(0,0,0,0.3); border-radius:10px; padding:20px; font-family:system-ui;">
              <h2 style="font-weight:700; margin-bottom:8px;">Welcome to Poly OS</h2>
              <p style="color:#aaa; margin-bottom:16px;">The ultra-lightweight hybrid operating system marrying iOS fluidity and Windows multi-window productivity.</p>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:8px;">
                  <h4 style="color:#64d2ff; margin-bottom:4px;">🪟 Windows Power</h4>
                  <p style="font-size:12px; color:#ddd;">Drag this window to the top, left, right, or corners to test Magnetic Aero Snap!</p>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:8px;">
                  <h4 style="color:#30d158; margin-bottom:4px;">📱 iOS Fluidity</h4>
                  <p style="font-size:12px; color:#ddd;">Flick windows to watch real spring momentum physics. Inactive apps freeze automatically to save battery.</p>
                </div>
              </div>
            </div>
          </div>
        `);
        break;

      case 'terminal':
        this.createWindow('Terminal & Shell', '⌨️', 200, 140, 720, 440, `
          <div class="term-root" id="term-app-root">
            <div class="term-banner">Poly UNIX Shell v1.2 (PREEMPT_DYNAMIC musl-libc • 120Hz Compositor)</div>
            <div class="term-line term-gray">Type <span class="term-green">'help'</span> for available commands, <span class="term-cyan">'neofetch'</span> for specs, or <span class="term-purple">'matrix'</span> for digital rain.</div>
            <div class="term-output" id="term-output-stream"></div>
            <div class="term-input-row" id="term-input-row">
              <span class="term-prompt">poly@workstation:~$</span>
              <input type="text" id="term-cli-input" class="term-input" autocomplete="off" spellcheck="false" autofocus>
            </div>
          </div>
        `);

        setTimeout(() => {
          const root = document.getElementById('term-app-root');
          if (!root) return;
          const stream = root.querySelector('#term-output-stream');
          const input = root.querySelector('#term-cli-input');
          if (!input || !stream) return;

          root.addEventListener('click', () => input.focus());

          const history = [];
          let historyIdx = -1;

          input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              if (history.length > 0 && historyIdx > 0) {
                historyIdx--;
                input.value = history[historyIdx];
              }
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              if (historyIdx < history.length - 1) {
                historyIdx++;
                input.value = history[historyIdx];
              } else {
                historyIdx = history.length;
                input.value = '';
              }
            } else if (e.key === 'Enter') {
              const rawCmd = input.value;
              const cmd = rawCmd.trim();
              input.value = '';
              if (!cmd) return;

              history.push(cmd);
              historyIdx = history.length;

              const linePrompt = document.createElement('div');
              linePrompt.className = 'term-line';
              linePrompt.innerHTML = `<span class="term-prompt">poly@workstation:~$</span> ${cmd}`;
              stream.appendChild(linePrompt);

              const parts = cmd.split(' ');
              const mainCmd = parts[0].toLowerCase();
              const arg = parts.slice(1).join(' ');

              const appendOut = (html) => {
                const outLine = document.createElement('div');
                outLine.className = 'term-line';
                outLine.innerHTML = html;
                stream.appendChild(outLine);
              };

              switch (mainCmd) {
                case 'help':
                  appendOut(`
<span class="term-yellow">Poly UNIX Virtual Shell Commands:</span>
  <span class="term-green">neofetch</span>      - System summary & ASCII branding
  <span class="term-green">ps / top</span>      - Process status table with CPU & RAM
  <span class="term-green">kill &lt;pid&gt;</span>    - Close active window by PID
  <span class="term-green">ls</span>            - List directory contents
  <span class="term-green">cat &lt;file&gt;</span>    - Display file contents
  <span class="term-green">matrix</span>        - Green digital rain simulation
  <span class="term-green">clear</span>         - Clear terminal screen
  <span class="term-green">theme &lt;name&gt;</span>  - Switch live wallpaper (aurora, particles, cupertino)
  <span class="term-green">power &lt;mode&gt;</span>  - Set energy mode (low, balanced, turbo)
  <span class="term-green">date / uptime</span> - Timestamp and uptime metrics
  <span class="term-green">whoami</span>        - Current user identity
  <span class="term-green">echo &lt;text&gt;</span>   - Output text
                  `);
                  break;

                case 'neofetch':
                  appendOut(`
<pre style="color:#58a6ff; margin:0; line-height:1.25;">
        /\\        <span class="term-green">rahul@poly-workstation</span>
       /  \\       ----------------------
      /\\  /\\      <span class="term-cyan">OS:</span> Poly OS 1.0 (Hybrid iOS + Windows)
     /  \\/  \\     <span class="term-cyan">Kernel:</span> Linux 6.10-zen-preempt (x86_64)
    /   /\\   \\    <span class="term-cyan">Compositor:</span> Rust Smithay Decoupled 120Hz
   /   /  \\   \\   <span class="term-cyan">Shell:</span> poly-sh 1.2
  /___/____\\___\\  <span class="term-cyan">WM:</span> PolyWM (Aero Snap + Springs)
                  <span class="term-cyan">Theme:</span> Glassmorphic Dark
                  <span class="term-cyan">Memory:</span> 218 MB / 1024 MB ZRAM
                  <span class="term-cyan">Uptime:</span> 1 hr, 35 mins
</pre>
                  `);
                  break;

                case 'ps':
                case 'top':
                  let rows = '<div style="margin:4px 0;"><span class="term-cyan">PID   APP NAME               STATE       MEM(ZRAM)   CPU</span><br>';
                  for (const [id, w] of this.windows.entries()) {
                    const state = w.isFrozen ? '<span class="term-cyan">FROZEN</span>' : '<span class="term-green">ACTIVE</span>';
                    const mem = (w.memoryMb || 24).toString().padEnd(6);
                    const cpu = w.isFrozen ? '0%' : (w.cpuLoad || 1.8) + '%';
                    rows += `${id.toString().padEnd(6)}${w.title.slice(0,20).padEnd(23)}${state}      ${mem}      ${cpu}<br>`;
                  }
                  rows += '</div>';
                  appendOut(rows);
                  break;

                case 'kill':
                  if (!arg) {
                    appendOut('<span class="term-red">Error: missing PID. Usage: kill &lt;pid&gt;</span>');
                  } else {
                    const pid = parseInt(arg);
                    if (this.windows.has(pid)) {
                      const target = this.windows.get(pid);
                      this.closeWindow(pid);
                      appendOut(`<span class="term-green">[SIGTERM] Successfully killed PID ${pid} (${target.title})</span>`);
                    } else {
                      appendOut(`<span class="term-red">Error: process PID ${pid} not found</span>`);
                    }
                  }
                  break;

                case 'matrix':
                  appendOut('<span class="term-green">Initializing Matrix digital neural stream...</span>');
                  let count = 0;
                  const matrixTimer = setInterval(() => {
                    const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ';
                    let str = '';
                    for (let i = 0; i < 48; i++) {
                      str += chars[Math.floor(Math.random() * chars.length)];
                    }
                    appendOut(`<span style="color:#00ff66; opacity:${0.4 + Math.random()*0.6};">${str}</span>`);
                    root.scrollTop = root.scrollHeight;
                    count++;
                    if (count > 15) {
                      clearInterval(matrixTimer);
                      appendOut('<span class="term-cyan">[Stream complete. Terminal returned to shell.]</span>');
                      root.scrollTop = root.scrollHeight;
                    }
                  }, 80);
                  break;

                case 'ls':
                  appendOut(`
<span class="term-cyan">📁 poly-compositor/</span>  <span class="term-cyan">📁 poly-daemon/</span>  <span class="term-cyan">📁 poly-shell/</span>
<span class="term-yellow">🦀 physics.rs</span>        <span class="term-yellow">🐍 polyd.py</span>       <span class="term-green">⚙️ build-iso.sh</span>
<span class="term-gray">📄 SPECIFICATION.md</span>  <span class="term-gray">📄 Poly_Whitepaper.pdf</span>
                  `);
                  break;

                case 'cat':
                  if (arg.includes('physics')) {
                    appendOut('<span class="term-yellow">// Spring1D mass-spring-damper math\npub struct Spring1D { pub current: f32, pub target: f32, pub velocity: f32, pub stiffness: f32, pub damping: f32 }</span>');
                  } else if (arg.includes('polyd') || arg.includes('daemon')) {
                    appendOut('<span class="term-yellow"># cgroups v2 background process lifecycle manager\nFREEZE_PATH = "/sys/fs/cgroup/poly/cgroup.freeze"</span>');
                  } else if (arg.includes('SPEC') || arg.includes('spec')) {
                    appendOut('<span class="term-cyan"># Poly OS Architecture Specification: Decoupled 120Hz VSync Compositor + cgroups v2 Automated App Freezing</span>');
                  } else {
                    appendOut(`<span class="term-gray">[File ${arg || 'null'}]: Preview available via desktop Quick Look or Files app.</span>`);
                  }
                  break;

                case 'clear':
                  stream.innerHTML = '';
                  break;

                case 'theme':
                  if (arg) {
                    this.setWallpaper(arg);
                    appendOut(`<span class="term-green">Wallpaper theme updated to: ${arg}</span>`);
                  } else {
                    appendOut('<span class="term-yellow">Usage: theme &lt;aurora | particles | cupertino&gt;</span>');
                  }
                  break;

                case 'power':
                  if (['low', 'balanced', 'turbo'].includes(arg)) {
                    this.setPowerMode(arg);
                    appendOut(`<span class="term-green">Power mode set to ${arg.toUpperCase()}</span>`);
                  } else {
                    appendOut('<span class="term-yellow">Usage: power &lt;low | balanced | turbo&gt;</span>');
                  }
                  break;

                case 'date':
                  appendOut(`<span class="term-cyan">${new Date().toString()}</span>`);
                  break;

                case 'uptime':
                  appendOut('<span class="term-cyan">up 1 hr, 35 mins, 1 user, load average: 0.14, 0.12, 0.08</span>');
                  break;

                case 'whoami':
                  appendOut('<span class="term-green">rahul (UID: 1000, GID: 1000, poly-admin, sudo)</span>');
                  break;

                case 'echo':
                  appendOut(arg || '');
                  break;

                default:
                  appendOut(`<span class="term-red">poly-sh: command not found: ${mainCmd}. Type 'help' for command list.</span>`);
              }

              root.scrollTop = root.scrollHeight;
            }
          });
        }, 50);
        break;

      case 'notes':
        this.createWindow('Notes & Ideas', '📝', 280, 180, 580, 380, `
          <div style="display:flex; flex-direction:column; height:100%; gap:8px;">
            <input type="text" value="Poly OS Roadmap" style="font-size:16px; font-weight:700; background:none; border:none; color:#fff; outline:none;">
            <textarea style="flex:1; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; color:#eee; font-family:inherit; resize:none; outline:none;" placeholder="Write thoughts...">
✓ Fluid mass-spring-damper math implemented
✓ Aero Snap & corner quarter tiling active
✓ iOS-style dynamic dock and control center
✓ cgroups v2 automated background freezing
[ ] Native ARM64 & x86_64 bootable ISO build</textarea>
          </div>
        `);
        break;

      case 'music':
        this.createWindow('Poly Music', '🎵', 340, 220, 560, 360, `
          <div class="music-app-root" id="music-app-root">
            <div style="display:flex; align-items:center; gap:18px;">
              <div id="music-album-art" style="width:96px; height:96px; border-radius:18px; background:linear-gradient(135deg, #ff2d55, #bf5af2); display:flex; align-items:center; justify-content:center; font-size:42px; box-shadow:0 8px 24px rgba(255,45,85,0.45); transition:transform 0.3s ease;">
                🎧
              </div>
              <div style="flex:1;">
                <h3 id="music-player-title" style="font-size:17px; font-weight:700; margin-bottom:2px;">Solar Wind (120Hz Mix)</h3>
                <p id="music-player-artist" style="color:#aaa; font-size:12px; margin-bottom:10px;">Poly Audio Engine (PipeWire Realtime)</p>
                
                <div style="display:flex; gap:10px; align-items:center;">
                  <button id="music-prev-btn" style="background:rgba(255,255,255,0.1); border:none; color:#fff; padding:6px 14px; border-radius:8px; cursor:pointer;">⏮</button>
                  <button id="music-play-btn" style="background:#ff2d55; border:none; color:#fff; padding:8px 20px; border-radius:10px; cursor:pointer; font-weight:700;">▶ Play</button>
                  <button id="music-next-btn" style="background:rgba(255,255,255,0.1); border:none; color:#fff; padding:6px 14px; border-radius:8px; cursor:pointer;">⏭</button>
                  <span id="music-lease-badge" style="font-size:10px; color:#30d158; margin-left:auto; background:rgba(48,209,88,0.15); border:1px solid rgba(48,209,88,0.3); padding:3px 8px; border-radius:6px;">⚡ Audio Engine Ready</span>
                </div>
              </div>
            </div>

            <!-- Live 120Hz Canvas Spectrum Visualizer -->
            <div style="position:relative; flex:1; display:flex; flex-direction:column; gap:6px;">
              <div style="display:flex; justify-content:space-between; font-size:10px; color:#888;">
                <span>LIVE FREQUENCY SPECTRUM (PipeWire Low-Latency)</span>
                <span id="music-freq-hz">32 Bands • 120 FPS</span>
              </div>
              <canvas id="music-visualizer" class="music-visualizer-canvas" width="520" height="90"></canvas>
            </div>
          </div>
        `);

        setTimeout(() => {
          const root = document.getElementById('music-app-root');
          if (!root) return;
          const playBtn = root.querySelector('#music-play-btn');
          const prevBtn = root.querySelector('#music-prev-btn');
          const nextBtn = root.querySelector('#music-next-btn');
          const title = root.querySelector('#music-player-title');
          const artist = root.querySelector('#music-player-artist');
          const albumArt = root.querySelector('#music-album-art');
          const canvas = root.querySelector('#music-visualizer');
          const ctx = canvas ? canvas.getContext('2d') : null;

          const updateUI = () => {
            const track = polyAudio.tracks[polyAudio.currentTrackIndex];
            if (title) title.textContent = track.title;
            if (artist) artist.textContent = track.artist;
            if (playBtn) {
              playBtn.textContent = polyAudio.musicPlaying ? '⏸ Pause' : '▶ Play';
              playBtn.style.background = polyAudio.musicPlaying ? '#0a84ff' : '#ff2d55';
            }
            if (albumArt) {
              albumArt.style.transform = polyAudio.musicPlaying ? 'scale(1.05)' : 'scale(1)';
            }
            // Sync with Control Center
            const ccPlayBtn = document.getElementById('play-pause-btn');
            if (ccPlayBtn) ccPlayBtn.textContent = polyAudio.musicPlaying ? '⏸' : '▶';
            const ccSong = document.getElementById('cc-media-title');
            if (ccSong) ccSong.textContent = track.title;
          };

          if (playBtn) {
            playBtn.addEventListener('click', () => {
              polyAudio.toggleMusic();
              updateUI();
              this.notifyIsland(polyAudio.musicPlaying ? `🎵 Playing: ${polyAudio.tracks[polyAudio.currentTrackIndex].title}` : '⏸ Audio Paused');
            });
          }

          if (nextBtn) {
            nextBtn.addEventListener('click', () => {
              const tr = polyAudio.nextTrack();
              updateUI();
              this.notifyIsland(`⏭ ${tr.title}`);
            });
          }

          if (prevBtn) {
            prevBtn.addEventListener('click', () => {
              const tr = polyAudio.prevTrack();
              updateUI();
              this.notifyIsland(`⏮ ${tr.title}`);
            });
          }

          // Visualizer render loop
          let animActive = true;
          const renderVisualizer = () => {
            if (!animActive || !ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const data = polyAudio.getFrequencyData();
            const barCount = 28;
            const barWidth = (canvas.width / barCount) - 3;

            for (let i = 0; i < barCount; i++) {
              let val = 0;
              if (polyAudio.musicPlaying && data) {
                val = (data[i % data.length] / 255) * canvas.height * 0.88;
              } else {
                // Gentle idle wave
                val = 4 + Math.sin(Date.now() * 0.003 + i * 0.3) * 3;
              }

              const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
              grad.addColorStop(0, '#0a84ff');
              grad.addColorStop(0.5, '#bf5af2');
              grad.addColorStop(1, '#ff2d55');

              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.roundRect(i * (barWidth + 3), canvas.height - val, barWidth, val, [3, 3, 0, 0]);
              ctx.fill();
            }

            requestAnimationFrame(renderVisualizer);
          };

          renderVisualizer();
          updateUI();
        }, 50);
        break;

      case 'telemetry':
        this.createWindow('Process Monitor (polyd)', '⚡', 400, 160, 640, 400, `
          <div style="font-family:'JetBrains Mono', monospace; font-size:11px; height:100%; display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">
              <span>PID / APP</span>
              <span>STATE</span>
              <span>CPU WEIGHT</span>
              <span>MEM (ZRAM)</span>
            </div>
            <div id="telemetry-table" style="display:flex; flex-direction:column; gap:6px;">
              <!-- Dynamically populated -->
            </div>
          </div>
        `);
        break;

      case 'files':
        this.createWindow('Files & Workspace', '📁', 180, 100, 880, 530, `
          <div class="app-split-container" id="files-app-root">
            <!-- Left Sidebar (Quick Access + iOS Tags + Storage) -->
            <aside class="app-sidebar">
              <div class="sidebar-group-title">Quick Access</div>
              <div class="sidebar-menu">
                <button class="sidebar-item active" data-folder="Projects"><span class="icon">📁</span> Projects</button>
                <button class="sidebar-item" data-folder="Documents"><span class="icon">📄</span> Documents</button>
                <button class="sidebar-item" data-folder="Downloads"><span class="icon">📥</span> Downloads</button>
                <button class="sidebar-item" data-folder="Recents"><span class="icon">🕒</span> Recents</button>
              </div>

              <div class="sidebar-group-title">Tags (iOS)</div>
              <div class="sidebar-menu">
                <button class="sidebar-item" data-tag="urgent"><span style="color:#ff453a;">●</span> Urgent & Hot</button>
                <button class="sidebar-item" data-tag="work"><span style="color:#30d158;">●</span> Work Core</button>
                <button class="sidebar-item" data-tag="personal"><span style="color:#bf5af2;">●</span> Personal</button>
              </div>

              <div class="sidebar-group-title" style="margin-top:auto;">Storage (Windows)</div>
              <div style="padding:0 8px; font-size:11px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span>Poly NVMe SSD</span>
                  <span style="color:#aaa;">28/256 GB</span>
                </div>
                <div style="height:4px; background:rgba(255,255,255,0.1); border-radius:2px; overflow:hidden;">
                  <div style="width:12%; height:100%; background:#0a84ff;"></div>
                </div>
              </div>
            </aside>

            <!-- Main Explorer Pane -->
            <main class="app-main-pane">
              <!-- Windows-style Breadcrumbs Navigation -->
              <div class="files-toolbar">
                <div class="files-nav-btns">
                  <button class="files-nav-btn" id="files-btn-back" title="Back">◀</button>
                  <button class="files-nav-btn" id="files-btn-forward" title="Forward">▶</button>
                </div>
                <div class="files-breadcrumbs" id="files-crumb-bar"></div>
                <input type="text" placeholder="Filter files (e.g. rs, pdf)..." class="files-search" id="files-filter-input">
              </div>

              <!-- Interactive File Grid -->
              <div class="files-grid" id="files-items-grid"></div>

              <!-- iOS-style Quick Details Bar -->
              <div class="files-preview-footer" id="files-footer-info">
                <span id="files-count-info">5 items</span>
                <span id="files-selection-detail" style="color:#0a84ff;">Double-click file for Quick Look</span>
              </div>
            </main>
          </div>
        `);

        // Attach interactive virtual file system engine
        setTimeout(() => {
          const root = document.getElementById('files-app-root');
          if (!root) return;

          const vfs = {
            'Projects': [
              { name: 'poly-compositor', type: 'folder', meta: 'Rust • 14 files', tag: 'work', icon: '📁' },
              { name: 'poly-daemon', type: 'folder', meta: 'cgroups v2 • 3 files', tag: 'urgent', icon: '📁' },
              { name: 'poly-shell', type: 'folder', meta: '120Hz UI • 5 files', tag: 'work', icon: '📁' },
              { name: 'physics.rs', type: 'code', meta: 'Rust Spring • 4.3 KB', tag: 'work', icon: '🦀', size: '4.3 KB' },
              { name: 'polyd.py', type: 'code', meta: 'Freezer • 7.7 KB', tag: 'urgent', icon: '🐍', size: '7.7 KB' }
            ],
            'Documents': [
              { name: 'SPECIFICATION.md', type: 'doc', meta: 'Markdown • 8.3 KB', tag: 'urgent', icon: '📄', size: '8.3 KB' },
              { name: 'Poly_Whitepaper.pdf', type: 'pdf', meta: 'PDF Document • 4.2 MB', tag: 'work', icon: '📄', size: '4.2 MB' },
              { name: 'Roadmap_2026.txt', type: 'doc', meta: 'Text Note • 1.8 KB', tag: 'personal', icon: '📝', size: '1.8 KB' }
            ],
            'Downloads': [
              { name: '120Hz_Demo.mp4', type: 'video', meta: 'H.265 • 18.5 MB', tag: 'personal', icon: '🎬', size: '18.5 MB' },
              { name: 'Cupertino_5K.heic', type: 'image', meta: '5K Image • 8.1 MB', tag: 'personal', icon: '🖼️', size: '8.1 MB' },
              { name: 'build-iso.sh', type: 'script', meta: 'Shell Script • 3.1 KB', tag: 'work', icon: '⚙️', size: '3.1 KB' }
            ],
            'Recents': [
              { name: 'physics.rs', type: 'code', meta: 'Rust Spring • 4.3 KB', tag: 'work', icon: '🦀', size: '4.3 KB' },
              { name: 'SPECIFICATION.md', type: 'doc', meta: 'Markdown • 8.3 KB', tag: 'urgent', icon: '📄', size: '8.3 KB' },
              { name: 'polyd.py', type: 'code', meta: 'Freezer • 7.7 KB', tag: 'urgent', icon: '🐍', size: '7.7 KB' }
            ]
          };

          let currentDir = 'Projects';
          const navHistory = ['Projects'];
          let histIdx = 0;

          const renderGrid = () => {
            const grid = root.querySelector('#files-items-grid');
            const crumbBar = root.querySelector('#files-crumb-bar');
            const countInfo = root.querySelector('#files-count-info');
            const items = vfs[currentDir] || [];

            // Update Breadcrumbs
            if (crumbBar) {
              crumbBar.innerHTML = `
                <span class="crumb" style="cursor:pointer;" data-jump="Projects">PolyOS</span>
                <span class="crumb-sep">/</span>
                <span class="crumb" style="cursor:pointer;" data-jump="${currentDir}">Users</span>
                <span class="crumb-sep">/</span>
                <span class="crumb" style="cursor:pointer;" data-jump="${currentDir}">rahul</span>
                <span class="crumb-sep">/</span>
                <span class="crumb" style="font-weight:600; color:#fff;">${currentDir}</span>
              `;
            }

            if (countInfo) countInfo.textContent = `${items.length} items`;

            if (grid) {
              grid.innerHTML = items.map(item => `
                <div class="file-card" data-name="${item.name}" data-type="${item.type}" data-size="${item.size || 'Folder'}" data-tag="${item.tag}">
                  <div class="file-tag-dot tag-${item.tag}"></div>
                  <div class="file-icon">${item.icon}</div>
                  <div class="file-name">${item.name}</div>
                  <div class="file-meta">${item.meta}</div>
                </div>
              `).join('');

              const cards = grid.querySelectorAll('.file-card');
              cards.forEach(card => {
                card.addEventListener('click', () => {
                  cards.forEach(c => c.classList.remove('selected'));
                  card.classList.add('selected');
                  const name = card.dataset.name;
                  const detailSpan = root.querySelector('#files-selection-detail');
                  if (detailSpan) detailSpan.textContent = `Selected: ${name}`;
                });

                card.addEventListener('dblclick', () => {
                  const type = card.dataset.type;
                  const name = card.dataset.name;
                  const size = card.dataset.size;
                  if (type === 'folder') {
                    if (vfs[name]) {
                      currentDir = name;
                      navHistory.push(name);
                      histIdx = navHistory.length - 1;
                      renderGrid();
                    } else {
                      this.notifyIsland(`📁 Opening folder: ${name}`);
                    }
                  } else {
                    this.openQuickLook(name, type, size);
                  }
                });
              });
            }
          };

          // Sidebar clicks
          root.querySelectorAll('.sidebar-item[data-folder]').forEach(btn => {
            btn.addEventListener('click', () => {
              root.querySelectorAll('.sidebar-item').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              currentDir = btn.dataset.folder;
              navHistory.push(currentDir);
              histIdx = navHistory.length - 1;
              renderGrid();
            });
          });

          // History back/forward
          const backBtn = root.querySelector('#files-btn-back');
          const fwdBtn = root.querySelector('#files-btn-forward');
          if (backBtn) {
            backBtn.addEventListener('click', () => {
              if (histIdx > 0) {
                histIdx--;
                currentDir = navHistory[histIdx];
                renderGrid();
              }
            });
          }
          if (fwdBtn) {
            fwdBtn.addEventListener('click', () => {
              if (histIdx < navHistory.length - 1) {
                histIdx++;
                currentDir = navHistory[histIdx];
                renderGrid();
              }
            });
          }

          // Search filter
          const filterInput = root.querySelector('#files-filter-input');
          if (filterInput) {
            filterInput.addEventListener('input', (e) => {
              const q = e.target.value.toLowerCase();
              root.querySelectorAll('.file-card').forEach(card => {
                const name = card.dataset.name.toLowerCase();
                card.style.display = name.includes(q) ? 'flex' : 'none';
              });
            });
          }

          renderGrid();
        }, 50);
        break;

      case 'settings':
        const settingsWin = this.createWindow('Poly System Settings', '⚙️', 220, 120, 840, 540, `
          <div class="app-split-container" id="settings-app-root">
            <!-- Settings Sidebar -->
            <aside class="app-sidebar">
              <div class="sidebar-group-title">System Settings</div>
              <div class="sidebar-menu">
                <button class="sidebar-item active" data-tab="display"><span class="icon">🖥️</span> Display & 120Hz</button>
                <button class="sidebar-item" data-tab="themes"><span class="icon">🎨</span> Wallpapers & Sound</button>
                <button class="sidebar-item" data-tab="energy"><span class="icon">⚡</span> Energy Engine</button>
                <button class="sidebar-item" data-tab="multitask"><span class="icon">🪟</span> Multitasking</button>
                <button class="sidebar-item" data-tab="storage"><span class="icon">💾</span> Storage & ZRAM</button>
                <button class="sidebar-item" data-tab="about"><span class="icon">ℹ️</span> About Poly OS</button>
              </div>
            </aside>

            <!-- Settings Content Pane -->
            <main class="app-main-pane">
              <!-- Tab 1: Display & 120Hz -->
              <div class="settings-content" id="tab-display" style="display: flex;">
                <div class="settings-section-title">Display & Fluidity</div>
                <div class="settings-section-desc">Manage display refresh rate, ProMotion spring acceleration, and scaling.</div>

                <div class="settings-card">
                  <div class="settings-row">
                    <div class="settings-label">
                      <span class="settings-label-title">Refresh Rate</span>
                      <span class="settings-label-sub">Decoupled compositor render loop timing</span>
                    </div>
                    <div class="segmented-control" id="refresh-rate-control">
                      <button class="seg-btn" data-hz="60">60 Hz</button>
                      <button class="seg-btn" data-hz="90">90 Hz</button>
                      <button class="seg-btn active" data-hz="120">120 Hz ProMotion</button>
                    </div>
                  </div>

                  <div class="settings-row">
                    <div class="settings-label">
                      <span class="settings-label-title">Hardware GPU Acceleration</span>
                      <span class="settings-label-sub">Direct KMS/DRM Vulkan render pipeline</span>
                    </div>
                    <label class="switch">
                      <input type="checkbox" checked id="hw-accel-toggle">
                      <span class="switch-slider"></span>
                    </label>
                  </div>

                  <div class="settings-row">
                    <div class="settings-label">
                      <span class="settings-label-title">Display Scaling</span>
                      <span class="settings-label-sub">Vector crisp rendering for high-DPI screens</span>
                    </div>
                    <span style="font-weight:600; font-size:12px; color:#0a84ff;">125% (Recommended)</span>
                  </div>
                </div>
              </div>

              <!-- Tab: Wallpapers & Sound -->
              <div class="settings-content hidden" id="tab-themes" style="display: none;">
                <div class="settings-section-title">Personalization & Audio</div>
                <div class="settings-section-desc">Select high-dynamic range desktop wallpapers and system acoustic feedback.</div>

                <div class="settings-card">
                  <div class="settings-label" style="margin-bottom:12px;">
                    <span class="settings-label-title">Desktop Wallpaper Theme</span>
                    <span class="settings-label-sub">Vector and mesh gradients rendered at 120Hz</span>
                  </div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <button class="wallpaper-card-btn" data-wp="cupertino" style="background:radial-gradient(circle at 20% 20%, #1a1a2e 0%, #0c0c14 100%), radial-gradient(at 0% 0%, rgba(10, 132, 255, 0.4) 0px, transparent 60%); border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:16px; cursor:pointer; text-align:left; color:#fff;">
                      <div style="font-weight:700; font-size:14px; margin-bottom:4px;">🌌 Cupertino Glass</div>
                      <div style="font-size:11px; color:#aaa;">iOS Dark Indigo & Cyan Glass</div>
                    </button>
                    <button class="wallpaper-card-btn" data-wp="redmond" style="background:radial-gradient(circle at 80% 20%, #0d1b2a 0%, #040810 100%), radial-gradient(at 100% 0%, rgba(0, 120, 215, 0.5) 0px, transparent 60%); border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:16px; cursor:pointer; text-align:left; color:#fff;">
                      <div style="font-weight:700; font-size:14px; margin-bottom:4px;">🌊 Redmond Horizon</div>
                      <div style="font-size:11px; color:#aaa;">Windows 11 Flow Cobalt Silk</div>
                    </button>
                    <button class="wallpaper-card-btn" data-wp="aurora" style="background:radial-gradient(circle at 50% 10%, #092327 0%, #020b0d 100%), radial-gradient(at 20% 20%, rgba(48, 209, 88, 0.4) 0px, transparent 50%); border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:16px; cursor:pointer; text-align:left; color:#fff;">
                      <div style="font-weight:700; font-size:14px; margin-bottom:4px;">🌲 Nordic Aurora</div>
                      <div style="font-size:11px; color:#aaa;">Teal & Emerald Ambient Night</div>
                    </button>
                    <button class="wallpaper-card-btn" data-wp="cyber" style="background:radial-gradient(circle at 10% 80%, #20002c 0%, #07000b 100%), radial-gradient(at 10% 90%, rgba(255, 45, 85, 0.4) 0px, transparent 55%); border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:16px; cursor:pointer; text-align:left; color:#fff;">
                      <div style="font-weight:700; font-size:14px; margin-bottom:4px;">🌆 Cyber Dusk</div>
                      <div style="font-size:11px; color:#aaa;">Neon Magenta & Obsidian</div>
                    </button>
                  </div>
                </div>

                <div class="settings-card" style="margin-top:14px;">
                  <div class="settings-row">
                    <div class="settings-label">
                      <span class="settings-label-title">Poly Acoustic Feedback Engine</span>
                      <span class="settings-label-sub">Synthesized iOS clicks, window snap chimes & spring whooshes</span>
                    </div>
                    <label class="switch">
                      <input type="checkbox" checked id="sound-feedback-toggle">
                      <span class="switch-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Tab 2: Energy Engine -->
              <div class="settings-content hidden" id="tab-energy" style="display: none;">
                <div class="settings-section-title">Poly Energy Engine (polyd)</div>
                <div class="settings-section-desc">Linux cgroups v2 background process lifecycle and battery optimization.</div>

                <div class="settings-card">
                  <div class="settings-row">
                    <div class="settings-label">
                      <span class="settings-label-title">Background Process Freezing</span>
                      <span class="settings-label-sub">Suspend inactive windows after grace period</span>
                    </div>
                    <label class="switch">
                      <input type="checkbox" checked id="freezer-toggle">
                      <span class="switch-slider"></span>
                    </label>
                  </div>

                  <div class="settings-row">
                    <div class="settings-label">
                      <span class="settings-label-title">Inactive Freeze Timeout</span>
                      <span class="settings-label-sub">Time before cgroup.freeze is asserted</span>
                    </div>
                    <span style="font-weight:600; font-size:12px; color:#30d158;">15 Seconds</span>
                  </div>

                  <div class="settings-row">
                    <div class="settings-label">
                      <span class="settings-label-title">Keep-Alive Audio Lease</span>
                      <span class="settings-label-sub">Prevent media players (PipeWire) from sleeping</span>
                    </div>
                    <span style="font-weight:600; font-size:11px; background:rgba(48,209,88,0.2); color:#30d158; padding:2px 8px; border-radius:6px;">Enabled</span>
                  </div>
                </div>
              </div>

              <!-- Tab 3: Multitasking & Snapping -->
              <div class="settings-content hidden" id="tab-multitask" style="display: none;">
                <div class="settings-section-title">Multitasking & Window Physics</div>
                <div class="settings-section-desc">Tune mass-spring-damper equations and magnetic Aero Snap behavior.</div>

                <div class="settings-card">
                  <div class="settings-row">
                    <div class="settings-label">
                      <span class="settings-label-title">Magnetic Aero Snap</span>
                      <span class="settings-label-sub">Snap to half-screen and 4-corner quarter tiles</span>
                    </div>
                    <label class="switch">
                      <input type="checkbox" checked id="snap-toggle">
                      <span class="switch-slider"></span>
                    </label>
                  </div>

                  <div class="settings-row">
                    <div class="settings-label">
                      <span class="settings-label-title">Spring Stiffness (k)</span>
                      <span class="settings-label-sub" id="spring-stiff-label">Current: 260 N/m (Snappy response)</span>
                    </div>
                    <input type="range" min="150" max="400" value="260" id="spring-stiffness-slider" style="accent-color:#0a84ff; width:140px;">
                  </div>

                  <div class="settings-row">
                    <div class="settings-label">
                      <span class="settings-label-title">Spring Damping Ratio (ζ)</span>
                      <span class="settings-label-sub" id="spring-damp-label">Current: 0.82 (Natural iOS bounce)</span>
                    </div>
                    <input type="range" min="70" max="100" value="82" id="spring-damping-slider" style="accent-color:#bf5af2; width:140px;">
                  </div>
                </div>
              </div>

              <!-- Tab 4: Storage & ZRAM -->
              <div class="settings-content hidden" id="tab-storage" style="display: none;">
                <div class="settings-section-title">Storage & ZRAM Memory</div>
                <div class="settings-section-desc">RAM compression and NVMe storage distribution.</div>

                <div class="settings-card">
                  <div class="settings-label">
                    <span class="settings-label-title">NVMe Primary Drive (256 GB)</span>
                    <span class="settings-label-sub">28.4 GB Used • 227.6 GB Available</span>
                  </div>
                  <div class="storage-bar-container">
                    <div class="storage-segment storage-sys" title="Poly System (4.2 GB)"></div>
                    <div class="storage-segment storage-apps" title="Apps & User (12.4 GB)"></div>
                    <div class="storage-segment storage-zram" title="ZRAM Compressed Cache (1.8 GB)"></div>
                    <div class="storage-segment storage-free" title="Free Space (227.6 GB)"></div>
                  </div>
                  <div style="display:flex; justify-content:space-between; font-size:11px; color:#aaa; margin-top:8px;">
                    <span>🟣 System: 4.2 GB</span>
                    <span>🔵 Apps: 12.4 GB</span>
                    <span>🟢 ZRAM (3.2x ratio): 1.8 GB</span>
                  </div>
                </div>

                <div class="settings-card" style="margin-top:14px;">
                  <div class="settings-row">
                    <div class="settings-label">
                      <span class="settings-label-title">ZRAM Active Compression</span>
                      <span class="settings-label-sub">High-efficiency LZ4 in-kernel memory compaction</span>
                    </div>
                    <button class="seg-btn active" id="purge-cache-btn" style="padding:6px 14px; font-size:12px;">Free Inactive RAM</button>
                  </div>
                </div>
              </div>

              <!-- Tab 5: About Poly OS -->
              <div class="settings-content hidden" id="tab-about" style="display: none;">
                <div class="settings-section-title">About Poly OS</div>
                <div class="settings-section-desc">Next-generation hybrid operating system.</div>

                <div class="settings-card">
                  <div class="settings-row">
                    <span class="settings-label-title">System Version</span>
                    <span style="font-family:'JetBrains Mono',monospace; color:#64d2ff;">Poly OS 2.5 (Developer Preview)</span>
                  </div>
                  <div class="settings-row">
                    <span class="settings-label-title">Display Server</span>
                    <span style="font-family:'JetBrains Mono',monospace; color:#30d158;">poly-compositor (Rust + Smithay)</span>
                  </div>
                  <div class="settings-row">
                    <span class="settings-label-title">Process Supervisor</span>
                    <span style="font-family:'JetBrains Mono',monospace; color:#ff9f0a;">polyd (Linux cgroups v2)</span>
                  </div>
                  <div class="settings-row">
                    <span class="settings-label-title">C Library</span>
                    <span style="font-family:'JetBrains Mono',monospace; color:#fff;">musl libc (Ultra-lightweight)</span>
                  </div>
                  <div class="settings-row" style="margin-top:4px;">
                    <span class="settings-label-title">Software Updates</span>
                    <button class="seg-btn" id="check-updates-btn" style="padding:6px 14px; font-size:12px;">Check for Updates</button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        `);

        // Attach tab switcher and control event handlers
        setTimeout(() => {
          const root = settingsWin.element;
          if (!root) return;

          const sidebarBtns = root.querySelectorAll('.sidebar-item[data-tab]');
          sidebarBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              sidebarBtns.forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              const tabId = btn.dataset.tab;
              root.querySelectorAll('.settings-content').forEach(c => {
                c.classList.add('hidden');
                c.style.display = 'none';
              });
              const targetTab = root.querySelector(`#tab-${tabId}`);
              if (targetTab) {
                targetTab.classList.remove('hidden');
                targetTab.style.display = 'flex';
              }
              polyAudio.playClick();
            });
          });

          // Refresh rate buttons
          root.querySelectorAll('#refresh-rate-control .seg-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              root.querySelectorAll('#refresh-rate-control .seg-btn').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              polyAudio.playClick();
              this.notifyIsland(`🖥️ Display: ${btn.textContent} Active`);
            });
          });

          // Wallpaper selection buttons
          root.querySelectorAll('.wallpaper-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const wp = btn.dataset.wp;
              this.setWallpaper(wp);
            });
          });

          // Sound toggle
          const soundToggle = root.querySelector('#sound-feedback-toggle');
          if (soundToggle) {
            soundToggle.checked = polyAudio.enabled;
            soundToggle.addEventListener('change', (e) => {
              polyAudio.enabled = e.target.checked;
              this.notifyIsland(`🔊 System Sounds: ${polyAudio.enabled ? 'Enabled' : 'Muted'}`);
              if (polyAudio.enabled) polyAudio.playSuccess();
            });
          }

          // Spring physics sliders
          const stiffSlider = root.querySelector('#spring-stiffness-slider');
          const stiffLabel = root.querySelector('#spring-stiff-label');
          if (stiffSlider) {
            stiffSlider.addEventListener('input', (e) => {
              const val = e.target.value;
              if (stiffLabel) stiffLabel.textContent = `Current: ${val} N/m (${val > 300 ? 'Ultra-Crisp' : 'Balanced'})`;
            });
          }

          const dampSlider = root.querySelector('#spring-damping-slider');
          const dampLabel = root.querySelector('#spring-damp-label');
          if (dampSlider) {
            dampSlider.addEventListener('input', (e) => {
              const val = (e.target.value / 100).toFixed(2);
              if (dampLabel) dampLabel.textContent = `Current: ${val} (${val < 0.8 ? 'Bouncy' : val == 1.0 ? 'Critical' : 'Natural iOS'})`;
            });
          }

          // Memory Purge Button
          const purgeBtn = root.querySelector('#purge-cache-btn');
          if (purgeBtn) {
            purgeBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              this.notifyIsland('⚡ polyd: Inactive cache purged to ZRAM pool');
              polyAudio.playSuccess();
              purgeBtn.textContent = '✓ RAM Compacted';
              setTimeout(() => { purgeBtn.textContent = 'Free Inactive RAM'; }, 2000);
            });
          }

          // Check for Updates Button
          const updatesBtn = root.querySelector('#check-updates-btn');
          if (updatesBtn) {
            updatesBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              updatesBtn.textContent = 'Checking...';
              polyAudio.playClick();
              setTimeout(() => {
                updatesBtn.textContent = '✓ Up to Date';
                this.notifyIsland('🚀 Poly OS 2.5: Running latest stable build');
                polyAudio.playSuccess();
                setTimeout(() => { updatesBtn.textContent = 'Check for Updates'; }, 3000);
              }, 600);
            });
          }
        }, 30);
        break;

      case 'store':
        this.createWindow('Poly App Store', '🛍️', 260, 100, 840, 560, `
          <div class="store-container" id="store-app-root">
            <div class="store-hero">
              <div class="store-hero-text">
                <h3>Poly App Store</h3>
                <p>Sandboxed, musl-compiled native apps with automatic background freezing</p>
              </div>
              <span class="store-pill-badge">Alpine Musl Base</span>
            </div>

            <div class="store-nav-row">
              <button class="store-category-btn active" data-cat="all">All Apps</button>
              <button class="store-category-btn" data-cat="dev">Developer</button>
              <button class="store-category-btn" data-cat="creative">Creative</button>
              <button class="store-category-btn" data-cat="util">Utilities</button>
            </div>

            <div class="store-grid">
              <!-- App 1: Poly Code Studio -->
              <div class="store-card" data-cat="dev">
                <div class="store-card-header">
                  <div class="store-card-icon">💻</div>
                  <div class="store-card-info">
                    <div class="store-card-name">Poly Code Studio</div>
                    <div class="store-card-tag">Developer Tools • IDE</div>
                  </div>
                </div>
                <div class="store-card-desc">Lightweight code editor with syntax tabs, line numbers, and live script runner.</div>
                <div class="store-card-footer">
                  <span class="store-card-meta">14.2 MB • Rust / C</span>
                  <button class="store-install-btn ${this.installedApps.has('code') ? 'installed' : ''}" data-app-id="code" data-app-name="Code Studio" data-app-icon="💻">
                    ${this.installedApps.has('code') ? 'Open' : 'Install'}
                  </button>
                </div>
              </div>

              <!-- App 2: Vector Canvas -->
              <div class="store-card" data-cat="creative">
                <div class="store-card-header">
                  <div class="store-card-icon">🎨</div>
                  <div class="store-card-info">
                    <div class="store-card-name">Vector Canvas</div>
                    <div class="store-card-tag">Creativity • Graphics</div>
                  </div>
                </div>
                <div class="store-card-desc">Interactive whiteboard and drawing tool with color swatches, brush sizing, and clear canvas.</div>
                <div class="store-card-footer">
                  <span class="store-card-meta">8.4 MB • GPU accelerated</span>
                  <button class="store-install-btn ${this.installedApps.has('canvas') ? 'installed' : ''}" data-app-id="canvas" data-app-name="Vector Canvas" data-app-icon="🎨">
                    ${this.installedApps.has('canvas') ? 'Open' : 'Install'}
                  </button>
                </div>
              </div>

              <!-- App 3: Retro Arcade -->
              <div class="store-card" data-cat="creative">
                <div class="store-card-header">
                  <div class="store-card-icon">🕹️</div>
                  <div class="store-card-info">
                    <div class="store-card-name">Retro Arcade (Pong)</div>
                    <div class="store-card-tag">Gaming • Physics</div>
                  </div>
                </div>
                <div class="store-card-desc">Fluid 120Hz physics mini-game test with mouse paddle control and acoustic sound chimes.</div>
                <div class="store-card-footer">
                  <span class="store-card-meta">4.1 MB • 120 FPS</span>
                  <button class="store-install-btn ${this.installedApps.has('arcade') ? 'installed' : ''}" data-app-id="arcade" data-app-name="Retro Arcade" data-app-icon="🕹️">
                    ${this.installedApps.has('arcade') ? 'Open' : 'Install'}
                  </button>
                </div>
              </div>

              <!-- App 4: Poly Calculator -->
              <div class="store-card" data-cat="util">
                <div class="store-card-header">
                  <div class="store-card-icon">🧮</div>
                  <div class="store-card-info">
                    <div class="store-card-name">Poly Calculator</div>
                    <div class="store-card-tag">Utilities • Math</div>
                  </div>
                </div>
                <div class="store-card-desc">Fast floating-point scientific calculator with live expression evaluation.</div>
                <div class="store-card-footer">
                  <span class="store-card-meta">2.8 MB • Lightweight</span>
                  <button class="store-install-btn ${this.installedApps.has('calculator') ? 'installed' : ''}" data-app-id="calculator" data-app-name="Calculator" data-app-icon="🧮">
                    ${this.installedApps.has('calculator') ? 'Open' : 'Install'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        `);

        // Attach store install click listeners
        setTimeout(() => {
          const root = document.getElementById('store-app-root');
          if (!root) return;

          // Category filter
          root.querySelectorAll('.store-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              root.querySelectorAll('.store-category-btn').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              const cat = btn.dataset.cat;
              root.querySelectorAll('.store-card').forEach(card => {
                card.style.display = (cat === 'all' || card.dataset.cat === cat) ? 'flex' : 'none';
              });
            });
          });

          // Install buttons
          root.querySelectorAll('.store-install-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              const appId = btn.dataset.appId;
              const appName = btn.dataset.appName;
              const appIcon = btn.dataset.appIcon;

              if (this.installedApps.has(appId)) {
                this.launchApp(appId);
                return;
              }

              // Simulate package download & signature verification
              btn.textContent = 'Installing...';
              btn.style.opacity = '0.7';
              btn.disabled = true;

              setTimeout(() => {
                this.installStoreApp(appId, appName, appIcon);
                btn.textContent = 'Open';
                btn.style.opacity = '1';
                btn.disabled = false;
                btn.classList.add('installed');
              }, 800);
            });
          });
        }, 50);
        break;

      case 'code':
        this.createWindow('Poly Code Studio', '💻', 180, 80, 880, 560, `
          <div class="code-editor-root" id="code-studio-root" style="display:flex; flex-direction:column; height:100%;">
            <div class="code-tabs-bar">
              <div class="code-tab active" data-file="physics">🦀 physics.rs</div>
              <div class="code-tab" data-file="polyd">🐍 polyd.py</div>
              <div class="code-tab" data-file="shell">⚡ shell.js</div>
              <button id="run-code-btn" style="margin-left:auto; background:var(--accent-green); border:none; color:#000; font-weight:700; font-size:11px; padding:5px 14px; border-radius:6px; cursor:pointer; align-self:center; display:flex; align-items:center; gap:6px;">
                <span>▶</span> Run Script
              </button>
            </div>
            <div class="code-workspace" style="flex:1; display:flex; overflow:hidden; position:relative;">
              <div class="code-lines" id="code-line-numbers" style="padding:12px 8px; font-family:'JetBrains Mono',monospace; font-size:11.5px; line-height:1.5; color:#555; background:rgba(0,0,0,0.3); border-right:1px solid rgba(255,255,255,0.06); user-select:none; text-align:right; min-width:34px;">
              </div>
              <textarea class="code-textarea" id="code-editor-text" spellcheck="false" style="flex:1; background:transparent; border:none; outline:none; color:#eee; font-family:'JetBrains Mono',monospace; font-size:11.5px; line-height:1.5; padding:12px; resize:none; overflow-y:auto; tab-size:2;"></textarea>
            </div>
            
            <!-- Interactive Console Output Drawer -->
            <div class="code-console-drawer">
              <div class="code-console-header">
                <span>Output Console & Sandbox Runner</span>
                <div style="display:flex; gap:10px; align-items:center;">
                  <span id="code-status-pill" style="font-size:10px; color:#30d158;">Ready</span>
                  <button id="clear-code-console" style="background:transparent; border:none; color:#888; cursor:pointer; font-size:11px;">Clear</button>
                </div>
              </div>
              <div class="code-console-body" id="code-console-body">Poly Code Studio v1.0 Sandbox Initialized.
Press 'Run Script' to execute the active file.</div>
            </div>
          </div>
        `);

        setTimeout(() => {
          const root = document.getElementById('code-studio-root');
          if (!root) return;

          const fileBuffers = {
            'physics': `// Poly OS Spring Physics Engine (Rust 2024 Edition)
pub struct Spring1D {
    pub current: f32,
    pub target: f32,
    pub velocity: f32,
    pub stiffness: f32,    // k = 260.0
    pub damping: f32,      // zeta = 0.82 (iOS fluid feel)
}

impl Spring1D {
    pub fn new(initial: f32) -> Self {
        Self { current: initial, target: initial, velocity: 0.0, stiffness: 260.0, damping: 0.82 }
    }

    pub fn update(&mut self, dt: f32) -> bool {
        let displacement = self.current - self.target;
        let c = 2.0 * self.damping * (self.stiffness).sqrt();
        let spring_force = -self.stiffness * displacement;
        let acceleration = spring_force - c * self.velocity;
        self.velocity += acceleration * dt;
        self.current += self.velocity * dt;
        self.velocity.abs() > 0.005
    }
}

fn main() {
    let mut spring = Spring1D::new(0.0);
    spring.target = 100.0;
    println!("Spring initialized. Simulating 120Hz frames...");
    for frame in 1..=12 {
        spring.update(1.0 / 120.0);
        println!("Frame {}: current = {:.2}, vel = {:.2}", frame, spring.current, spring.velocity);
    }
}`,
            'polyd': `# Poly OS Background Process Lifecycle Daemon
# Utilizes Linux cgroups v2 freezer for zero-battery background drain

import time
import os

CGROUP_FREEZE_PATH = "/sys/fs/cgroup/poly/cgroup.freeze"

def freeze_process(pid: int, app_name: str):
    print(f"[polyd] Inactivity threshold reached for {app_name} (PID: {pid})")
    print(f"[polyd] Writing '1' to {CGROUP_FREEZE_PATH}...")
    time.sleep(0.02)
    print(f"[polyd] Process {pid} successfully FROZEN. CPU weight -> 0%. ZRAM pool locked.")

def thaw_process(pid: int, app_name: str):
    print(f"[polyd] Focus restored for {app_name} (PID: {pid}). Thawing in 0.8ms...")

if __name__ == "__main__":
    print("Poly Daemon (polyd) active at 120Hz VSync loop.")
    freeze_process(1042, "Poly Browser")`,
            'shell': `// Poly Shell Dynamic Island & Telemetry Routine
console.log("Poly Shell runtime loaded.");

const metrics = {
  cpu: 14,
  ramMb: 218,
  hz: 120,
  thermal: "41°C (Optimal)"
};

console.log("Telemetry Sync Status:", JSON.stringify(metrics, null, 2));
console.log("Aero Snapping active. Mass-spring physics initialized.");`
          };

          let currentFile = 'physics';
          const textarea = root.querySelector('#code-editor-text');
          const linesBox = root.querySelector('#code-line-numbers');
          const consoleBody = root.querySelector('#code-console-body');
          const statusPill = root.querySelector('#code-status-pill');
          const runBtn = root.querySelector('#run-code-btn');
          const clearBtn = root.querySelector('#clear-code-console');

          const updateLines = () => {
            if (!textarea || !linesBox) return;
            const lineCount = textarea.value.split('\n').length;
            let linesHtml = '';
            for (let i = 1; i <= lineCount; i++) {
              linesHtml += `${i}<br>`;
            }
            linesBox.innerHTML = linesHtml;
          };

          const switchFile = (key) => {
            currentFile = key;
            if (textarea) textarea.value = fileBuffers[key] || '';
            updateLines();
          };

          switchFile('physics');

          textarea.addEventListener('input', () => {
            fileBuffers[currentFile] = textarea.value;
            updateLines();
          });

          root.querySelectorAll('.code-tab').forEach(tab => {
            tab.addEventListener('click', () => {
              root.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
              tab.classList.add('active');
              switchFile(tab.dataset.file);
            });
          });

          if (clearBtn) {
            clearBtn.addEventListener('click', () => {
              if (consoleBody) consoleBody.textContent = '';
            });
          }

          if (runBtn) {
            runBtn.addEventListener('click', () => {
              if (statusPill) {
                statusPill.textContent = 'Compiling...';
                statusPill.style.color = '#ff9f0a';
              }

              setTimeout(() => {
                const now = new Date().toLocaleTimeString();
                if (currentFile === 'shell') {
                  let capturedLogs = [];
                  const originalLog = console.log;
                  console.log = (...args) => capturedLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
                  try {
                    new Function(textarea.value)();
                    consoleBody.textContent += `\n[${now}] === Executed shell.js in Sandbox ===\n` + capturedLogs.join('\n');
                  } catch(err) {
                    consoleBody.textContent += `\n[${now}] [Runtime Error]: ${err.message}`;
                  } finally {
                    console.log = originalLog;
                  }
                } else if (currentFile === 'physics') {
                  consoleBody.textContent += `\n[${now}] [rustc 1.80.0] Building physics.rs with musl-target (120Hz optimization)...
   Compiling poly-physics v0.9.4 (/workspace/poly-compositor)
    Finished release [optimized] target(s) in 0.018s
Running \`target/release/physics\`
Spring initialized. Simulating 120Hz frames...
Frame 1: current = 14.20, vel = 170.40
Frame 2: current = 31.84, vel = 211.68
Frame 3: current = 52.12, vel = 243.36
Frame 4: current = 71.90, vel = 237.36
Frame 5: current = 87.82, vel = 191.04
Frame 6: current = 98.42, vel = 127.20
Frame 7: current = 103.55, vel = 61.56
Frame 8: current = 104.28, vel = 8.76
Spring reached target in 8 frames (66.6ms)!`;
                } else if (currentFile === 'polyd') {
                  consoleBody.textContent += `\n[${now}] [python3 polyd.py]
Poly Daemon (polyd) active at 120Hz VSync loop.
[polyd] Inactivity threshold reached for Poly Browser (PID: 1042)
[polyd] Writing '1' to /sys/fs/cgroup/poly/cgroup.freeze...
[polyd] Process 1042 successfully FROZEN. CPU weight -> 0%. ZRAM pool locked.`;
                }

                if (statusPill) {
                  statusPill.textContent = 'Success (0 Errors)';
                  statusPill.style.color = '#30d158';
                }
                consoleBody.scrollTop = consoleBody.scrollHeight;
                this.notifyIsland(`💻 ${currentFile} executed successfully!`);
                polyAudio.playSuccess();
              }, 120);
            });
          }
        }, 50);
        break;

      case 'canvas':
        this.createWindow('Vector Canvas', '🎨', 240, 110, 780, 520, `
          <div class="canvas-app-root" id="canvas-app-root">
            <div class="canvas-toolbar">
              <button class="canvas-tool-btn active" data-tool="brush">✏️ Brush</button>
              <button class="canvas-tool-btn" data-tool="eraser">🧹 Eraser</button>
              <input type="color" value="#0a84ff" class="canvas-color-picker" id="brush-color-picker">
              <button class="canvas-tool-btn" data-size="3">Thin</button>
              <button class="canvas-tool-btn active" data-size="6">Medium</button>
              <button class="canvas-tool-btn" data-size="14">Thick</button>
              <button class="canvas-tool-btn" id="canvas-clear-btn" style="margin-left:auto; background:rgba(255,69,58,0.2); color:#ff453a;">🗑️ Clear</button>
            </div>
            <div class="canvas-surface-wrap">
              <canvas class="paint-canvas" id="main-paint-canvas" width="740" height="420"></canvas>
            </div>
          </div>
        `);

        // Attach interactive drawing logic
        setTimeout(() => {
          const canvas = document.getElementById('main-paint-canvas');
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          let drawing = false;
          let currentColor = '#0a84ff';
          let currentSize = 6;
          let isEraser = false;

          const colorPicker = document.getElementById('brush-color-picker');
          if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
              currentColor = e.target.value;
              isEraser = false;
            });
          }

          document.querySelectorAll('#canvas-app-root .canvas-tool-btn[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => {
              document.querySelectorAll('#canvas-app-root .canvas-tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              isEraser = (btn.dataset.tool === 'eraser');
            });
          });

          document.querySelectorAll('#canvas-app-root .canvas-tool-btn[data-size]').forEach(btn => {
            btn.addEventListener('click', () => {
              document.querySelectorAll('#canvas-app-root .canvas-tool-btn[data-size]').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              currentSize = parseInt(btn.dataset.size);
            });
          });

          const clearBtn = document.getElementById('canvas-clear-btn');
          if (clearBtn) {
            clearBtn.addEventListener('click', () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              polyAudio.playClick();
            });
          }

          canvas.addEventListener('mousedown', (e) => {
            drawing = true;
            ctx.beginPath();
            const rect = canvas.getBoundingClientRect();
            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
          });

          canvas.addEventListener('mousemove', (e) => {
            if (!drawing) return;
            const rect = canvas.getBoundingClientRect();
            ctx.strokeStyle = isEraser ? '#ffffff' : currentColor;
            ctx.lineWidth = currentSize;
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx.stroke();
          });

          window.addEventListener('mouseup', () => {
            if (drawing) {
              drawing = false;
              ctx.closePath();
            }
          });
        }, 50);
        break;

      case 'arcade':
        this.createWindow('Retro Arcade (120Hz Pong)', '🕹️', 280, 130, 680, 480, `
          <div class="arcade-container" id="arcade-container">
            <div class="arcade-status" id="arcade-status-bar">
              SCORE: <span id="arcade-score" style="color:#fff; font-weight:700;">0</span> • BEST: <span id="arcade-best" style="color:#aaa;">0</span> • 120 FPS
            </div>
            <canvas class="arcade-canvas" id="arcade-game-canvas" width="620" height="380"></canvas>
            <div style="font-size:11px; color:#666;">Move mouse left/right to position the paddle • Space to serve</div>
          </div>
        `);

        // Interactive 120Hz Pong physics loop
        setTimeout(() => {
          const cvs = document.getElementById('arcade-game-canvas');
          if (!cvs) return;
          const gctx = cvs.getContext('2d');
          let paddleW = 90;
          let paddleH = 10;
          let paddleX = (cvs.width - paddleW) / 2;
          let ballX = cvs.width / 2;
          let ballY = 60;
          let ballVx = 3.5;
          let ballVy = 3.5;
          let ballR = 6;
          let score = 0;
          let best = 0;
          let isRunning = true;

          cvs.addEventListener('mousemove', (e) => {
            const rect = cvs.getBoundingClientRect();
            paddleX = Math.max(0, Math.min(e.clientX - rect.left - paddleW / 2, cvs.width - paddleW));
          });

          const gameLoop = () => {
            if (!document.getElementById('arcade-game-canvas')) return; // Window closed

            // Update
            ballX += ballVx;
            ballY += ballVy;

            // Walls bounce
            if (ballX - ballR <= 0 || ballX + ballR >= cvs.width) {
              ballVx = -ballVx;
              polyAudio.playClick();
            }
            if (ballY - ballR <= 0) {
              ballVy = -ballVy;
              polyAudio.playClick();
            }

            // Paddle bounce
            if (ballY + ballR >= cvs.height - paddleH - 12 && ballY - ballR <= cvs.height - 12) {
              if (ballX >= paddleX && ballX <= paddleX + paddleW) {
                ballVy = -Math.abs(ballVy);
                // Spin reflection
                const hit = (ballX - (paddleX + paddleW / 2)) / (paddleW / 2);
                ballVx = hit * 5;
                score++;
                if (score > best) best = score;
                const scEl = document.getElementById('arcade-score');
                const beEl = document.getElementById('arcade-best');
                if (scEl) scEl.textContent = score;
                if (beEl) beEl.textContent = best;
                polyAudio.playSnap();
              }
            }

            // Missed bottom
            if (ballY > cvs.height + 20) {
              ballX = cvs.width / 2;
              ballY = 60;
              ballVx = (Math.random() > 0.5 ? 3.5 : -3.5);
              ballVy = 3.5;
              score = 0;
              const scEl = document.getElementById('arcade-score');
              if (scEl) scEl.textContent = '0';
              polyAudio.playAlert();
            }

            // Render
            gctx.fillStyle = '#080808';
            gctx.fillRect(0, 0, cvs.width, cvs.height);

            // Center dash line
            gctx.strokeStyle = 'rgba(255,255,255,0.08)';
            gctx.setLineDash([6, 6]);
            gctx.beginPath();
            gctx.moveTo(0, cvs.height / 2);
            gctx.lineTo(cvs.width, cvs.height / 2);
            gctx.stroke();
            gctx.setLineDash([]);

            // Paddle
            gctx.fillStyle = '#30d158';
            gctx.shadowColor = '#30d158';
            gctx.shadowBlur = 10;
            gctx.fillRect(paddleX, cvs.height - paddleH - 12, paddleW, paddleH);

            // Ball
            gctx.fillStyle = '#ffffff';
            gctx.shadowColor = '#64d2ff';
            gctx.shadowBlur = 8;
            gctx.beginPath();
            gctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
            gctx.fill();
            gctx.shadowBlur = 0;

            requestAnimationFrame(gameLoop);
          };

          requestAnimationFrame(gameLoop);
        }, 50);
        break;

      case 'calculator':
        this.createWindow('Poly Calculator', '🧮', 320, 140, 360, 460, `
          <div style="display:flex; flex-direction:column; height:100%; gap:12px; font-family:'JetBrains Mono', monospace;" id="calc-app-root">
            <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:16px; text-align:right;">
              <div id="calc-expr" style="font-size:13px; color:#888; min-height:18px;"></div>
              <div id="calc-display" style="font-size:32px; font-weight:700; color:#fff; overflow:hidden; text-overflow:ellipsis;">0</div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; flex:1;">
              <button class="calc-btn" data-act="clear" style="background:rgba(255,69,58,0.25); color:#ff453a;">C</button>
              <button class="calc-btn" data-act="sqrt" style="background:rgba(255,255,255,0.08);">√</button>
              <button class="calc-btn" data-act="sq" style="background:rgba(255,255,255,0.08);">x²</button>
              <button class="calc-btn" data-op="/" style="background:rgba(10,132,255,0.25); color:#0a84ff;">÷</button>

              <button class="calc-btn" data-num="7">7</button>
              <button class="calc-btn" data-num="8">8</button>
              <button class="calc-btn" data-num="9">9</button>
              <button class="calc-btn" data-op="*" style="background:rgba(10,132,255,0.25); color:#0a84ff;">×</button>

              <button class="calc-btn" data-num="4">4</button>
              <button class="calc-btn" data-num="5">5</button>
              <button class="calc-btn" data-num="6">6</button>
              <button class="calc-btn" data-op="-" style="background:rgba(10,132,255,0.25); color:#0a84ff;">−</button>

              <button class="calc-btn" data-num="1">1</button>
              <button class="calc-btn" data-num="2">2</button>
              <button class="calc-btn" data-num="3">3</button>
              <button class="calc-btn" data-op="+" style="background:rgba(10,132,255,0.25); color:#0a84ff;">+</button>

              <button class="calc-btn" data-num="0" style="grid-column:span 2;">0</button>
              <button class="calc-btn" data-num=".">.</button>
              <button class="calc-btn" data-act="equals" style="background:#0a84ff; color:#fff; font-weight:700;">=</button>
            </div>
          </div>
        `);

        // Attach calculator logic
        setTimeout(() => {
          const root = document.getElementById('calc-app-root');
          if (!root) return;
          const display = root.querySelector('#calc-display');
          const expr = root.querySelector('#calc-expr');
          let currentVal = '0';
          let pendingOp = null;
          let firstOperand = null;
          let shouldReset = false;

          root.querySelectorAll('.calc-btn').forEach(btn => {
            btn.style.border = '1px solid rgba(255,255,255,0.08)';
            btn.style.borderRadius = '8px';
            btn.style.fontSize = '18px';
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.1s ease';

            btn.addEventListener('click', () => {
              polyAudio.playClick();
              if (btn.dataset.num) {
                const n = btn.dataset.num;
                if (currentVal === '0' || shouldReset) {
                  currentVal = n;
                  shouldReset = false;
                } else {
                  currentVal += n;
                }
                display.textContent = currentVal;
              } else if (btn.dataset.op) {
                firstOperand = parseFloat(currentVal);
                pendingOp = btn.dataset.op;
                expr.textContent = `${firstOperand} ${pendingOp}`;
                shouldReset = true;
              } else if (btn.dataset.act === 'equals') {
                if (pendingOp && firstOperand !== null) {
                  const secondOperand = parseFloat(currentVal);
                  let res = 0;
                  if (pendingOp === '+') res = firstOperand + secondOperand;
                  if (pendingOp === '-') res = firstOperand - secondOperand;
                  if (pendingOp === '*') res = firstOperand * secondOperand;
                  if (pendingOp === '/') res = secondOperand !== 0 ? firstOperand / secondOperand : 'Error';
                  expr.textContent = `${firstOperand} ${pendingOp} ${secondOperand} =`;
                  display.textContent = res;
                  currentVal = String(res);
                  firstOperand = null;
                  pendingOp = null;
                  polyAudio.playSuccess();
                }
              } else if (btn.dataset.act === 'clear') {
                currentVal = '0';
                firstOperand = null;
                pendingOp = null;
                expr.textContent = '';
                display.textContent = '0';
              } else if (btn.dataset.act === 'sqrt') {
                currentVal = String(Math.sqrt(parseFloat(currentVal)));
                display.textContent = currentVal;
                polyAudio.playSuccess();
              } else if (btn.dataset.act === 'sq') {
                currentVal = String(Math.pow(parseFloat(currentVal), 2));
                display.textContent = currentVal;
                polyAudio.playSuccess();
              }
            });
          });
        }, 50);
        break;
    }
  }

  installStoreApp(appId, appName, appIcon) {
    this.installedApps.add(appId);
    polyAudio.playSuccess();
    this.notifyIsland(`🛍️ Installed ${appName} to Dock & Start Menu!`);

    // Dynamically inject into Dock
    const dockCenter = document.getElementById('dock-pinned-apps');
    if (dockCenter && !dockCenter.querySelector(`[data-app="${appId}"]`)) {
      const btn = document.createElement('button');
      btn.className = 'dock-item';
      btn.dataset.app = appId;
      btn.title = appName;
      btn.innerHTML = `
        <div class="dock-icon">${appIcon}</div>
        <span class="dot-indicator"></span>
        <span class="dock-item-tooltip">${appName}</span>
      `;
      btn.addEventListener('click', () => {
        polyAudio.playClick();
        this.launchApp(appId);
      });
      // Insert before settings
      const settingsBtn = dockCenter.querySelector('[data-app="settings"]');
      if (settingsBtn) {
        dockCenter.insertBefore(btn, settingsBtn);
      } else {
        dockCenter.appendChild(btn);
      }
    }

    // Dynamically inject into Start Menu
    const startGrid = document.querySelector('#start-menu .pinned-grid');
    if (startGrid && !startGrid.querySelector(`[data-launch="${appId}"]`)) {
      const item = document.createElement('div');
      item.className = 'grid-app';
      item.dataset.launch = appId;
      item.innerHTML = `<span>${appIcon}</span><label>${appName}</label>`;
      item.addEventListener('click', () => {
        polyAudio.playClick();
        this.launchApp(appId);
        document.getElementById('start-menu').classList.add('hidden');
      });
      const settingsGrid = startGrid.querySelector('[data-launch="settings"]');
      if (settingsGrid) {
        startGrid.insertBefore(item, settingsGrid);
      } else {
        startGrid.appendChild(item);
      }
    }
  }

  createWindow(title, icon, x, y, w, h, contentHtml, workspace = this.currentWorkspace) {
    const id = this.nextWindowId++;
    const win = new WindowInstance(id, title, icon, x, y, w, h, contentHtml, workspace);
    this.windows.set(id, win);
    this.focusWindow(id);
    this.updateDockIndicators();
    this.renderTaskbarWindowStrip();
    return win;
  }

  closeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;
    if (win.isMaximized) {
      this.exitImmersiveMode();
    }
    win.springScale.setTarget(0.85);
    win.springOpacity.setTarget(0.0);
    setTimeout(() => {
      if (win.element) win.element.remove();
      this.windows.delete(id);
      this.updateDockIndicators();
      this.renderTaskbarWindowStrip();
    }, 200);
  }

  minimizeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;
    if (win.isMaximized) {
      this.exitImmersiveMode();
    }
    win.isMinimized = true;
    win.springScale.setTarget(0.6);
    win.springOpacity.setTarget(0.0);
    this.updateDockIndicators();
    this.renderTaskbarWindowStrip();
    this.notifyIsland(`📦 Minimized ${win.title}`);
    polyAudio.playSpring();
  }

  focusWindow(id) {
    const targetWin = this.windows.get(id);
    if (targetWin && targetWin.workspace !== this.currentWorkspace) {
      this.switchWorkspace(targetWin.workspace);
    }
    this.activeWindowId = id;
    this.windows.forEach((w, wid) => {
      if (wid === id) {
        w.element.classList.add('focused');
        w.element.style.zIndex = 100;
        w.isFrozen = false;
        w.element.classList.remove('frozen');
        w.lastActiveTime = Date.now();
        const appTitleEl = document.getElementById('focused-app-name');
        if (appTitleEl) appTitleEl.textContent = w.title;
        if (w.isMaximized) {
          this.enterImmersiveMode(w.id);
        } else {
          this.exitImmersiveMode();
        }
      } else {
        w.element.classList.remove('focused');
        w.element.style.zIndex = 10;
      }
    });
    this.updateDockIndicators();
    this.renderTaskbarWindowStrip();
    setTimeout(() => {
      const activeBtn = document.querySelector(`.dock-item[data-window-id="${id}"]`) ||
                        document.querySelector('#dock-pinned-apps .dock-item.active');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }, 60);
  }

  enterImmersiveMode(id) {
    this.immersiveWindowId = id;
    document.body.classList.add('immersive-mode');
    document.body.classList.remove('dock-pos-bottom', 'dock-pos-left', 'dock-pos-right');
    document.body.classList.add(`dock-pos-${this.dockPos}`);
    const topBar = document.getElementById('top-bar');
    const dockContainer = document.getElementById('dock-container');
    if (topBar) topBar.classList.remove('revealed');
    if (dockContainer) dockContainer.classList.remove('revealed');

    // Reveal integrated traffic lights in top system bar
    const topbarControls = document.getElementById('topbar-window-controls');
    if (topbarControls) topbarControls.style.display = 'flex';
  }

  exitImmersiveMode() {
    this.immersiveWindowId = null;
    document.body.classList.remove('immersive-mode');
    const topBar = document.getElementById('top-bar');
    const dockContainer = document.getElementById('dock-container');
    if (topBar) topBar.classList.remove('revealed');
    if (dockContainer) dockContainer.classList.remove('revealed');

    // Hide integrated traffic lights in top system bar
    const topbarControls = document.getElementById('topbar-window-controls');
    if (topbarControls) topbarControls.style.display = 'none';
  }

  initImmersiveHoverListeners() {
    let topBarTimeout = null;
    let dockTimeout = null;
    const topBar = document.getElementById('top-bar');
    const dockContainer = document.getElementById('dock-container');

    // Top bar integrated window control buttons
    const topbarClose = document.getElementById('topbar-close-btn');
    if (topbarClose) {
      topbarClose.addEventListener('click', (e) => {
        e.stopPropagation();
        polyAudio.playClick();
        if (this.immersiveWindowId) {
          this.closeWindow(this.immersiveWindowId);
        } else if (this.activeWindowId) {
          this.closeWindow(this.activeWindowId);
        }
      });
    }

    const topbarMin = document.getElementById('topbar-min-btn');
    if (topbarMin) {
      topbarMin.addEventListener('click', (e) => {
        e.stopPropagation();
        polyAudio.playSpring();
        if (this.immersiveWindowId) {
          this.minimizeWindow(this.immersiveWindowId);
        } else if (this.activeWindowId) {
          this.minimizeWindow(this.activeWindowId);
        }
      });
    }

    const topbarRestore = document.getElementById('topbar-restore-btn');
    if (topbarRestore) {
      topbarRestore.addEventListener('click', (e) => {
        e.stopPropagation();
        polyAudio.playSpring();
        if (this.immersiveWindowId) {
          this.restoreMaximize(this.immersiveWindowId);
        } else if (this.activeWindowId) {
          this.restoreMaximize(this.activeWindowId);
        }
      });
    }

    window.addEventListener('mousemove', (e) => {
      if (!document.body.classList.contains('immersive-mode')) return;

      // 1. Top bar edge reveal: cursor within top 10px or hovering inside top-bar
      if (e.clientY <= 10) {
        clearTimeout(topBarTimeout);
        if (topBar) topBar.classList.add('revealed');
      } else if (e.clientY > 50 && !e.target.closest('#top-bar') && !document.querySelector('.system-menu-dropdown:not(.hidden)')) {
        clearTimeout(topBarTimeout);
        topBarTimeout = setTimeout(() => {
          if (topBar && !topBar.matches(':hover') && !document.querySelector('.system-menu-dropdown:not(.hidden)')) {
            topBar.classList.remove('revealed');
          }
        }, 250);
      }

      // 2. Dock edge reveal: cursor near dock edge
      if (this.dockPos === 'bottom') {
        if (e.clientY >= window.innerHeight - 12) {
          clearTimeout(dockTimeout);
          if (dockContainer) dockContainer.classList.add('revealed');
        } else if (e.clientY < window.innerHeight - 80 && !e.target.closest('#dock-container')) {
          clearTimeout(dockTimeout);
          dockTimeout = setTimeout(() => {
            if (dockContainer && !dockContainer.matches(':hover')) {
              dockContainer.classList.remove('revealed');
            }
          }, 250);
        }
      } else if (this.dockPos === 'left') {
        if (e.clientX <= 12) {
          clearTimeout(dockTimeout);
          if (dockContainer) dockContainer.classList.add('revealed');
        } else if (e.clientX > 80 && !e.target.closest('#dock-container')) {
          clearTimeout(dockTimeout);
          dockTimeout = setTimeout(() => {
            if (dockContainer && !dockContainer.matches(':hover')) {
              dockContainer.classList.remove('revealed');
            }
          }, 250);
        }
      } else if (this.dockPos === 'right') {
        if (e.clientX >= window.innerWidth - 12) {
          clearTimeout(dockTimeout);
          if (dockContainer) dockContainer.classList.add('revealed');
        } else if (e.clientX < window.innerWidth - 80 && !e.target.closest('#dock-container')) {
          clearTimeout(dockTimeout);
          dockTimeout = setTimeout(() => {
            if (dockContainer && !dockContainer.matches(':hover')) {
              dockContainer.classList.remove('revealed');
            }
          }, 250);
        }
      }
    });
  }

  restoreMaximize(id) {
    const win = this.windows.get(id);
    if (!win) return;
    win.isMaximized = false;
    win.snapZone = null;
    win.springX.setTarget(win.restoreBounds.x);
    win.springY.setTarget(win.restoreBounds.y);
    win.springW.setTarget(win.restoreBounds.w);
    win.springH.setTarget(win.restoreBounds.h);
    if (win.element) {
      win.element.classList.remove('maximized', 'snapped', 'snapped-left', 'snapped-right');
      win.element.style.position = 'absolute';
      win.element.style.top = '';
      win.element.style.left = '';
      win.element.style.right = '';
      win.element.style.bottom = '';
      win.element.style.borderRadius = '';
      win.element.style.border = '';
      win.element.style.boxShadow = '';
      win.element.style.margin = '';
      win.element.style.zIndex = '100';
      const maxBtn = win.element.querySelector('.btn-max');
      if (maxBtn) {
        maxBtn.title = "Aero Maximize / Full Screen";
        maxBtn.classList.remove('is-restore');
        maxBtn.textContent = "□";
      }
      const exitFsBtn = win.element.querySelector('.btn-exit-fullscreen');
      if (exitFsBtn) {
        exitFsBtn.innerHTML = '⤡ Exit Full Screen';
        exitFsBtn.title = "Exit Full Screen (Esc)";
      }
    }
    win.applyTransform();
    this.exitImmersiveMode();
    polyAudio.playSpring();
    this.notifyIsland(`🗗 Restored ${win.title}`);
  }

  toggleMaximize(id) {
    const win = this.windows.get(id);
    if (!win) return;
    if (win.isMaximized) {
      this.restoreMaximize(id);
    } else {
      this.applySnap(id, 'maximize');
    }
  }

  getWorkspaceBounds() {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const topBar = 38;
    const outerMargin = 16;
    const innerGap = 16;

    // Strict 16px clearance from screen edges, top status bar, and bottom dock
    let dockOccupiedBottom = 0;
    let dockOccupiedLeft = 0;
    let dockOccupiedRight = 0;

    const dockEl = document.getElementById('dock') || document.getElementById('dock-container');
    if (dockEl && !dockEl.classList.contains('hidden') && !document.body.classList.contains('immersive-mode')) {
      const rect = dockEl.getBoundingClientRect();
      if (this.dockPos === 'bottom') {
        dockOccupiedBottom = Math.max(0, screenH - rect.top);
      } else if (this.dockPos === 'left') {
        dockOccupiedLeft = Math.max(0, rect.right);
      } else if (this.dockPos === 'right') {
        dockOccupiedRight = Math.max(0, screenW - rect.left);
      }
    } else {
      if (this.dockPos === 'bottom') {
        dockOccupiedBottom = (this.dockMode === 'taskbar') ? 56 : 76;
      } else if (this.dockPos === 'left' || this.dockPos === 'right') {
        dockOccupiedLeft = 76;
      }
    }

    const availX = outerMargin + dockOccupiedLeft;
    const availY = topBar + outerMargin;
    const availW = screenW - (outerMargin * 2) - dockOccupiedLeft - dockOccupiedRight;
    const availH = screenH - topBar - outerMargin - dockOccupiedBottom - outerMargin;

    return { availX, availY, availW, availH, screenW, screenH, outerMargin, innerGap, gap: innerGap };
  }

  checkSnapZones(mouseX, mouseY) {
    const b = this.getWorkspaceBounds();
    const margin = 24;
    const corner = 90;
    const ghost = document.getElementById('snap-ghost');

    let zone = null;
    let gx = b.availX;
    let gy = b.availY;
    let gw = b.availW;
    let gh = b.availH;

    const colW = (b.availW - b.innerGap) / 2;
    const rowH = (b.availH - b.innerGap) / 2;

    if (mouseX <= margin && mouseY <= corner + 38) {
      zone = 'top-left';
      gx = b.availX;
      gy = b.availY;
      gw = colW;
      gh = rowH;
    } else if (mouseX >= b.screenW - margin && mouseY <= corner + 38) {
      zone = 'top-right';
      gx = b.availX + colW + b.innerGap;
      gy = b.availY;
      gw = colW;
      gh = rowH;
    } else if (mouseY <= 42) {
      zone = 'maximize';
      gx = 0;
      gy = 0;
      gw = b.screenW;
      gh = b.screenH;
    } else if (mouseX <= margin) {
      zone = 'left-half';
      gx = b.availX;
      gy = b.availY;
      gw = colW;
      gh = b.availH;
    } else if (mouseX >= b.screenW - margin) {
      zone = 'right-half';
      gx = b.availX + colW + b.innerGap;
      gy = b.availY;
      gw = colW;
      gh = b.availH;
    }

    this.activeSnapZone = zone;
    if (zone) {
      ghost.classList.remove('hidden');
      if (zone === 'maximize') {
        ghost.classList.add('snap-fullscreen');
      } else {
        ghost.classList.remove('snap-fullscreen');
      }
      ghost.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      ghost.style.width = `${gw}px`;
      ghost.style.height = `${gh}px`;
    } else {
      ghost.classList.add('hidden');
      ghost.classList.remove('snap-fullscreen');
    }
  }

  hideSnapGhost() {
    const ghost = document.getElementById('snap-ghost');
    if (ghost) {
      ghost.classList.add('hidden');
      ghost.classList.remove('snap-fullscreen');
    }
  }

  applySnap(id, zone) {
    const win = this.windows.get(id);
    if (!win) return;
    const b = this.getWorkspaceBounds();

    if (!win.isMaximized && !win.snapZone) {
      win.restoreBounds = {
        x: win.springX.current,
        y: win.springY.current,
        w: win.springW.current,
        h: win.springH.current
      };
    }

    win.snapZone = zone;
    polyAudio.playSnap();

    if (zone === 'maximize') {
      win.isMaximized = true;
      win.springX.setTarget(0);
      win.springY.setTarget(0);
      win.springW.setTarget(window.innerWidth);
      win.springH.setTarget(window.innerHeight);
      if (win.element) {
        win.element.classList.remove('snapped', 'snapped-left', 'snapped-right');
        win.element.classList.add('maximized');
        win.element.style.position = 'fixed';
        win.element.style.top = '0px';
        win.element.style.left = '0px';
        win.element.style.right = '0px';
        win.element.style.bottom = '0px';
        win.element.style.width = '100vw';
        win.element.style.height = '100vh';
        win.element.style.transform = 'none';
        win.element.style.borderRadius = '0px';
        win.element.style.border = 'none';
        win.element.style.boxShadow = 'none';
        win.element.style.margin = '0px';
        win.element.style.zIndex = '99999';
        const maxBtn = win.element.querySelector('.btn-max');
        if (maxBtn) {
          maxBtn.title = "Restore Down / Exit Full Screen (Esc)";
          maxBtn.classList.add('is-restore');
          maxBtn.textContent = "🗗";
        }
        const exitFsBtn = win.element.querySelector('.btn-exit-fullscreen');
        if (exitFsBtn) {
          exitFsBtn.innerHTML = '🗗 Restore Down <kbd style="font-size:10px; opacity:0.75; margin-left:4px;">Esc</kbd>';
          exitFsBtn.title = "Restore Down (Esc)";
        }
      }
      this.enterImmersiveMode(win.id);
      this.notifyIsland(`⤢ ${win.title} • 100% Immersive Full Screen (Esc to exit)`);
    } else {
      if (win.isMaximized) {
        win.isMaximized = false;
        if (win.element) {
          win.element.classList.remove('maximized');
          const maxBtn = win.element.querySelector('.btn-max');
          if (maxBtn) {
            maxBtn.title = "Aero Maximize / Full Screen";
            maxBtn.classList.remove('is-restore');
            maxBtn.textContent = "□";
          }
          const exitFsBtn = win.element.querySelector('.btn-exit-fullscreen');
          if (exitFsBtn) {
            exitFsBtn.innerHTML = '⤡ Exit Full Screen';
            exitFsBtn.title = "Exit Full Screen (Esc)";
          }
        }
        this.exitImmersiveMode();
      }

      if (win.element) {
        win.element.classList.add('snapped');
        win.element.classList.toggle('snapped-left', zone === 'left-half');
        win.element.classList.toggle('snapped-right', zone === 'right-half');
      }

      const colW = (b.availW - b.innerGap) / 2;
      const rowH = (b.availH - b.innerGap) / 2;

      if (zone === 'left-half') {
        win.springX.setTarget(b.availX);
        win.springY.setTarget(b.availY);
        win.springW.setTarget(colW);
        win.springH.setTarget(b.availH);
        this.notifyIsland('🪟 Left Split Snap (16px Margin & Gap)');
        setTimeout(() => this.triggerSnapAssist('right-half', win.id), 120);
      } else if (zone === 'right-half') {
        win.springX.setTarget(b.availX + colW + b.innerGap);
        win.springY.setTarget(b.availY);
        win.springW.setTarget(colW);
        win.springH.setTarget(b.availH);
        this.notifyIsland('🪟 Right Split Snap (16px Margin & Gap)');
        setTimeout(() => this.triggerSnapAssist('left-half', win.id), 120);
      } else if (zone === 'top-left') {
        this.closeSnapAssist();
        win.springX.setTarget(b.availX);
        win.springY.setTarget(b.availY);
        win.springW.setTarget(colW);
        win.springH.setTarget(rowH);
        this.notifyIsland('🪟 Top-Left Quarter Snap');
      } else if (zone === 'top-right') {
        this.closeSnapAssist();
        win.springX.setTarget(b.availX + colW + b.innerGap);
        win.springY.setTarget(b.availY);
        win.springW.setTarget(colW);
        win.springH.setTarget(rowH);
        this.notifyIsland('🪟 Top-Right Quarter Snap');
      } else if (zone === 'bottom-left') {
        this.closeSnapAssist();
        win.springX.setTarget(b.availX);
        win.springY.setTarget(b.availY + rowH + b.innerGap);
        win.springW.setTarget(colW);
        win.springH.setTarget(rowH);
        this.notifyIsland('🪟 Bottom-Left Quarter Snap');
      } else if (zone === 'bottom-right') {
        this.closeSnapAssist();
        win.springX.setTarget(b.availX + colW + b.innerGap);
        win.springY.setTarget(b.availY + rowH + b.innerGap);
        win.springW.setTarget(colW);
        win.springH.setTarget(rowH);
        this.notifyIsland('🪟 Bottom-Right Quarter Snap');
      } else {
        this.closeSnapAssist();
      }
    }
  }

  toggleExpose() {
    this.isExposeActive = !this.isExposeActive;
    const overlay = document.getElementById('expose-overlay');
    const grid = document.getElementById('expose-grid');

    if (this.isExposeActive) {
      overlay.classList.remove('hidden');
      grid.innerHTML = '';
      this.windows.forEach(w => {
        const card = document.createElement('div');
        card.className = 'expose-card';
        card.innerHTML = `
          <div class="expose-card-title">${w.icon} ${w.title}</div>
          <div style="font-size:11px; opacity:0.6;">PID: ${w.id + 100} • ${w.isFrozen ? 'Frozen in ZRAM' : 'Active'}</div>
          <div style="flex:1; margin-top:8px; background:rgba(0,0,0,0.25); border-radius:6px; display:flex; align-items:center; justify-content:center; color:#666;">
            Mini Preview
          </div>
        `;
        card.addEventListener('click', () => {
          this.focusWindow(w.id);
          this.toggleExpose();
        });
        grid.appendChild(card);
      });
      this.notifyIsland('🎴 App Exposé');
    } else {
      overlay.classList.add('hidden');
    }
  }

  updateDockIndicators() {
    document.querySelectorAll('.dock-item[data-app]').forEach(btn => {
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

  startProcessLifecycleDaemon() {
    // Simulates polyd background lifecycle and telemetry
    setInterval(() => {
      const now = Date.now();
      let activeCount = 0;
      let frozenCount = 0;
      let ramUsage = 180; // Base kernel + compositor

      const telemetryTable = document.getElementById('telemetry-table');
      if (telemetryTable) telemetryTable.innerHTML = '';

      this.windows.forEach(w => {
        const isCurrentActive = (w.id === this.activeWindowId);
        const elapsedInactive = (now - w.lastActiveTime) / 1000;
        const hasLease = w.title.includes('Music'); // Music player lease!

        if (isCurrentActive) {
          activeCount++;
          w.isFrozen = false;
          w.element.classList.remove('frozen');
          ramUsage += 42;
        } else if (!hasLease && elapsedInactive > 12) {
          frozenCount++;
          w.isFrozen = true;
          w.element.classList.add('frozen');
          ramUsage += 12; // ZRAM compressed!
        } else {
          activeCount++;
          w.isFrozen = false;
          w.element.classList.remove('frozen');
          ramUsage += 36;
        }

        if (telemetryTable) {
          const row = document.createElement('div');
          row.style.display = 'flex';
          row.style.justifyContent = 'space-between';
          row.innerHTML = `
            <span>${w.id + 100} • ${w.title.substring(0, 16)}</span>
            <span style="color:${w.isFrozen ? '#64d2ff' : '#30d158'}">${w.isFrozen ? 'FROZEN' : (hasLease ? 'LEASE' : 'ACTIVE')}</span>
            <span>${isCurrentActive ? 100 : (w.isFrozen ? 0 : 10)}</span>
            <span>${w.isFrozen ? '12 MB (zstd)' : '42 MB'}</span>
          `;
          telemetryTable.appendChild(row);
        }
      });

      // Calculate CPU load & Thermals based on powerMode & active windows
      const baseCpu = this.powerMode === 'turbo' ? 18 : (this.powerMode === 'low' ? 6 : 10);
      const jitter = Math.round(Math.sin(now / 2800) * 3);
      const computedCpu = Math.max(4, Math.min(96, baseCpu + activeCount * 4 + jitter));
      const computedHz = (this.powerMode === 'low') ? 60 : 120;
      const computedTemp = Math.round(38 + (computedCpu / 100) * 16);
      const computedState = computedTemp < 46 ? 'Optimal' : (computedTemp < 58 ? 'Normal' : 'Warm');

      // Update single source of truth in state management
      this.systemMetrics = {
        cpu: computedCpu,
        ramUsage,
        maxRam: 1024,
        activeCount,
        frozenCount,
        refreshRate: computedHz,
        temperature: computedTemp,
        thermalState: computedState
      };

      // Synchronize all UI metrics strictly from single source of truth
      this.syncSystemMetrics();
    }, 1200);
  }

  startRenderLoop() {
    let lastTime = performance.now();
    const frame = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      this.windows.forEach(w => {
        w.update(dt);
      });

      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  seedDefaultApps() {
    this.launchApp('files');
    setTimeout(() => this.launchApp('browser'), 150);
    setTimeout(() => this.launchApp('notes'), 300);
  }
}

// Global polyOS instance and resilient bootstrap
let polyOS = null;

function bootstrapPolyOS() {
  if (!window.polyOS) {
    polyOS = new PolyOS();
    window.polyOS = polyOS;
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootstrapPolyOS);
} else {
  bootstrapPolyOS();
}
