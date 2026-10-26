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
    this.dockPos = 'bottom';
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
    this.zram = {
      algorithm: localStorage.getItem('poly_zram_algo') || 'lz4',
      ratio: 3.24,
      ratioStr: '3.24x',
      origMb: 112.0,
      comprMb: 34.6,
      savingsMb: 77.4,
      savingsPercent: 69.1,
      isReal: false,
      device: '/sys/block/zram0'
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
    this.initGestureRecognizer();
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

    // If the targetZone already has an active snapped window, do not show Snap Assist
    const oppositeOccupied = Array.from(this.windows.values()).some(w => 
      w.id !== snappedWinId && 
      !w.isMinimized && 
      w.workspace === this.currentWorkspace && 
      w.snapZone === targetZone
    );
    if (oppositeOccupied) {
      this.closeSnapAssist();
      return;
    }

    const others = Array.from(this.windows.values()).filter(w => 
      w.id !== snappedWinId && 
      !w.isMinimized && 
      w.workspace === this.currentWorkspace &&
      w.snapZone !== targetZone
    );
    if (others.length === 0) {
      this.closeSnapAssist();
      return;
    }

    const b = this.getWorkspaceBounds();
    const colW = (b.availW - b.innerGap) / 2;

    overlay.style.top = `${b.screenAvailY}px`;
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
        this.closeSnapAssist();
        this.applySnap(id, targetZone, false);
        this.focusWindow(id);
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

    const b = this.getWorkspaceBounds();
    const rects = this.getFancyZonesRects();
    overlay.classList.remove('hidden');

    let activeIdx = null;
    rects.forEach((r, idx) => {
      const slotY = r.y + b.topBarH;
      if (mouseX >= r.x && mouseX <= r.x + r.w && mouseY >= slotY && mouseY <= slotY + r.h) {
        activeIdx = idx;
      }
    });

    this.activeFancyZoneIndex = activeIdx;

    container.innerHTML = rects.map((r, idx) => `
      <div class="fancyzone-slot ${idx === activeIdx ? 'active' : ''}" style="left:${r.x}px; top:${r.y + b.topBarH}px; width:${r.w}px; height:${r.h}px;">
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

    // Trigger Snap Assist for adjacent zones only if opposite is unoccupied
    if (layout === 'split') {
      const targetZone = zoneIndex === 0 ? 'right-half' : 'left-half';
      const oppositeOccupied = Array.from(this.windows.values()).some(w => 
        w.id !== win.id && 
        !w.isMinimized && 
        w.workspace === this.currentWorkspace && 
        w.snapZone === targetZone
      );
      if (!oppositeOccupied) {
        setTimeout(() => this.triggerSnapAssist(targetZone, win.id), 120);
      } else {
        this.closeSnapAssist();
      }
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

  initGestureRecognizer() {
    let touchState = {
      active: false,
      count: 0,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      startTime: 0,
      initialDistance: 0,
      currentDistance: 0,
      gestureTriggered: false,
      onDesktop: false
    };

    const getTouchDistance = (t1, t2) => Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    const getCenter = (t1, t2) => ({
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2
    });

    // 1. Multi-Touch Screen Listeners (iOS, Android, Surface, Touch Laptops)
    window.addEventListener('touchstart', (e) => {
      touchState.count = e.touches.length;
      touchState.gestureTriggered = false;
      touchState.startTime = Date.now();
      touchState.onDesktop = !e.target.closest('.window, #dock-container, #top-bar, #spotlight-modal');

      if (e.touches.length === 3) {
        // 3-Finger gesture setup (App Exposé / 3-finger swipe)
        touchState.active = true;
        touchState.startX = (e.touches[0].clientX + e.touches[1].clientX + e.touches[2].clientX) / 3;
        touchState.startY = (e.touches[0].clientY + e.touches[1].clientY + e.touches[2].clientY) / 3;
        touchState.currentX = touchState.startX;
        touchState.currentY = touchState.startY;
      } else if (e.touches.length === 2 && touchState.onDesktop) {
        // 2-Finger desktop gesture setup (Pinch widgets / 2-finger horizontal workspace switch)
        touchState.active = true;
        touchState.initialDistance = getTouchDistance(e.touches[0], e.touches[1]);
        touchState.currentDistance = touchState.initialDistance;
        const center = getCenter(e.touches[0], e.touches[1]);
        touchState.startX = center.x;
        touchState.startY = center.y;
        touchState.currentX = center.x;
        touchState.currentY = center.y;
      } else {
        touchState.active = false;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!touchState.active || touchState.gestureTriggered) return;

      if (e.touches.length === 3) {
        // Track 3-Finger movements
        const curX = (e.touches[0].clientX + e.touches[1].clientX + e.touches[2].clientX) / 3;
        const curY = (e.touches[0].clientY + e.touches[1].clientY + e.touches[2].clientY) / 3;
        const deltaX = curX - touchState.startX;
        const deltaY = curY - touchState.startY;

        // 3-Finger Swipe Up: Open App Exposé
        if (deltaY < -60 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
          touchState.gestureTriggered = true;
          if (!this.isExposeActive) {
            this.toggleExpose();
            polyAudio.playSnap();
            this.notifyIsland('🎴 3-Finger Swipe: App Exposé');
          }
        }
        // 3-Finger Swipe Down: Close Exposé or Show Desktop
        else if (deltaY > 60 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
          touchState.gestureTriggered = true;
          if (this.isExposeActive) {
            this.toggleExpose();
            polyAudio.playSnap();
            this.notifyIsland('🎴 Exposé Closed');
          } else {
            if (this.activeWindowId) {
              this.minimizeWindow(this.activeWindowId);
              this.notifyIsland('🖥️ 3-Finger Swipe: Desktop Revealed');
            }
          }
        }
        // 3-Finger Swipe Left: Switch to Desktop 2
        else if (deltaX < -70 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
          touchState.gestureTriggered = true;
          this.switchWorkspace(2);
          this.notifyIsland('🖥️ Swipe: Desktop 2');
        }
        // 3-Finger Swipe Right: Switch to Desktop 1
        else if (deltaX > 70 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
          touchState.gestureTriggered = true;
          this.switchWorkspace(1);
          this.notifyIsland('🖥️ Swipe: Desktop 1');
        }
      } else if (e.touches.length === 2 && touchState.onDesktop) {
        // Track 2-Finger desktop gestures: Pinch vs Horizontal Workspace Swipe
        const curDist = getTouchDistance(e.touches[0], e.touches[1]);
        const center = getCenter(e.touches[0], e.touches[1]);
        const deltaX = center.x - touchState.startX;
        const distRatio = curDist / (touchState.initialDistance || 1);

        // 2-Finger Pinch In (Zoom Out): Hide desktop widgets
        if (distRatio < 0.72 && Math.abs(distRatio - 1) > 0.25) {
          touchState.gestureTriggered = true;
          document.body.classList.add('desktop-widgets-hidden');
          polyAudio.playClick();
          this.notifyIsland('🧩 Pinch In: Desktop Widgets Hidden');
        }
        // 2-Finger Pinch Out (Spread): Show desktop widgets
        else if (distRatio > 1.35 && Math.abs(distRatio - 1) > 0.3) {
          touchState.gestureTriggered = true;
          document.body.classList.remove('desktop-widgets-hidden');
          polyAudio.playSuccess();
          this.notifyIsland('🧩 Pinch Out: Desktop Widgets Shown');
        }
        // 2-Finger Horizontal Swipe across desktop: Switch Workspaces
        else if (Math.abs(deltaX) > 80 && Math.abs(distRatio - 1) < 0.2) {
          touchState.gestureTriggered = true;
          if (deltaX < 0) {
            this.switchWorkspace(2);
          } else {
            this.switchWorkspace(1);
          }
        }
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      touchState.active = false;
      touchState.gestureTriggered = false;
    });

    window.addEventListener('touchcancel', () => {
      touchState.active = false;
      touchState.gestureTriggered = false;
    });

    // 2. Trackpad Pinch & Horizontal Scroll Gestures (Mac / Windows Precision Trackpad)
    let trackpadWheelAccumX = 0;
    let trackpadResetTimeout = null;

    window.addEventListener('wheel', (e) => {
      // A. Trackpad Pinch Gesture (Ctrl + Wheel) on desktop background
      if (e.ctrlKey) {
        const isOverDesktop = !e.target.closest('.window, #dock-container, #top-bar, #spotlight-modal');
        if (isOverDesktop) {
          e.preventDefault();
          clearTimeout(trackpadResetTimeout);
          trackpadResetTimeout = setTimeout(() => {
            if (e.deltaY > 0) {
              // Pinch In (Zoom out): Hide widgets
              document.body.classList.add('desktop-widgets-hidden');
              polyAudio.playClick();
              this.notifyIsland('🧩 Trackpad Pinch In: Widgets Hidden');
            } else if (e.deltaY < 0) {
              // Pinch Out (Zoom in): Show widgets
              document.body.classList.remove('desktop-widgets-hidden');
              polyAudio.playSuccess();
              this.notifyIsland('🧩 Trackpad Pinch Out: Widgets Shown');
            }
          }, 40);
          return;
        }
      }

      // B. Two-Finger Horizontal Trackpad Swipe on Desktop Background to Switch Workspaces
      const isOverDesktop = !e.target.closest('.window, #dock-container, #top-bar, .code-workspace, .notes-workspace, pre');
      if (isOverDesktop && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.5 && Math.abs(e.deltaX) > 15) {
        trackpadWheelAccumX += e.deltaX;
        clearTimeout(trackpadResetTimeout);

        if (trackpadWheelAccumX > 160) {
          trackpadWheelAccumX = 0;
          this.switchWorkspace(2);
        } else if (trackpadWheelAccumX < -160) {
          trackpadWheelAccumX = 0;
          this.switchWorkspace(1);
        }

        trackpadResetTimeout = setTimeout(() => {
          trackpadWheelAccumX = 0;
        }, 220);
      }
    }, { passive: false });
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

    // Windows-Style Magnetic Aero Snap Keyboard Shortcuts (Win + Arrows, Alt + Arrows, or Ctrl + Alt/Shift + Arrows)
    window.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;

      const isInput = e.target && (e.target.matches('input, textarea') || e.target.isContentEditable);
      
      // Supported Modifiers:
      // 1. Meta (Win key / Mac Cmd)
      // 2. Alt (Option on Mac)
      // 3. Ctrl + Alt or Ctrl + Shift
      // 4. Bare Ctrl (only when not inside a text editing field)
      const isSnapModifier = e.metaKey || e.altKey || (e.ctrlKey && e.shiftKey) || (!isInput && e.ctrlKey);
      if (!isSnapModifier) return;

      if (!this.activeWindowId) return;
      const win = this.windows.get(this.activeWindowId);
      if (!win || win.isMinimized) return;

      const zone = win.snapZone;
      const isMax = win.isMaximized;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) {
          this.applySnap(win.id, 'top-left');
        } else if (isMax) {
          this.applySnap(win.id, 'left-half');
        } else if (zone === 'right-half') {
          this.restoreMaximize(win.id);
        } else if (zone === 'top-right') {
          this.applySnap(win.id, 'top-left');
        } else if (zone === 'bottom-right') {
          this.applySnap(win.id, 'bottom-left');
        } else {
          this.applySnap(win.id, 'left-half');
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) {
          this.applySnap(win.id, 'top-right');
        } else if (isMax) {
          this.applySnap(win.id, 'right-half');
        } else if (zone === 'left-half') {
          this.restoreMaximize(win.id);
        } else if (zone === 'top-left') {
          this.applySnap(win.id, 'top-right');
        } else if (zone === 'bottom-left') {
          this.applySnap(win.id, 'bottom-right');
        } else {
          this.applySnap(win.id, 'right-half');
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (zone === 'left-half') {
          this.applySnap(win.id, 'top-left');
        } else if (zone === 'right-half') {
          this.applySnap(win.id, 'top-right');
        } else if (zone === 'bottom-left') {
          this.applySnap(win.id, 'left-half');
        } else if (zone === 'bottom-right') {
          this.applySnap(win.id, 'right-half');
        } else {
          this.applySnap(win.id, 'maximize');
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (isMax) {
          this.restoreMaximize(win.id);
        } else if (zone === 'top-left') {
          this.applySnap(win.id, 'bottom-left');
        } else if (zone === 'top-right') {
          this.applySnap(win.id, 'bottom-right');
        } else if (zone === 'left-half' || zone === 'right-half' || zone === 'bottom-left' || zone === 'bottom-right') {
          this.restoreMaximize(win.id);
        } else {
          this.minimizeWindow(win.id);
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
    const ghost = document.getElementById('desktop-grid-ghost');
    let activeCtxTarget = null;

    // Grid Parameters (Matches 88px icon width with clean gaps)
    const gridOriginX = 24;
    const gridOriginY = 56;
    const gridCellW = 96;
    const gridCellH = 104;

    const snapToGrid = (centerX, centerY) => {
      const maxRows = Math.max(1, Math.floor((window.innerHeight - gridOriginY - 80) / gridCellH));
      const maxCols = Math.max(1, Math.floor((window.innerWidth - gridOriginX - 24) / gridCellW));

      let col = Math.round((centerX - 44 - gridOriginX) / gridCellW);
      let row = Math.round((centerY - 47 - gridOriginY) / gridCellH);

      col = Math.max(0, Math.min(col, maxCols - 1));
      row = Math.max(0, Math.min(row, maxRows - 1));

      return {
        x: gridOriginX + col * gridCellW,
        y: gridOriginY + row * gridCellH,
        col,
        row
      };
    };

    // Load saved positions from localStorage
    const savedRaw = localStorage.getItem('poly_desktop_icons');
    let savedPositions = {};
    if (savedRaw) {
      try {
        savedPositions = JSON.parse(savedRaw) || {};
      } catch (e) {}
    }

    // Default icon arrangement (vertical columns from top to bottom)
    const positionMap = new Map();
    let defaultRow = 0;
    let defaultCol = 0;
    const maxRowsPerCol = Math.max(1, Math.floor((window.innerHeight - gridOriginY - 80) / gridCellH));

    desktopFiles.forEach(fileEl => {
      const fileName = fileEl.dataset.file;
      let pos = savedPositions[fileName];

      if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
        pos = {
          x: gridOriginX + defaultCol * gridCellW,
          y: gridOriginY + defaultRow * gridCellH,
          col: defaultCol,
          row: defaultRow
        };
        defaultRow++;
        if (defaultRow >= maxRowsPerCol) {
          defaultRow = 0;
          defaultCol++;
        }
      }

      fileEl.style.left = `${pos.x}px`;
      fileEl.style.top = `${pos.y}px`;
      positionMap.set(fileName, pos);
    });

    const savePositions = () => {
      const obj = {};
      positionMap.forEach((val, key) => { obj[key] = val; });
      localStorage.setItem('poly_desktop_icons', JSON.stringify(obj));
    };

    // Helper: Align all icons cleanly into a grid (Clean Up)
    const alignAllIconsToGrid = () => {
      const maxRows = Math.max(1, Math.floor((window.innerHeight - gridOriginY - 80) / gridCellH));
      let r = 0;
      let c = 0;

      desktopFiles.forEach(fileEl => {
        const fileName = fileEl.dataset.file;
        const targetX = gridOriginX + c * gridCellW;
        const targetY = gridOriginY + r * gridCellH;
        const newPos = { x: targetX, y: targetY, col: c, row: r };

        fileEl.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        fileEl.style.left = `${targetX}px`;
        fileEl.style.top = `${targetY}px`;
        positionMap.set(fileName, newPos);

        r++;
        if (r >= maxRows) {
          r = 0;
          c++;
        }
      });

      savePositions();
      polyAudio.playSuccess();
      this.notifyIsland('🧹 Desktop icons aligned to grid');
    };

    // Helper: Get nearest unoccupied slot (Prevents icons from stacking on top of each other)
    const getNearestFreeSlot = (targetCol, targetRow, currentFile) => {
      const occupied = new Set();
      positionMap.forEach((pos, key) => {
        if (key !== currentFile) {
          occupied.add(`${pos.col},${pos.row}`);
        }
      });

      if (!occupied.has(`${targetCol},${targetRow}`)) {
        return { col: targetCol, row: targetRow };
      }

      const maxR = Math.max(1, Math.floor((window.innerHeight - gridOriginY - 80) / gridCellH));
      const maxC = Math.max(1, Math.floor((window.innerWidth - gridOriginX - 24) / gridCellW));

      let bestDist = Infinity;
      let bestSlot = { col: targetCol, row: targetRow };

      for (let c = 0; c < maxC; c++) {
        for (let r = 0; r < maxR; r++) {
          if (!occupied.has(`${c},${r}`)) {
            const dist = Math.hypot(c - targetCol, r - targetRow);
            if (dist < bestDist) {
              bestDist = dist;
              bestSlot = { col: c, row: r };
            }
          }
        }
      }
      return bestSlot;
    };

    // Interactive Drag-and-Drop & Snap-to-Grid for Each Icon
    desktopFiles.forEach(fileEl => {
      const fileName = fileEl.dataset.file;

      fileEl.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Left click only
        e.stopPropagation();

        const rect = fileEl.getBoundingClientRect();
        const startMouseX = e.clientX;
        const startMouseY = e.clientY;
        const initialLeft = parseFloat(fileEl.style.left) || rect.left;
        const initialTop = parseFloat(fileEl.style.top) || rect.top;

        let isDragging = false;

        const onMouseMove = (ev) => {
          const deltaX = ev.clientX - startMouseX;
          const deltaY = ev.clientY - startMouseY;

          if (!isDragging && Math.hypot(deltaX, deltaY) > 4) {
            isDragging = true;
            fileEl.classList.add('is-dragging-desktop');
            desktopFiles.forEach(f => f.classList.remove('selected'));
            fileEl.classList.add('selected');
            if (ghost) ghost.classList.remove('hidden');
            polyAudio.playClick();
          }

          if (isDragging) {
            const newX = initialLeft + deltaX;
            const newY = initialTop + deltaY;
            fileEl.style.left = `${newX}px`;
            fileEl.style.top = `${newY}px`;

            // Update Snap Grid Ghost Preview
            const snapped = snapToGrid(newX + rect.width / 2, newY + rect.height / 2);
            if (ghost) {
              ghost.style.left = `${snapped.x}px`;
              ghost.style.top = `${snapped.y}px`;
            }

            // Highlight drop target if hovering over Files app
            const underPoint = document.elementFromPoint(ev.clientX, ev.clientY);
            const filesGrid = underPoint?.closest('#files-items-grid');
            document.querySelectorAll('.file-drop-zone-active').forEach(el => el.classList.remove('file-drop-zone-active'));
            if (filesGrid) {
              filesGrid.classList.add('file-drop-zone-active');
            }
          }
        };

        const onMouseUp = (ev) => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);

          if (isDragging) {
            fileEl.classList.remove('is-dragging-desktop');
            if (ghost) ghost.classList.add('hidden');

            // Check if dropped onto Files app
            const dropTarget = document.elementFromPoint(ev.clientX, ev.clientY);
            const filesGrid = dropTarget?.closest('#files-items-grid');
            if (filesGrid) {
              filesGrid.classList.remove('file-drop-zone-active');
              polyAudio.playSuccess();
              this.notifyIsland(`📥 Dropped ${fileName} into Files`);
              // Spring back to its original slot on desktop
              const prev = positionMap.get(fileName);
              if (prev) {
                fileEl.style.left = `${prev.x}px`;
                fileEl.style.top = `${prev.y}px`;
              }
              return;
            }

            // Snap to nearest free desktop grid cell
            const currentX = parseFloat(fileEl.style.left) || initialLeft;
            const currentY = parseFloat(fileEl.style.top) || initialTop;
            const preliminary = snapToGrid(currentX + rect.width / 2, currentY + rect.height / 2);
            const freeSlot = getNearestFreeSlot(preliminary.col, preliminary.row, fileName);
            const finalX = gridOriginX + freeSlot.col * gridCellW;
            const finalY = gridOriginY + freeSlot.row * gridCellH;

            fileEl.style.transition = 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)';
            fileEl.style.left = `${finalX}px`;
            fileEl.style.top = `${finalY}px`;

            positionMap.set(fileName, {
              x: finalX,
              y: finalY,
              col: freeSlot.col,
              row: freeSlot.row
            });

            savePositions();
            polyAudio.playSnap();
            this.notifyIsland(`📍 Positioned ${fileName}`);
          } else {
            // Normal click
            desktopFiles.forEach(f => f.classList.remove('selected'));
            fileEl.classList.add('selected');
            polyAudio.playClick();
          }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });

      fileEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.openQuickLook(fileName);
      });

      fileEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        desktopFiles.forEach(f => f.classList.remove('selected'));
        fileEl.classList.add('selected');
        activeCtxTarget = fileName;

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
        if (e.target.closest('.desktop-file') || e.target.closest('#dock-container') || e.target.closest('#top-bar') || e.target.closest('.window') || e.target.closest('.desktop-widget')) {
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
      alignAllIconsToGrid();
    });

    document.getElementById('ctx-trash')?.addEventListener('click', () => {
      ctxMenu?.classList.add('hidden');
      if (activeCtxTarget) {
        const fileEl = document.querySelector(`.desktop-file[data-file="${activeCtxTarget}"]`);
        if (fileEl) {
          fileEl.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
          fileEl.style.transform = 'scale(0) translateY(40px)';
          fileEl.style.opacity = '0';
          setTimeout(() => {
            fileEl.remove();
            positionMap.delete(activeCtxTarget);
            savePositions();
          }, 300);
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
        const fileName = selected.dataset.file;
        selected.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        selected.style.transform = 'scale(0) translateY(40px)';
        selected.style.opacity = '0';
        setTimeout(() => {
          selected.remove();
          positionMap.delete(fileName);
          savePositions();
        }, 300);
        this.notifyIsland(`🗑️ Deleted ${fileName}`);
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
      widget.addEventListener('click', (e) => {
        // If clicking the zram toggle pill, toggle algorithm directly
        if (e.target && e.target.id === 'widget-zram-pill') {
          e.stopPropagation();
          const targetAlgo = (this.zram.algorithm === 'lz4') ? 'zstd' : 'lz4';
          this.setZramAlgorithm(targetAlgo);
          return;
        }
        this.launchApp('telemetry');
        polyAudio.playClick();
      });
      widget.style.cursor = 'pointer';
      widget.title = 'Click to open Process Monitor';
    }

    this.fetchZramTelemetry();
    this.syncSystemMetrics();
  }

  async fetchZramTelemetry() {
    try {
      const resp = await fetch('/api/zram/stats');
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.ratio) {
          this.zram = {
            algorithm: data.algorithm || this.zram.algorithm,
            ratio: data.ratio,
            ratioStr: data.ratio_str || `${data.ratio.toFixed(2)}x`,
            origMb: data.orig_mb || 112.0,
            comprMb: data.compr_mb || 34.6,
            savingsMb: data.savings_mb || 77.4,
            savingsPercent: data.savings_percent || 69.1,
            isReal: data.is_real || false,
            device: data.device || '/sys/block/zram0'
          };
        }
      }
    } catch(e) {
      // Fallback calculation in offline mode
      const isLz4 = (this.zram.algorithm === 'lz4');
      const ratio = isLz4 ? 3.24 : 4.28;
      const frozenCount = Array.from(this.windows.values()).filter(w => w.isFrozen).length;
      const uncompr = 112.0 + frozenCount * 68.0;
      const compr = uncompr / ratio;
      this.zram.ratio = ratio;
      this.zram.ratioStr = `${ratio.toFixed(2)}x`;
      this.zram.origMb = Math.round(uncompr * 10) / 10;
      this.zram.comprMb = Math.round(compr * 10) / 10;
      this.zram.savingsMb = Math.round((uncompr - compr) * 10) / 10;
      this.zram.savingsPercent = Math.round((1 - compr / uncompr) * 1000) / 10;
    }
    this.updateZramUI();
  }

  async setZramAlgorithm(newAlgo) {
    newAlgo = newAlgo.toLowerCase().trim();
    if (newAlgo !== 'lz4' && newAlgo !== 'zstd') return;

    this.zram.algorithm = newAlgo;
    localStorage.setItem('poly_zram_algo', newAlgo);

    try {
      await fetch(`/api/zram/algorithm?set=${newAlgo}`);
    } catch(e) {}

    await this.fetchZramTelemetry();
    this.notifyIsland(`⚡ ZRAM backend: ${newAlgo.toUpperCase()} (${this.zram.ratioStr} ratio)`);
    polyAudio.playSuccess();
  }

  updateZramUI() {
    // 1. Desktop widget pill
    const widgetPill = document.getElementById('widget-zram-pill');
    if (widgetPill) {
      widgetPill.textContent = this.zram.algorithm === 'zstd' ? `📦 ZSTD ${this.zram.ratioStr}` : `⚡ LZ4 ${this.zram.ratioStr}`;
      widgetPill.className = `widget-zram-pill ${this.zram.algorithm === 'zstd' ? 'algo-zstd' : ''}`;
    }

    // 2. Settings Storage Tab (if open)
    const ratioBadge = document.getElementById('zram-ratio-badge');
    if (ratioBadge) {
      ratioBadge.textContent = `${this.zram.ratioStr} Ratio`;
      ratioBadge.style.color = this.zram.algorithm === 'zstd' ? '#d175ff' : '#30d158';
      ratioBadge.style.borderColor = this.zram.algorithm === 'zstd' ? 'rgba(191,90,242,0.4)' : 'rgba(48,209,88,0.3)';
      ratioBadge.style.background = this.zram.algorithm === 'zstd' ? 'rgba(191,90,242,0.15)' : 'rgba(48,209,88,0.15)';
    }

    const algoDesc = document.getElementById('zram-algo-desc');
    if (algoDesc) {
      algoDesc.textContent = this.zram.algorithm === 'zstd'
        ? 'ZSTD: Maximum compaction (4.3x ratio, 1.8ms) with high RAM savings'
        : 'LZ4: Ultra-low latency (0.4ms) with high real-time throughput';
    }

    const btnLz4 = document.getElementById('zram-btn-lz4');
    const btnZstd = document.getElementById('zram-btn-zstd');
    if (btnLz4 && btnZstd) {
      btnLz4.classList.toggle('active', this.zram.algorithm === 'lz4');
      btnZstd.classList.toggle('active', this.zram.algorithm === 'zstd');
    }

    const origVal = document.getElementById('zram-orig-val');
    if (origVal) origVal.textContent = `${this.zram.origMb.toFixed(1)} MB`;

    const comprVal = document.getElementById('zram-compr-val');
    if (comprVal) comprVal.textContent = `${this.zram.comprMb.toFixed(1)} MB`;

    const savedVal = document.getElementById('zram-saved-val');
    if (savedVal) savedVal.textContent = `${this.zram.savingsMb.toFixed(1)} MB (${this.zram.savingsPercent}%)`;

    const storageBarZram = document.getElementById('storage-bar-zram');
    if (storageBarZram) {
      const barPct = Math.max(5, Math.min(22, Math.round(this.zram.comprMb / 3.5)));
      storageBarZram.style.width = `${barPct}%`;
      storageBarZram.title = `ZRAM (${this.zram.algorithm.toUpperCase()}): ${this.zram.comprMb.toFixed(1)} MB used`;
    }

    const storageZramLabel = document.getElementById('storage-zram-label');
    if (storageZramLabel) {
      storageZramLabel.textContent = `🟢 ZRAM (${this.zram.ratioStr} ratio, ${this.zram.algorithm.toUpperCase()}): ${this.zram.comprMb.toFixed(1)} MB`;
    }

    // 3. Process Monitor Telemetry Header (if open)
    const procMonitorSummary = document.getElementById('telemetry-zram-summary');
    if (procMonitorSummary) {
      procMonitorSummary.innerHTML = `
        <span>ZRAM Backend: <strong style="color:${this.zram.algorithm === 'zstd' ? '#d175ff' : '#64d2ff'};">${this.zram.algorithm.toUpperCase()}</strong> (${this.zram.ratioStr})</span>
        <span>Compacted: <strong>${this.zram.comprMb.toFixed(1)} MB</strong> (saved ${this.zram.savingsMb.toFixed(1)} MB)</span>
      `;
    }
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

    const isCodeFile = /\.(rs|py|js|ts|html|md|toml|json)$/i.test(fileName) || fileName === 'physics.rs' || fileName === 'polyd.py' || fileName === 'shell.js' || fileName === 'daemon.rs';
    if (isCodeFile) {
      bodyEl.innerHTML += `
        <div style="display:flex; justify-content:flex-end; margin-top:14px;">
          <button id="ql-open-code-btn" style="background:linear-gradient(135deg, #0a84ff 0%, #0066cc 100%); color:#fff; border:none; padding:8px 18px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px; box-shadow:0 2px 10px rgba(10,132,255,0.35);">
            <span>💻</span> Open in Poly Code Studio
          </button>
        </div>
      `;
      setTimeout(() => {
        document.getElementById('ql-open-code-btn')?.addEventListener('click', () => {
          modal.classList.add('hidden');
          this.launchApp('code', fileName);
        });
      }, 50);
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

    // 2. Settings flyout popup toggle
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

    // 3. Right-click context menu on dock surface
    const dockEl = document.getElementById('dock');
    if (dockEl && popup) {
      dockEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        popup.classList.remove('hidden');
        popup.style.bottom = '84px';
        popup.style.left = `${Math.min(Math.max(e.clientX - 160, 20), window.innerWidth - 340)}px`;
        popup.style.right = 'auto';
        popup.style.top = 'auto';
      });
    }

    // 4. Segmented control handlers inside settings popup
    document.querySelectorAll('#pref-style .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setDockMode(btn.dataset.style);
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
        if (dockMiddle.scrollWidth > dockMiddle.clientWidth) {
          e.preventDefault();
          const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          dockMiddle.scrollLeft += delta;
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

  parseMarkdown(md) {
    if (!md || !md.trim()) {
      return '<div class="notes-empty-state"><span class="empty-icon">📝</span><h3>No notes yet</h3><p>Type markdown in the editor or click buttons on the toolbar to begin.</p></div>';
    }

    const formatInline = (str) => {
      if (!str) return '';
      let res = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return res
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_([^_]+)_/g, '<em>$1</em>')
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        .replace(/==(.*?)==/g, '<mark class="md-mark">$1</mark>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="md-link">$1</a>');
    };

    const renderTable = (tableLines) => {
      if (tableLines.length < 2) return tableLines.map(formatInline).join('<br>');
      const parseRow = (line) => line.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
      const headers = parseRow(tableLines[0]);
      const hasSeparator = /^\s*\|?\s*:?-+:?\s*\|/.test(tableLines[1]);
      const startIdx = hasSeparator ? 2 : 1;
      let html = '<div class="md-table-wrap"><table class="md-table"><thead><tr>';
      headers.forEach(h => { html += '<th>' + formatInline(h) + '</th>'; });
      html += '</tr></thead><tbody>';
      for (let i = startIdx; i < tableLines.length; i++) {
        html += '<tr>';
        parseRow(tableLines[i]).forEach(c => { html += '<td>' + formatInline(c) + '</td>'; });
        html += '</tr>';
      }
      html += '</tbody></table></div>';
      return html;
    };

    // 1. Extract fenced code blocks
    const codeBlocks = [];
    let processed = md.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const idx = codeBlocks.length;
      codeBlocks.push({
        lang: lang ? lang.trim() : 'code',
        code: code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      });
      return `@@CODE_BLOCK_${idx}@@`;
    });

    // 2. Extract inline code
    const inlineCodes = [];
    processed = processed.replace(/`([^`\n]+)`/g, (match, code) => {
      const idx = inlineCodes.length;
      inlineCodes.push(code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      return `@@INLINE_CODE_${idx}@@`;
    });

    const lines = processed.split('\n');
    const output = [];
    let inList = false;
    let listType = null;
    let inBlockquote = false;
    let blockquoteLines = [];
    let inTable = false;
    let tableLines = [];

    const closeList = () => {
      if (inList) {
        output.push(listType === 'ol' ? '</ol>' : '</ul>');
        inList = false;
        listType = null;
      }
    };

    const closeBlockquote = () => {
      if (inBlockquote) {
        output.push(`<blockquote class="md-blockquote">${blockquoteLines.map(formatInline).join('<br>')}</blockquote>`);
        inBlockquote = false;
        blockquoteLines = [];
      }
    };

    const closeTable = () => {
      if (inTable && tableLines.length > 0) {
        output.push(renderTable(tableLines));
        inTable = false;
        tableLines = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Table row
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        closeList();
        closeBlockquote();
        inTable = true;
        tableLines.push(line.trim());
        continue;
      } else {
        closeTable();
      }

      // Blockquote (> ...)
      if (/^>\s?(.*)/.test(line)) {
        closeList();
        closeTable();
        inBlockquote = true;
        blockquoteLines.push(line.replace(/^>\s?/, ''));
        continue;
      } else {
        closeBlockquote();
      }

      // Horizontal rule
      if (/^(---|---|\*\*\*|___)\s*$/.test(line)) {
        closeList();
        output.push('<hr class="notes-hr">');
        continue;
      }

      // Headings
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        closeList();
        const level = headingMatch[1].length;
        output.push(`<h${level} class="md-h${level}">${formatInline(headingMatch[2])}</h${level}>`);
        continue;
      }

      // Task list item (- [ ] or - [x])
      const taskMatch = line.match(/^(\s*)[-*]\s+\[([ xX])\]\s+(.*)$/);
      if (taskMatch) {
        if (!inList || listType !== 'ul') {
          closeList();
          inList = true;
          listType = 'ul';
          output.push('<ul class="md-task-list">');
        }
        const checked = taskMatch[2].toLowerCase() === 'x';
        const text = taskMatch[3];
        output.push(`
          <li class="md-task-item ${checked ? 'completed' : ''}">
            <label class="md-checkbox-label">
              <input type="checkbox" class="md-task-checkbox" data-line="${i}" ${checked ? 'checked' : ''}>
              <span class="md-checkbox-custom"></span>
              <span class="md-task-text">${formatInline(text)}</span>
            </label>
          </li>
        `);
        continue;
      }

      // Unordered list
      const ulMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
      if (ulMatch) {
        if (!inList || listType !== 'ul') {
          closeList();
          inList = true;
          listType = 'ul';
          output.push('<ul class="md-ul">');
        }
        output.push(`<li>${formatInline(ulMatch[2])}</li>`);
        continue;
      }

      // Ordered list
      const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
      if (olMatch) {
        if (!inList || listType !== 'ol') {
          closeList();
          inList = true;
          listType = 'ol';
          output.push('<ol class="md-ol">');
        }
        output.push(`<li>${formatInline(olMatch[2])}</li>`);
        continue;
      }

      closeList();

      if (line.trim() === '') {
        continue;
      }

      if (line.startsWith('@@CODE_BLOCK_')) {
        output.push(line);
        continue;
      }

      output.push(`<p class="md-p">${formatInline(line)}</p>`);
    }

    closeList();
    closeBlockquote();
    closeTable();

    let html = output.join('\n');

    // Restore Code Blocks
    html = html.replace(/@@CODE_BLOCK_(\d+)@@/g, (_, idx) => {
      const item = codeBlocks[idx];
      if (!item) return '';
      return `
        <div class="md-code-block">
          <div class="md-code-header">
            <span class="md-code-lang">${item.lang.toUpperCase()}</span>
            <button class="md-code-copy-btn" data-code="${encodeURIComponent(item.code.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'))}">Copy</button>
          </div>
          <pre><code class="language-${item.lang}">${item.code}</code></pre>
        </div>
      `;
    });

    // Restore Inline Code
    html = html.replace(/@@INLINE_CODE_(\d+)@@/g, (_, idx) => {
      const code = inlineCodes[idx];
      return `<code class="md-inline-code">${code}</code>`;
    });

    return html;
  }

  highlightCode(code, lang = 'javascript') {
    if (!code) return '';
    let escaped = String(code)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const tokens = [];
    const addToken = (html) => {
      const idx = tokens.length;
      tokens.push(html);
      return `___POLY_TOK_${idx}___`;
    };

    const l = (lang || '').toLowerCase();

    if (l === 'rust' || l === 'rs') {
      escaped = escaped.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, m => addToken(`<span class="tok-comment">${m}</span>`));
      escaped = escaped.replace(/(r#"(?:[\s\S]*?)"#|"(?:\\.|[^"\\])*")/g, m => addToken(`<span class="tok-string">${m}</span>`));
      escaped = escaped.replace(/\b([a-zA-Z_]\w*!)/g, m => addToken(`<span class="tok-macro">${m}</span>`));
      escaped = escaped.replace(/\b(pub|struct|impl|fn|let|mut|match|if|else|for|in|return|as|while|loop|break|continue|const|static|trait|enum|type|where|use|mod|crate|super|self|Self|async|await|dyn|unsafe)\b/g, '<span class="tok-keyword">$1</span>');
      escaped = escaped.replace(/\b(f32|f64|u8|u16|u32|u64|u128|usize|i8|i16|i32|i64|i128|isize|bool|char|str|String|Vec|Option|Result|Box|Rc|Arc|Some|None|Ok|Err)\b/g, '<span class="tok-type">$1</span>');
      escaped = escaped.replace(/\b\d+(\.\d+)?([eE][+-]?\d+)?(f32|f64|u32|i32|usize)?\b/g, '<span class="tok-number">$&</span>');
      escaped = escaped.replace(/\b(?!___POLY_TOK_)([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="tok-function">$1</span>');
    } else if (l === 'python' || l === 'py') {
      escaped = escaped.replace(/(#[^\n]*)/g, m => addToken(`<span class="tok-comment">${m}</span>`));
      escaped = escaped.replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|f"(?:\\.|[^"\\])*"|f'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, m => addToken(`<span class="tok-string">${m}</span>`));
      escaped = escaped.replace(/(@\w+)/g, '<span class="tok-macro">$1</span>');
      escaped = escaped.replace(/\b(def|class|import|from|return|if|elif|else|while|for|in|try|except|finally|with|as|lambda|yield|pass|break|continue|raise|global|nonlocal|assert|async|await|is|not|and|or)\b/g, '<span class="tok-keyword">$1</span>');
      escaped = escaped.replace(/\b(True|False|None|int|float|str|list|dict|set|tuple|bool|len|print|range|open|super|isinstance|enumerate|zip|any|all|min|max|sum)\b/g, '<span class="tok-type">$1</span>');
      escaped = escaped.replace(/\b\d+(\.\d+)?\b/g, '<span class="tok-number">$&</span>');
      escaped = escaped.replace(/\b(?!___POLY_TOK_)([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="tok-function">$1</span>');
    } else if (l === 'html' || l === 'xml') {
      escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, m => addToken(`<span class="tok-comment">${m}</span>`));
      escaped = escaped.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, m => addToken(`<span class="tok-string">${m}</span>`));
      escaped = escaped.replace(/\b([a-zA-Z0-9_-]+)(?==)/g, m => addToken(`<span class="tok-attr">${m}</span>`));
      escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9_-]+)/g, '<span class="tok-tag">$1</span>');
      escaped = escaped.replace(/(&gt;)/g, '<span class="tok-tag">$1</span>');
    } else if (l === 'markdown' || l === 'md') {
      escaped = escaped.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, m => addToken(`<span class="tok-macro">${m}</span>`));
      escaped = escaped.replace(/(^#{1,6}\s+[^\n]*)/gm, '<span class="tok-header">$1</span>');
      escaped = escaped.replace(/(\*\*.*?\*\*)/g, m => addToken(`<span class="tok-keyword">${m}</span>`));
      escaped = escaped.replace(/(\*.*?\*)/g, '<span class="tok-type">$1</span>');
      escaped = escaped.replace(/(^&gt;\s+[^\n]*)/gm, '<span class="tok-comment">$1</span>');
      escaped = escaped.replace(/(\[.*?\]\(.*?\))/g, '<span class="tok-string">$1</span>');
    } else {
      // Default: JavaScript / TypeScript / JSON
      escaped = escaped.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, m => addToken(`<span class="tok-comment">${m}</span>`));
      escaped = escaped.replace(/(`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, m => addToken(`<span class="tok-string">${m}</span>`));
      escaped = escaped.replace(/\b(const|let|var|function|return|if|else|for|while|switch|case|break|default|try|catch|finally|throw|new|class|extends|import|export|from|async|await|typeof|instanceof|in|of|this|void|delete|yield)\b/g, '<span class="tok-keyword">$1</span>');
      escaped = escaped.replace(/\b(true|false|null|undefined|NaN|Infinity|Array|Object|String|Number|Boolean|Promise|Map|Set|Math|JSON|console|window|document|setTimeout|setInterval|clearInterval)\b/g, '<span class="tok-type">$1</span>');
      escaped = escaped.replace(/\b\d+(\.\d+)?\b/g, '<span class="tok-number">$&</span>');
      escaped = escaped.replace(/\b(?!___POLY_TOK_)([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="tok-function">$1</span>');
    }

    return escaped.replace(/___POLY_TOK_(\d+)___/g, (_, id) => tokens[parseInt(id, 10)]);
  }

  launchApp(appName, initialParam = null) {
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

      case 'notes': {
        const defaultTitle = 'Poly OS Roadmap & Notes';
        const defaultContent = `# Poly OS Roadmap & Notes

> **Poly OS** combines Unix simplicity with iOS-level spring physics and modern frosted glass design.

## 🚀 Core Milestones
- [x] Fluid mass-spring-damper math implemented
- [x] Aero Snap & corner quarter tiling active
- [x] iOS-style dynamic dock and Windows taskbar toggle
- [x] Unified horizontal dock with multi-window grouping
- [x] Poly Settings with sleek custom scrollbars
- [ ] Native ARM64 & x86_64 bootable ISO build

## ⚡ Performance Matrix
| Subsystem | Engine | Target |
|---|---|---|
| UI Compositor | Rust + Smithay | 120 FPS |
| Window Physics | RK4 Spring Integration | < 0.5ms |
| Background Daemon | Linux cgroups v2 | 0% Idle CPU |
| Audio Server | PipeWire Low-Latency | 5.2ms |

## 💻 Interactive Code Example
\`\`\`rust
pub struct Spring1D {
    pub current: f32,
    pub target: f32,
    pub stiffness: f32, // 260.0
    pub damping: f32,   // 0.82
}
\`\`\`

## 📝 Developer Scratchpad
1. Test markdown live preview with checklists and tables
2. Toggle between **Edit**, **Split**, and **Preview** modes above
3. Click checkboxes right in the preview to toggle task status!`;

        const savedTitle = localStorage.getItem('poly_notes_title') || defaultTitle;
        const savedContent = localStorage.getItem('poly_notes_content') || defaultContent;
        const savedMode = localStorage.getItem('poly_notes_mode') || 'split';

        const notesWin = this.createWindow('Notes & Ideas', '📝', 240, 110, 720, 460, `
          <div class="notes-app-root">
            <!-- Top Control Bar -->
            <div class="notes-top-bar">
              <div class="notes-title-wrap">
                <span class="notes-title-icon">📝</span>
                <input type="text" class="notes-title-input" value="${savedTitle.replace(/"/g, '&quot;')}" placeholder="Note Title...">
              </div>
              
              <!-- View Mode Switcher -->
              <div class="notes-mode-switcher">
                <button class="seg-btn ${savedMode === 'edit' ? 'active' : ''}" data-mode="edit" title="Markdown Editor Only">✏️ Edit</button>
                <button class="seg-btn ${savedMode === 'split' ? 'active' : ''}" data-mode="split" title="Side-by-Side Live Preview">🌗 Split</button>
                <button class="seg-btn ${savedMode === 'preview' ? 'active' : ''}" data-mode="preview" title="Full Rendered Document">👁️ Preview</button>
              </div>

              <!-- Action Tools -->
              <div class="notes-action-tools">
                <button class="notes-action-btn notes-copy-btn" title="Copy Raw Markdown">📋 Copy</button>
                <button class="notes-action-btn notes-clear-btn" title="Reset to Sample Template">🔄 Reset</button>
              </div>
            </div>

            <!-- Quick Formatting Toolbar -->
            <div class="notes-format-toolbar">
              <button class="format-btn" data-action="bold" title="Bold (**text**)"><b>B</b></button>
              <button class="format-btn" data-action="italic" title="Italic (*text*)"><i>I</i></button>
              <button class="format-btn" data-action="heading" title="Heading (## )"><b>H</b></button>
              <button class="format-btn" data-action="code" title="Inline Code / Block"><code>&lt;/&gt;</code></button>
              <button class="format-btn" data-action="link" title="Hyperlink">🔗</button>
              <div class="notes-tb-divider"></div>
              <button class="format-btn" data-action="task" title="Interactive Task Checkbox">☑️ Task</button>
              <button class="format-btn" data-action="bullet" title="Bullet List">• List</button>
              <button class="format-btn" data-action="numbered" title="Numbered List">1. List</button>
              <button class="format-btn" data-action="quote" title="Blockquote">❝ Quote</button>
              <button class="format-btn" data-action="table" title="Insert Table">⊞ Table</button>
              <button class="format-btn" data-action="hr" title="Horizontal Divider">―</button>
            </div>

            <!-- Split Workspace (Editor + Live Preview) -->
            <div class="notes-workspace mode-${savedMode}">
              <!-- Editor Pane -->
              <div class="notes-editor-pane">
                <textarea class="notes-textarea" spellcheck="false" placeholder="Write markdown here (GFM supported)..."></textarea>
              </div>

              <!-- Live Rendered Markdown Preview Pane -->
              <div class="notes-preview-pane">
                <div class="notes-preview-scroll">
                  <div class="notes-preview-content markdown-body"></div>
                </div>
              </div>
            </div>

            <!-- Bottom Info & Word Count Bar -->
            <div class="notes-status-bar">
              <div class="notes-stats-left">
                <span class="notes-stat-words">0 words</span>
                <span class="notes-stat-sep">•</span>
                <span class="notes-stat-chars">0 characters</span>
                <span class="notes-stat-sep">•</span>
                <span class="notes-stat-tasks">0/0 completed</span>
              </div>
              <div class="notes-status-right">
                <span class="notes-save-badge">⚡ Auto-saved (Local)</span>
              </div>
            </div>
          </div>
        `);

        setTimeout(() => {
          if (!notesWin || !notesWin.element) return;
          const root = notesWin.element.querySelector('.notes-app-root');
          if (!root) return;

          const titleInput = root.querySelector('.notes-title-input');
          const textarea = root.querySelector('.notes-textarea');
          const previewScroll = root.querySelector('.notes-preview-scroll');
          const previewContent = root.querySelector('.notes-preview-content');
          const workspace = root.querySelector('.notes-workspace');
          const statWords = root.querySelector('.notes-stat-words');
          const statChars = root.querySelector('.notes-stat-chars');
          const statTasks = root.querySelector('.notes-stat-tasks');
          const copyBtn = root.querySelector('.notes-copy-btn');
          const resetBtn = root.querySelector('.notes-clear-btn');
          const modeBtns = root.querySelectorAll('.notes-mode-switcher .seg-btn');
          const formatBtns = root.querySelectorAll('.format-btn');

          textarea.value = savedContent;

          const updateStats = () => {
            const text = textarea.value;
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            const chars = text.length;
            const allTasks = (text.match(/[-*]\s+\[[ xX]\]/g) || []).length;
            const completedTasks = (text.match(/[-*]\s+\[[xX]\]/g) || []).length;

            if (statWords) statWords.textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
            if (statChars) statChars.textContent = `${chars} ${chars === 1 ? 'character' : 'characters'}`;
            if (statTasks) {
              if (allTasks > 0) {
                statTasks.style.display = 'inline';
                statTasks.textContent = `${completedTasks}/${allTasks} tasks completed`;
              } else {
                statTasks.style.display = 'none';
              }
            }
          };

          const updatePreview = () => {
            const md = textarea.value;
            previewContent.innerHTML = this.parseMarkdown(md);
            updateStats();
            localStorage.setItem('poly_notes_content', md);
          };

          // Initial render
          updatePreview();

          // Real-time typing input
          textarea.addEventListener('input', () => {
            updatePreview();
          });

          // Title change save
          if (titleInput) {
            titleInput.addEventListener('input', () => {
              localStorage.setItem('poly_notes_title', titleInput.value);
            });
          }

          // Keyboard Shortcuts in Textarea
          textarea.addEventListener('keydown', (e) => {
            // Tab key: indent with 2 spaces
            if (e.key === 'Tab') {
              e.preventDefault();
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
              textarea.selectionStart = textarea.selectionEnd = start + 2;
              updatePreview();
            }
            // Ctrl/Cmd + B: Bold
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
              e.preventDefault();
              applyFormat('bold');
            }
            // Ctrl/Cmd + I: Italic
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
              e.preventDefault();
              applyFormat('italic');
            }
          });

          // Interactive Checkboxes in Preview Pane
          previewContent.addEventListener('change', (e) => {
            if (e.target.classList.contains('md-task-checkbox')) {
              const lineIdx = parseInt(e.target.dataset.line, 10);
              const lines = textarea.value.split('\n');
              if (!isNaN(lineIdx) && lines[lineIdx] !== undefined) {
                if (e.target.checked) {
                  lines[lineIdx] = lines[lineIdx].replace(/(\s*[-*]\s+)\[\s*\]/, '$1[x]');
                } else {
                  lines[lineIdx] = lines[lineIdx].replace(/(\s*[-*]\s+)\[[xX]\]/, '$1[ ]');
                }
                textarea.value = lines.join('\n');
                updatePreview();
                if (window.polyAudio) polyAudio.playClick();
              }
            }
          });

          // Code block copy button
          previewContent.addEventListener('click', (e) => {
            const btn = e.target.closest('.md-code-copy-btn');
            if (btn && btn.dataset.code) {
              const raw = decodeURIComponent(btn.dataset.code);
              navigator.clipboard.writeText(raw).then(() => {
                btn.textContent = '✓ Copied!';
                if (window.polyAudio) polyAudio.playClick();
                setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
              });
            }
          });

          // Synchronized Scrolling in Split Mode
          let isSyncingEditor = false;
          let isSyncingPreview = false;
          textarea.addEventListener('scroll', () => {
            if (workspace.classList.contains('mode-split')) {
              if (isSyncingEditor) { isSyncingEditor = false; return; }
              isSyncingPreview = true;
              const maxEditor = textarea.scrollHeight - textarea.clientHeight;
              const maxPreview = previewScroll.scrollHeight - previewScroll.clientHeight;
              if (maxEditor > 0 && maxPreview > 0) {
                previewScroll.scrollTop = (textarea.scrollTop / maxEditor) * maxPreview;
              }
            }
          });
          previewScroll.addEventListener('scroll', () => {
            if (workspace.classList.contains('mode-split')) {
              if (isSyncingPreview) { isSyncingPreview = false; return; }
              isSyncingEditor = true;
              const maxEditor = textarea.scrollHeight - textarea.clientHeight;
              const maxPreview = previewScroll.scrollHeight - previewScroll.clientHeight;
              if (maxEditor > 0 && maxPreview > 0) {
                textarea.scrollTop = (previewScroll.scrollTop / maxPreview) * maxEditor;
              }
            }
          });

          // View Mode Switcher
          modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
              const mode = btn.dataset.mode;
              workspace.className = `notes-workspace mode-${mode}`;
              modeBtns.forEach(b => b.classList.toggle('active', b === btn));
              localStorage.setItem('poly_notes_mode', mode);
              if (window.polyAudio) polyAudio.playClick();
            });
          });

          // Formatting Toolbar Handlers
          const applyFormat = (action) => {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const val = textarea.value;
            const selected = val.substring(start, end);
            let replacement = '';
            let cursorOffset = 0;

            switch (action) {
              case 'bold':
                replacement = `**${selected || 'bold text'}**`;
                cursorOffset = selected ? replacement.length : 2;
                break;
              case 'italic':
                replacement = `*${selected || 'italic text'}*`;
                cursorOffset = selected ? replacement.length : 1;
                break;
              case 'heading': {
                const lineStart = val.lastIndexOf('\n', start - 1) + 1;
                const beforeLine = val.substring(0, lineStart);
                const afterLine = val.substring(lineStart);
                textarea.value = beforeLine + '## ' + afterLine;
                textarea.focus();
                textarea.setSelectionRange(start + 3, end + 3);
                updatePreview();
                if (window.polyAudio) polyAudio.playClick();
                return;
              }
              case 'code':
                if (selected.includes('\n')) {
                  replacement = `\`\`\`javascript\n${selected || '// code here'}\n\`\`\``;
                } else {
                  replacement = `\`${selected || 'code'}\``;
                }
                cursorOffset = selected ? replacement.length : 1;
                break;
              case 'link':
                replacement = `[${selected || 'Link Title'}](https://example.com)`;
                cursorOffset = replacement.length;
                break;
              case 'task': {
                const lineStart = val.lastIndexOf('\n', start - 1) + 1;
                const beforeLine = val.substring(0, lineStart);
                const afterLine = val.substring(lineStart);
                textarea.value = beforeLine + '- [ ] ' + afterLine;
                textarea.focus();
                textarea.setSelectionRange(start + 6, end + 6);
                updatePreview();
                if (window.polyAudio) polyAudio.playClick();
                return;
              }
              case 'bullet': {
                const lineStart = val.lastIndexOf('\n', start - 1) + 1;
                const beforeLine = val.substring(0, lineStart);
                const afterLine = val.substring(lineStart);
                textarea.value = beforeLine + '- ' + afterLine;
                textarea.focus();
                textarea.setSelectionRange(start + 2, end + 2);
                updatePreview();
                if (window.polyAudio) polyAudio.playClick();
                return;
              }
              case 'numbered': {
                const lineStart = val.lastIndexOf('\n', start - 1) + 1;
                const beforeLine = val.substring(0, lineStart);
                const afterLine = val.substring(lineStart);
                textarea.value = beforeLine + '1. ' + afterLine;
                textarea.focus();
                textarea.setSelectionRange(start + 3, end + 3);
                updatePreview();
                if (window.polyAudio) polyAudio.playClick();
                return;
              }
              case 'quote': {
                const lineStart = val.lastIndexOf('\n', start - 1) + 1;
                const beforeLine = val.substring(0, lineStart);
                const afterLine = val.substring(lineStart);
                textarea.value = beforeLine + '> ' + afterLine;
                textarea.focus();
                textarea.setSelectionRange(start + 2, end + 2);
                updatePreview();
                if (window.polyAudio) polyAudio.playClick();
                return;
              }
              case 'table':
                replacement = `\n| Component | Status | Target |\n|---|---|---|\n| Compositor | Active | 120 FPS |\n| Kernel IPC | Stable | Realtime |\n`;
                cursorOffset = replacement.length;
                break;
              case 'hr':
                replacement = `\n---\n`;
                cursorOffset = replacement.length;
                break;
            }

            if (replacement) {
              textarea.value = val.substring(0, start) + replacement + val.substring(end);
              textarea.focus();
              textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
              updatePreview();
              if (window.polyAudio) polyAudio.playClick();
            }
          };

          formatBtns.forEach(btn => {
            btn.addEventListener('click', () => {
              applyFormat(btn.dataset.action);
            });
          });

          // Copy Button
          if (copyBtn) {
            copyBtn.addEventListener('click', () => {
              navigator.clipboard.writeText(textarea.value).then(() => {
                copyBtn.textContent = '✓ Copied!';
                if (window.polyAudio) polyAudio.playClick();
                setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 1500);
              });
            });
          }

          // Reset Button
          if (resetBtn) {
            resetBtn.addEventListener('click', () => {
              if (confirm('Reset note to the default roadmap template?')) {
                textarea.value = defaultContent;
                if (titleInput) titleInput.value = defaultTitle;
                localStorage.setItem('poly_notes_title', defaultTitle);
                localStorage.setItem('poly_notes_content', defaultContent);
                updatePreview();
                if (window.polyAudio) polyAudio.playSpring();
              }
            });
          }
        }, 50);
        break;
      }

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
        this.createWindow('Process Monitor (polyd)', '⚡', 400, 160, 680, 420, `
          <div style="font-family:'JetBrains Mono', monospace; font-size:11px; height:100%; display:flex; flex-direction:column; gap:10px;">
            <!-- ZRAM Summary Banner & Algorithm Switcher -->
            <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
              <div id="telemetry-zram-summary" style="display:flex; gap:14px; font-size:11px; color:#aaa;">
                <span>ZRAM Backend: <strong style="color:${this.zram.algorithm === 'zstd' ? '#d175ff' : '#64d2ff'};">${this.zram.algorithm.toUpperCase()}</strong> (${this.zram.ratioStr})</span>
                <span>Compacted: <strong>${this.zram.comprMb.toFixed(1)} MB</strong> (saved ${this.zram.savingsMb.toFixed(1)} MB)</span>
              </div>
              <div style="display:flex; gap:4px;">
                <button class="seg-btn ${this.zram.algorithm === 'lz4' ? 'active' : ''}" id="proc-algo-lz4" style="padding:2px 8px; font-size:10px;">⚡ LZ4</button>
                <button class="seg-btn ${this.zram.algorithm === 'zstd' ? 'active' : ''}" id="proc-algo-zstd" style="padding:2px 8px; font-size:10px;">📦 ZSTD</button>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px; color:#888;">
              <span>PID / APP</span>
              <span>STATE</span>
              <span>CPU WEIGHT</span>
              <span>MEM (ZRAM)</span>
            </div>
            <div id="telemetry-table" style="display:flex; flex-direction:column; gap:6px; flex:1; overflow-y:auto;">
              <!-- Dynamically populated -->
            </div>
          </div>
        `);

        setTimeout(() => {
          document.getElementById('proc-algo-lz4')?.addEventListener('click', () => {
            this.setZramAlgorithm('lz4');
            document.getElementById('proc-algo-lz4')?.classList.add('active');
            document.getElementById('proc-algo-zstd')?.classList.remove('active');
          });
          document.getElementById('proc-algo-zstd')?.addEventListener('click', () => {
            this.setZramAlgorithm('zstd');
            document.getElementById('proc-algo-zstd')?.classList.add('active');
            document.getElementById('proc-algo-lz4')?.classList.remove('active');
          });
          this.updateZramUI();
        }, 50);
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
                    if (type === 'code' || /\.(rs|py|js|ts|html|md)$/i.test(name)) {
                      this.launchApp('code', name);
                    } else {
                      this.openQuickLook(name, type, size);
                    }
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
                <div class="settings-section-desc">Dynamic kernel memory compaction (/sys/block/zram0) and NVMe storage.</div>

                <div class="settings-card">
                  <div class="settings-label">
                    <span class="settings-label-title">NVMe Primary Drive (256 GB)</span>
                    <span class="settings-label-sub" id="storage-nvme-sub">28.4 GB Used • 227.6 GB Available</span>
                  </div>
                  <div class="storage-bar-container">
                    <div class="storage-segment storage-sys" style="width:15%;" title="Poly System (4.2 GB)"></div>
                    <div class="storage-segment storage-apps" style="width:28%;" title="Apps & User (12.4 GB)"></div>
                    <div class="storage-segment storage-zram" id="storage-bar-zram" style="width:12%;" title="ZRAM Compressed Cache"></div>
                    <div class="storage-segment storage-free" style="width:45%;" title="Free Space"></div>
                  </div>
                  <div style="display:flex; justify-content:space-between; font-size:11px; color:#aaa; margin-top:8px;">
                    <span>🟣 System: 4.2 GB</span>
                    <span>🔵 Apps: 12.4 GB</span>
                    <span id="storage-zram-label">🟢 ZRAM (${this.zram.ratioStr} ratio, ${this.zram.algorithm.toUpperCase()}): ${this.zram.comprMb.toFixed(1)} MB</span>
                  </div>
                </div>

                <!-- ZRAM In-Kernel Telemetry & Algorithm Selector Card -->
                <div class="settings-card" style="margin-top:14px;">
                  <div class="settings-row" style="align-items:flex-start;">
                    <div class="settings-label">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span class="settings-label-title">ZRAM Compression Backend</span>
                        <span class="zram-badge-live" id="zram-ratio-badge">${this.zram.ratioStr} Ratio</span>
                      </div>
                      <span class="settings-label-sub" id="zram-algo-desc">${this.zram.algorithm === 'zstd' ? 'ZSTD: Maximum compaction (4.3x ratio, 1.8ms) with high RAM savings' : 'LZ4: Ultra-low latency (0.4ms) with high real-time throughput'}</span>
                    </div>
                    <div class="seg-btn-group" id="zram-algo-selector">
                      <button class="seg-btn ${this.zram.algorithm === 'lz4' ? 'active' : ''}" data-algo="lz4" id="zram-btn-lz4">⚡ LZ4 (Fastest)</button>
                      <button class="seg-btn ${this.zram.algorithm === 'zstd' ? 'active' : ''}" data-algo="zstd" id="zram-btn-zstd">📦 ZSTD (Max Compaction)</button>
                    </div>
                  </div>

                  <!-- Live Kernel mm_stat Metrics Grid -->
                  <div class="zram-metrics-grid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin-top:14px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.08);">
                    <div class="zram-metric-item">
                      <div class="metric-title" style="font-size:10px; color:#888; text-transform:uppercase;">Uncompressed Cache</div>
                      <div class="metric-val" id="zram-orig-val" style="font-size:15px; font-weight:600; color:#fff; font-family:'JetBrains Mono',monospace;">${this.zram.origMb.toFixed(1)} MB</div>
                      <div class="metric-hint" style="font-size:10px; color:#666;">orig_data_size</div>
                    </div>
                    <div class="zram-metric-item">
                      <div class="metric-title" style="font-size:10px; color:#888; text-transform:uppercase;">Compressed In-RAM</div>
                      <div class="metric-val text-accent-cyan" id="zram-compr-val" style="font-size:15px; font-weight:600; font-family:'JetBrains Mono',monospace;">${this.zram.comprMb.toFixed(1)} MB</div>
                      <div class="metric-hint" style="font-size:10px; color:#666;">compr_data_size</div>
                    </div>
                    <div class="zram-metric-item">
                      <div class="metric-title" style="font-size:10px; color:#888; text-transform:uppercase;">RAM Saved (Compacted)</div>
                      <div class="metric-val text-accent-emerald" id="zram-saved-val" style="font-size:15px; font-weight:600; font-family:'JetBrains Mono',monospace;">${this.zram.savingsMb.toFixed(1)} MB (${this.zram.savingsPercent}%)</div>
                      <div class="metric-hint" style="font-size:10px; color:#666;" id="zram-device-path">/sys/block/zram0/mm_stat</div>
                    </div>
                  </div>

                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.06);">
                    <span style="font-size:11px; color:#888;">Proactive background task freezing via <code style="color:#64d2ff;">polyd.py</code></span>
                    <button class="seg-btn active" id="purge-cache-btn" style="padding:5px 12px; font-size:11px;">Free Inactive RAM</button>
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

          // ZRAM Algorithm Selector
          const zramBtnLz4 = root.querySelector('#zram-btn-lz4');
          const zramBtnZstd = root.querySelector('#zram-btn-zstd');
          if (zramBtnLz4) {
            zramBtnLz4.addEventListener('click', (e) => {
              e.stopPropagation();
              this.setZramAlgorithm('lz4');
            });
          }
          if (zramBtnZstd) {
            zramBtnZstd.addEventListener('click', (e) => {
              e.stopPropagation();
              this.setZramAlgorithm('zstd');
            });
          }
          this.updateZramUI();

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

      case 'code': {
        const existingCodeWin = Array.from(this.windows.values()).find(w => w.title === 'Poly Code Studio');
        if (existingCodeWin) {
          this.focusWindow(existingCodeWin.id);
          if (existingCodeWin.isMinimized) this.restoreWindow(existingCodeWin.id);
          if (initialParam && typeof window.polyCodeStudioSwitchFile === 'function') {
            window.polyCodeStudioSwitchFile(initialParam);
          }
          break;
        }

        const fileToOpenOnLaunch = initialParam;
        this.createWindow('Poly Code Studio', '💻', 180, 70, 920, 580, `
          <div class="code-editor-root" id="code-studio-root" style="display:flex; flex-direction:column; height:100%; position:relative;">
            <div class="code-tabs-bar">
              <div class="code-tabs-list" id="code-tabs-list"></div>
              <button class="code-tab-add" id="code-new-file-btn" title="Create New File (+)">+</button>
              <div class="code-top-actions">
                <span class="code-lang-pill" id="code-lang-indicator">🦀 Rust</span>
                <button id="run-code-btn" title="Execute Script (Ctrl+Enter)">
                  <span>▶</span> Run Script
                </button>
              </div>
            </div>
            <div class="code-workspace">
              <div class="code-lines" id="code-line-numbers"></div>
              <div class="code-editor-wrapper">
                <pre class="code-highlight-layer" id="code-highlight-layer" aria-hidden="true"><code id="code-highlight-content"></code></pre>
                <textarea class="code-textarea" id="code-editor-text" spellcheck="false" autocomplete="off" autocapitalize="off" wrap="off"></textarea>
              </div>
            </div>

            <!-- Bottom Left Status Bar Just Above Console -->
            <div class="code-status-bar" id="code-status-bar">
              <div class="code-status-left">
                <span class="code-cursor-pill" id="code-cursor-pos">Ln 1, Col 1</span>
                <span class="code-encoding-pill">UTF-8</span>
                <span class="code-indent-pill">Spaces: 2</span>
              </div>
              <div class="code-status-right">
                <span id="code-doc-stats">Ready</span>
              </div>
            </div>
            
            <!-- Interactive Console Output Drawer -->
            <div class="code-console-drawer" id="code-console-drawer">
              <div class="code-console-header">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="cursor:pointer; display:flex; align-items:center; gap:5px;" id="code-drawer-toggle" title="Toggle Console Drawer">
                    <span id="code-drawer-chevron">▼</span> Output Console & Sandbox
                  </span>
                  <span class="code-timing-badge" id="code-timing-badge">⏱️ 0.0ms</span>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                  <span id="code-status-pill" style="font-size:10px; color:#30d158; font-weight:600;">Ready</span>
                  <button id="clear-code-console" style="background:transparent; border:none; color:#888; cursor:pointer; font-size:11px; padding:2px 6px; border-radius:4px;">Clear</button>
                </div>
              </div>
              <div class="code-console-body" id="code-console-body">Poly Code Studio v2.0 (Monaco Engine) Sandbox Initialized.
Press 'Run Script' or press Ctrl+Enter to execute.</div>
            </div>
          </div>
        `);

        setTimeout(() => {
          const root = document.getElementById('code-studio-root');
          if (!root) return;

          const defaultFiles = {
            'physics.rs': {
              lang: 'rust',
              icon: '🦀',
              content: `// Poly OS Spring Physics Engine (Rust 2024 Edition)
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
}`
            },
            'polyd.py': {
              lang: 'python',
              icon: '🐍',
              content: `# Poly OS Background Process Lifecycle Daemon
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
    freeze_process(1042, "Poly Browser")`
            },
            'shell.js': {
              lang: 'javascript',
              icon: '⚡',
              content: `// Poly Shell Dynamic Island & Telemetry Routine
console.log("Poly Shell runtime loaded at 120 FPS.");

const metrics = {
  cpu: 14,
  ramMb: 218,
  hz: 120,
  thermal: "41°C (Optimal)"
};

console.log("Telemetry Sync Status:", JSON.stringify(metrics, null, 2));
console.log("Aero Snapping active. Mass-spring physics initialized.");`
            },
            'index.html': {
              lang: 'html',
              icon: '🌐',
              content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Poly OS Web View</title>
  <style>
    body { background: #0b0f19; color: #38bdf8; font-family: monospace; padding: 20px; }
    h1 { color: #58a6ff; }
  </style>
</head>
<body>
  <h1>⚡ Poly OS Web Interface</h1>
  <p>Hardware-accelerated WebGL compositing active.</p>
</body>
</html>`
            },
            'notes.md': {
              lang: 'markdown',
              icon: '📝',
              content: `# Poly OS Developer Notes
> High-performance microkernel architecture with fluid gestures.

## 🚀 Key Modules
- [x] Monaco & CodeMirror-class syntax engine
- [x] Synchronized line numbers gutter
- [x] Multi-tab buffer persistence
- [ ] Universal command palette spotlight`
            }
          };

          const getFileMeta = (name) => {
            const ext = name.split('.').pop().toLowerCase();
            if (ext === 'rs') return { lang: 'rust', icon: '🦀', label: 'Rust' };
            if (ext === 'py') return { lang: 'python', icon: '🐍', label: 'Python' };
            if (ext === 'js' || ext === 'ts') return { lang: 'javascript', icon: '⚡', label: 'JavaScript' };
            if (ext === 'html' || ext === 'htm') return { lang: 'html', icon: '🌐', label: 'HTML' };
            if (ext === 'md') return { lang: 'markdown', icon: '📝', label: 'Markdown' };
            if (ext === 'json') return { lang: 'javascript', icon: '⚙️', label: 'JSON' };
            if (ext === 'css') return { lang: 'html', icon: '🎨', label: 'CSS' };
            return { lang: 'javascript', icon: '📄', label: 'Text' };
          };

          let files = defaultFiles;
          try {
            const saved = localStorage.getItem('poly_code_files_v3');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                files = parsed;
              }
            }
          } catch (e) {}

          let currentFile = fileToOpenOnLaunch || localStorage.getItem('poly_code_active_file');
          if (fileToOpenOnLaunch) {
            if (!files[fileToOpenOnLaunch]) {
              const meta = getFileMeta(fileToOpenOnLaunch);
              files[fileToOpenOnLaunch] = {
                lang: meta.lang,
                icon: meta.icon,
                content: `// ${fileToOpenOnLaunch} loaded from Virtual File System\n`
              };
            }
            currentFile = fileToOpenOnLaunch;
          } else if (!files[currentFile]) {
            currentFile = Object.keys(files)[0] || 'physics.rs';
          }

          const tabsList = root.querySelector('#code-tabs-list');
          const textarea = root.querySelector('#code-editor-text');
          const highlightLayer = root.querySelector('#code-highlight-layer');
          const highlightCodeEl = root.querySelector('#code-highlight-content');
          const linesBox = root.querySelector('#code-line-numbers');
          const consoleBody = root.querySelector('#code-console-body');
          const statusPill = root.querySelector('#code-status-pill');
          const timingBadge = root.querySelector('#code-timing-badge');
          const langIndicator = root.querySelector('#code-lang-indicator');
          const cursorPos = root.querySelector('#code-cursor-pos');
          const runBtn = root.querySelector('#run-code-btn');
          const clearBtn = root.querySelector('#clear-code-console');
          const newFileBtn = root.querySelector('#code-new-file-btn');
          const drawerToggle = root.querySelector('#code-drawer-toggle');
          const drawerChevron = root.querySelector('#code-drawer-chevron');
          const consoleDrawer = root.querySelector('#code-console-drawer');

          const saveBuffers = () => {
            try {
              localStorage.setItem('poly_code_files_v3', JSON.stringify(files));
              localStorage.setItem('poly_code_active_file', currentFile);
            } catch (e) {}
          };

          const updateLines = () => {
            if (!textarea || !linesBox) return;
            const text = textarea.value;
            const lineCount = text.split('\n').length;
            const cursorIdx = textarea.selectionStart || 0;
            const activeLine = text.substring(0, cursorIdx).split('\n').length;

            let linesHtml = '';
            for (let i = 1; i <= lineCount; i++) {
              linesHtml += `<div class="code-gutter-line ${i === activeLine ? 'active' : ''}">${i}</div>`;
            }
            linesBox.innerHTML = linesHtml;

            // Update Ln & Col indicator
            const lastNl = text.lastIndexOf('\n', cursorIdx - 1);
            const col = cursorIdx - (lastNl === -1 ? 0 : lastNl + 1) + 1;
            if (cursorPos) {
              cursorPos.textContent = `Ln ${activeLine}, Col ${col}`;
            }
            const docStats = root.querySelector('#code-doc-stats');
            if (docStats) {
              docStats.textContent = `${lineCount} lines, ${text.length} chars`;
            }
          };

          const renderHighlight = () => {
            if (!textarea || !highlightCodeEl) return;
            const code = textarea.value;
            const meta = files[currentFile] || getFileMeta(currentFile);
            const highlighted = this.highlightCode(code, meta.lang || 'javascript');
            highlightCodeEl.innerHTML = highlighted + (code.endsWith('\n') ? ' ' : '');
            updateLines();
          };

          const syncScroll = () => {
            if (!textarea) return;
            if (highlightLayer) {
              highlightLayer.scrollTop = textarea.scrollTop;
              highlightLayer.scrollLeft = textarea.scrollLeft;
            }
            if (linesBox) {
              linesBox.scrollTop = textarea.scrollTop;
            }
          };

          textarea.addEventListener('scroll', syncScroll);

          const renderTabs = () => {
            if (!tabsList) return;
            tabsList.innerHTML = '';
            const fileNames = Object.keys(files);

            fileNames.forEach(fn => {
              const fileObj = files[fn];
              const meta = getFileMeta(fn);
              const tab = document.createElement('div');
              tab.className = `code-tab ${fn === currentFile ? 'active' : ''}`;
              tab.dataset.file = fn;

              const titleSpan = document.createElement('span');
              titleSpan.textContent = `${fileObj.icon || meta.icon} ${fn}`;
              tab.appendChild(titleSpan);

              if (fileNames.length > 1) {
                const closeBtn = document.createElement('span');
                closeBtn.className = 'code-tab-close';
                closeBtn.textContent = '×';
                closeBtn.title = `Close ${fn}`;
                closeBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  closeFile(fn);
                });
                tab.appendChild(closeBtn);
              }

              tab.addEventListener('click', () => switchFile(fn));
              tabsList.appendChild(tab);
            });
          };

          const switchFile = (fn) => {
            if (!files[fn]) return;
            if (currentFile && files[currentFile] && textarea) {
              files[currentFile].content = textarea.value;
            }
            currentFile = fn;
            const meta = getFileMeta(fn);
            if (!files[fn].lang) files[fn].lang = meta.lang;
            if (!files[fn].icon) files[fn].icon = meta.icon;

            if (langIndicator) {
              langIndicator.textContent = `${meta.icon} ${meta.label}`;
            }

            if (textarea) {
              textarea.value = files[fn].content || '';
              textarea.focus();
            }

            renderTabs();
            renderHighlight();
            syncScroll();
            saveBuffers();
          };

          window.polyCodeStudioSwitchFile = (fn) => {
            if (!files[fn]) {
              const meta = getFileMeta(fn);
              files[fn] = {
                lang: meta.lang,
                icon: meta.icon,
                content: `// ${fn} loaded from Virtual File System\n`
              };
            }
            switchFile(fn);
            this.notifyIsland(`💻 Loaded ${fn} in Code Studio`);
          };

          const closeFile = (fn) => {
            if (Object.keys(files).length <= 1) return;
            delete files[fn];
            if (currentFile === fn) {
              currentFile = Object.keys(files)[0];
            }
            switchFile(currentFile);
          };

          // Auto-close pairs & Tab indentation conveniences
          const pairs = {
            '(': ')',
            '[': ']',
            '{': '}',
            '"': '"',
            "'": "'",
            '`': '`'
          };
          const closers = [')', ']', '}', '"', "'", '`'];

          textarea.addEventListener('keydown', (e) => {
            // Ctrl+Enter or Cmd+Enter -> Run
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              if (runBtn) runBtn.click();
              return;
            }

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const val = textarea.value;

            // Tab key indentation
            if (e.key === 'Tab') {
              e.preventDefault();
              if (e.shiftKey) {
                // Outdent
                const lineStart = val.lastIndexOf('\n', start - 1) + 1;
                if (val.substr(lineStart, 2) === '  ') {
                  textarea.value = val.substring(0, lineStart) + val.substring(lineStart + 2);
                  textarea.selectionStart = Math.max(lineStart, start - 2);
                  textarea.selectionEnd = Math.max(lineStart, end - 2);
                  textarea.dispatchEvent(new Event('input'));
                }
              } else {
                // Indent 2 spaces
                textarea.value = val.substring(0, start) + '  ' + val.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 2;
                textarea.dispatchEvent(new Event('input'));
              }
              return;
            }

            // Auto-close opening bracket or quote
            if (pairs[e.key]) {
              e.preventDefault();
              const openChar = e.key;
              const closeChar = pairs[openChar];
              const selected = val.substring(start, end);
              textarea.value = val.substring(0, start) + openChar + selected + closeChar + val.substring(end);
              textarea.selectionStart = start + 1;
              textarea.selectionEnd = end + 1;
              textarea.dispatchEvent(new Event('input'));
              return;
            }

            // Skip over closing bracket if next char is identical
            if (closers.includes(e.key) && start === end && val[start] === e.key) {
              e.preventDefault();
              textarea.selectionStart = textarea.selectionEnd = start + 1;
              updateLines();
              return;
            }

            // Backspace empty pair
            if (e.key === 'Backspace' && start === end && start > 0) {
              const prev = val[start - 1];
              const next = val[start];
              if (pairs[prev] && pairs[prev] === next) {
                e.preventDefault();
                textarea.value = val.substring(0, start - 1) + val.substring(start + 1);
                textarea.selectionStart = textarea.selectionEnd = start - 1;
                textarea.dispatchEvent(new Event('input'));
                return;
              }
            }
          });

          textarea.addEventListener('input', () => {
            if (files[currentFile]) {
              files[currentFile].content = textarea.value;
            }
            renderHighlight();
            saveBuffers();
          });

          textarea.addEventListener('click', updateLines);
          textarea.addEventListener('keyup', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
              updateLines();
            }
          });

          // Drawer toggle
          if (drawerToggle && consoleDrawer) {
            drawerToggle.addEventListener('click', () => {
              const isCollapsed = consoleDrawer.classList.toggle('collapsed');
              if (drawerChevron) drawerChevron.textContent = isCollapsed ? '▲' : '▼';
            });
          }

          // Clear console
          if (clearBtn) {
            clearBtn.addEventListener('click', () => {
              if (consoleBody) consoleBody.textContent = '';
            });
          }

          // New File creation modal
          if (newFileBtn) {
            newFileBtn.addEventListener('click', () => {
              const existingModal = root.querySelector('#code-new-file-modal');
              if (existingModal) existingModal.remove();

              const overlay = document.createElement('div');
              overlay.className = 'code-modal-overlay';
              overlay.id = 'code-new-file-modal';
              overlay.innerHTML = `
                <div class="code-modal-card">
                  <h4>📄 Create New File</h4>
                  <input type="text" class="code-modal-input" id="new-file-name-input" placeholder="e.g. app.js, worker.py, ui.html" value="script.js">
                  <div class="code-modal-btns">
                    <button class="code-modal-btn cancel" id="cancel-new-file">Cancel</button>
                    <button class="code-modal-btn confirm" id="confirm-new-file">Create</button>
                  </div>
                </div>
              `;
              root.appendChild(overlay);

              const input = overlay.querySelector('#new-file-name-input');
              const cancelBtn = overlay.querySelector('#cancel-new-file');
              const confirmBtn = overlay.querySelector('#confirm-new-file');

              input.focus();
              input.select();

              const closeModal = () => overlay.remove();

              const doCreate = () => {
                let name = input.value.trim();
                if (!name) name = 'untitled.js';
                if (!name.includes('.')) name += '.js';

                if (!files[name]) {
                  const meta = getFileMeta(name);
                  let initialContent = `// ${name}\nconsole.log("Initialized ${name}");\n`;
                  if (meta.lang === 'rust') {
                    initialContent = `// ${name} (Rust Module)\npub fn run() {\n    println!("Hello from ${name}!");\n}\n`;
                  } else if (meta.lang === 'python') {
                    initialContent = `# ${name} (Python Module)\nprint("Hello from ${name}!")\n`;
                  } else if (meta.lang === 'html') {
                    initialContent = `<!DOCTYPE html>\n<html>\n<head>\n  <title>${name}</title>\n</head>\n<body>\n  <h2>${name}</h2>\n</body>\n</html>\n`;
                  } else if (meta.lang === 'markdown') {
                    initialContent = `# ${name}\n\nStart writing notes here...\n`;
                  }

                  files[name] = {
                    lang: meta.lang,
                    icon: meta.icon,
                    content: initialContent
                  };
                }

                closeModal();
                switchFile(name);
                this.notifyIsland(`📄 Created ${name}`);
                polyAudio.playClick();
              };

              cancelBtn.addEventListener('click', closeModal);
              confirmBtn.addEventListener('click', doCreate);
              input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') doCreate();
                if (e.key === 'Escape') closeModal();
              });
            });
          }

          // Initial load
          switchFile(currentFile);

          // Run Script Action
          if (runBtn) {
            runBtn.addEventListener('click', () => {
              const meta = getFileMeta(currentFile);
              if (statusPill) {
                statusPill.textContent = 'Running...';
                statusPill.style.color = '#ff9f0a';
              }

              const t0 = performance.now();

              setTimeout(() => {
                const now = new Date().toLocaleTimeString();
                const code = textarea.value;
                let hasError = false;

                if (meta.lang === 'javascript') {
                  let capturedLogs = [];
                  const originalLog = console.log;
                  const originalInfo = console.info;
                  const originalWarn = console.warn;
                  const originalError = console.error;

                  console.log = (...args) => capturedLogs.push('[LOG] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
                  console.info = (...args) => capturedLogs.push('[INFO] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
                  console.warn = (...args) => capturedLogs.push('[WARN] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
                  console.error = (...args) => capturedLogs.push('[ERROR] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));

                  try {
                    const result = new Function(code)();
                    const evalOutput = capturedLogs.length > 0 ? capturedLogs.join('\n') : '(Script finished with no console output)';
                    const returnStr = result !== undefined ? `\n[Return Value]: ${JSON.stringify(result)}` : '';
                    consoleBody.textContent += `\n[${now}] === Executed ${currentFile} (Isolated Sandbox) ===\n${evalOutput}${returnStr}\n`;
                  } catch (err) {
                    hasError = true;
                    consoleBody.textContent += `\n[${now}] [Runtime Error in ${currentFile}]: ${err.message}\n${err.stack || ''}\n`;
                  } finally {
                    console.log = originalLog;
                    console.info = originalInfo;
                    console.warn = originalWarn;
                    console.error = originalError;
                  }
                } else if (meta.lang === 'rust') {
                  consoleBody.textContent += `\n[${now}] [rustc 1.82.0-nightly (poly-musl)] Compiling ${currentFile}...
   Compiling poly-physics v0.9.8 (/workspace/poly-compositor)
    Opt-Level: 3 (120Hz VSync target)
    Finished release [optimized] target(s) in 0.016s
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
Spring reached target in 8 frames (66.6ms)!
Process finished with exit code 0.`;
                } else if (meta.lang === 'python') {
                  consoleBody.textContent += `\n[${now}] [python3 ${currentFile}] (Python 3.12.3 PolyOS Runtime)
Poly Daemon (polyd) active at 120Hz VSync loop.
[polyd] Inactivity threshold reached for Poly Browser (PID: 1042)
[polyd] Writing '1' to /sys/fs/cgroup/poly/cgroup.freeze...
[polyd] Process 1042 successfully FROZEN. CPU weight -> 0%. ZRAM pool locked.
[polyd] 4 active cgroup subtrees monitored [OK]
Process finished with exit code 0.`;
                } else if (meta.lang === 'html') {
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(code, 'text/html');
                  const errorNode = doc.querySelector('parsererror');
                  if (errorNode) {
                    hasError = true;
                    consoleBody.textContent += `\n[${now}] [HTML Syntax Error]: ${errorNode.textContent}\n`;
                  } else {
                    const tagCount = doc.querySelectorAll('*').length;
                    consoleBody.textContent += `\n[${now}] [HTML5 Sandbox Validator] ${currentFile}:
✓ Document Title: "${doc.title || 'Untitled'}"
✓ DOM Elements: ${tagCount} tags parsed
✓ Valid HTML5 Structure: Confirmed
✓ Sandbox Render Test: Passed without layout violations.`;
                  }
                } else if (meta.lang === 'markdown') {
                  const words = code.trim().split(/\s+/).filter(Boolean).length;
                  const chars = code.length;
                  const lines = code.split('\n').length;
                  const taskCount = (code.match(/\[([ xX])\]/g) || []).length;
                  const doneTasks = (code.match(/\[([xX])\]/g) || []).length;
                  consoleBody.textContent += `\n[${now}] [Poly Markdown Engine] Analyzed ${currentFile}:
✓ Document Length: ${lines} lines, ${words} words, ${chars} chars
✓ Checklists: ${doneTasks}/${taskCount} tasks completed
✓ Structure: Markdown AST validated and ready for Live Preview.`;
                } else {
                  consoleBody.textContent += `\n[${now}] Executed ${currentFile} (${code.length} bytes processed). [OK]`;
                }

                const elapsed = Math.max(0.5, performance.now() - t0).toFixed(1);
                if (timingBadge) {
                  timingBadge.textContent = `⏱️ ${elapsed}ms`;
                }

                if (statusPill) {
                  if (hasError) {
                    statusPill.textContent = 'Runtime Error';
                    statusPill.style.color = '#ff453a';
                  } else {
                    statusPill.textContent = 'Success (0 Errors)';
                    statusPill.style.color = '#30d158';
                  }
                }

                consoleBody.scrollTop = consoleBody.scrollHeight;
                if (!hasError) {
                  this.notifyIsland(`💻 ${currentFile} executed (${elapsed}ms)!`);
                  polyAudio.playSuccess();
                } else {
                  this.notifyIsland(`⚠️ Error running ${currentFile}`);
                }
              }, 70);
            });
          }
        }, 50);
        break;
      }

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

      // 2. Dock edge reveal: cursor near bottom dock edge
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
    this.closeSnapAssist();
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
    const topBarEl = document.getElementById('top-bar');
    const topBarH = (topBarEl && !document.body.classList.contains('immersive-mode')) ? topBarEl.offsetHeight : 40;
    const outerMargin = 8;
    const innerGap = 6;
    const bottomGap = 4;

    let dockOccupiedBottom = 0;
    const dockEl = document.getElementById('dock') || document.getElementById('dock-container');
    if (dockEl && !dockEl.classList.contains('hidden') && !document.body.classList.contains('immersive-mode')) {
      const rect = dockEl.getBoundingClientRect();
      dockOccupiedBottom = Math.max(0, screenH - rect.top);
    } else {
      dockOccupiedBottom = (this.dockMode === 'taskbar') ? 52 : 68;
    }

    const availX = outerMargin;
    const availY = 0; // Flush with upper taskbar (0px gap!)
    const availW = screenW - (outerMargin * 2);
    const availH = (screenH - topBarH) - dockOccupiedBottom - bottomGap;
    const screenAvailY = topBarH + availY;

    return { 
      availX, 
      availY, 
      availW, 
      availH, 
      screenW, 
      screenH, 
      topBarH, 
      screenAvailY, 
      outerMargin, 
      innerGap, 
      gap: innerGap 
    };
  }

  checkSnapZones(mouseX, mouseY) {
    const b = this.getWorkspaceBounds();
    const margin = 24;
    const corner = 90;
    const ghost = document.getElementById('snap-ghost');

    let zone = null;
    let gx = b.availX;
    let gy = b.screenAvailY;
    let gw = b.availW;
    let gh = b.availH;

    const colW = (b.availW - b.innerGap) / 2;
    const rowH = (b.availH - b.innerGap) / 2;

    if (mouseX <= margin && mouseY <= corner + 38) {
      zone = 'top-left';
      gx = b.availX;
      gy = b.screenAvailY;
      gw = colW;
      gh = rowH;
    } else if (mouseX >= b.screenW - margin && mouseY <= corner + 38) {
      zone = 'top-right';
      gx = b.availX + colW + b.innerGap;
      gy = b.screenAvailY;
      gw = colW;
      gh = rowH;
    } else if (mouseX <= margin && mouseY >= b.screenH - corner - 50) {
      zone = 'bottom-left';
      gx = b.availX;
      gy = b.screenAvailY + rowH + b.innerGap;
      gw = colW;
      gh = rowH;
    } else if (mouseX >= b.screenW - margin && mouseY >= b.screenH - corner - 50) {
      zone = 'bottom-right';
      gx = b.availX + colW + b.innerGap;
      gy = b.screenAvailY + rowH + b.innerGap;
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
      gy = b.screenAvailY;
      gw = colW;
      gh = b.availH;
    } else if (mouseX >= b.screenW - margin) {
      zone = 'right-half';
      gx = b.availX + colW + b.innerGap;
      gy = b.screenAvailY;
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

  applySnap(id, zone, triggerAssist = true) {
    const win = this.windows.get(id);
    if (!win) return;

    // Normalize zone aliases (support 'left', 'right', 'top', 'maximize')
    if (zone === 'left') zone = 'left-half';
    if (zone === 'right') zone = 'right-half';
    if (zone === 'top') zone = 'maximize';

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
        this.notifyIsland('🪟 Left Split Snap');
        if (triggerAssist) {
          setTimeout(() => this.triggerSnapAssist('right-half', win.id), 120);
        } else {
          this.closeSnapAssist();
        }
      } else if (zone === 'right-half') {
        win.springX.setTarget(b.availX + colW + b.innerGap);
        win.springY.setTarget(b.availY);
        win.springW.setTarget(colW);
        win.springH.setTarget(b.availH);
        this.notifyIsland('🪟 Right Split Snap');
        if (triggerAssist) {
          setTimeout(() => this.triggerSnapAssist('left-half', win.id), 120);
        } else {
          this.closeSnapAssist();
        }
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
          ramUsage += (this.zram.algorithm === 'zstd' ? 9 : 13); // ZRAM compressed!
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
            <span>${w.isFrozen ? (this.zram.algorithm === 'zstd' ? '9 MB (zstd 4.3x)' : '13 MB (lz4 3.2x)') : '42 MB'}</span>
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
