# Poly OS 🌐

<p align="center">
  <img src="https://img.shields.io/badge/Poly%20OS-v2.5%20Preview-0a84ff?style=for-the-badge&logo=linux&logoColor=white" alt="Poly OS Version" />
  <img src="https://img.shields.io/badge/Compositor-Rust%20%2B%20Smithay-30d158?style=for-the-badge&logo=rust&logoColor=white" alt="Rust Compositor" />
  <img src="https://img.shields.io/badge/Kernel-Linux%20cgroups%20v2-ff9f0a?style=for-the-badge&logo=tux&logoColor=white" alt="cgroups v2" />
  <img src="https://img.shields.io/badge/Memory-Sub--250MB%20ZRAM-bf5af2?style=for-the-badge" alt="ZRAM Footprint" />
  <img src="https://img.shields.io/badge/Display-120Hz%20ProMotion-64d2ff?style=for-the-badge" alt="120Hz ProMotion" />
  <img src="https://img.shields.io/badge/License-MIT-gray?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <strong>The ultra-lightweight hybrid desktop operating system marrying iOS tactile fluidity with Windows multitasking power.</strong>
</p>

---

## 📖 Overview

**Poly OS** is an architectural and conceptual hybrid operating system designed to solve the trade-offs of modern desktop environments. 

Traditional desktop operating systems either prioritize **free-form multi-window productivity** at the cost of battery life and cohesive touch/gesture fluidity (Windows/macOS), or prioritize **aggressive battery efficiency and spring physics** at the cost of true floating window multitasking (iOS/iPadOS). 

Poly OS bridges this gap with:
1. **Damped Harmonic Oscillator Physics** running at 120Hz for zero-friction window drags, flicks, and velocity momentum.
2. **Proactive `cgroups v2` Lifecycle Freezing (`polyd`)** that freezes background windows after 15 seconds of inactivity into compressed ZRAM, preserving battery and guaranteeing **< 250 MB idle memory**.
3. **Adaptive Dual-Mode Taskbar**: Smoothly morphs from a floating frosted-glass iOS pill dock into an edge-to-edge Windows extended taskbar.
4. **Standardized 16px Aero Snap & FancyZones Tiling Grid**: Predictable half-screen, quarter-corner, and custom grid snapping with isolated corner drop shadows.

---

## 📸 Visual Showcase

### 1. Minimalist Desktop & Adaptive Unified Dock
> *The signature desktop view featuring high-contrast vector gradient wallpapers, custom desktop icons, unified top status bar with Dynamic Island, and the auto-scaling frosted glass floating dock.*

<p align="center">
  <img src="docs/screenshots/desktop_dock.png" alt="Poly OS Clean Desktop and Floating Dock" width="95%" />
</p>

- **Unified Horizontal Baseline**: Pinned applications and active tasks share an identical vertical center with no stacked pseudo-rows.
- **Dynamic Auto-Scaling**: As more applications open, icons dynamically scale down from `42px` to `18px`, anchoring the right-hand system tray permanently on-screen.
- **Dynamic Island**: Displays interactive status prompts (e.g. `App Exposé`, workspace switches, audio device connections).

---

### 2. Live Desktop Widget Ecosystem
> *Glanceable, interactive desktop widgets providing live system metrics, weather, calendar, and quick thoughts.*

<p align="center">
  <img src="docs/screenshots/desktop_widgets.png" alt="Poly OS Desktop Widgets" width="95%" />
</p>

- **Time & Calendar**: Live UTC/local time with week counters and VSync timing indicators.
- **Poly Engine Performance Monitor**: Synchronized single source of truth for CPU load, Memory pool (ZRAM compressed), 120Hz refresh rate, and thermal states.
- **Cupertino Atmosphere Weather**: Real-time atmospheric conditions, AQI, humidity, and wind vectors.
- **Quick Scratchpad**: Instant desktop sticky notes with theme tags and quick hotkey reminders.

---

### 3. Power-User Desktop Context Menu
> *Right-click anywhere on the desktop to reveal the fast context menu with desktop-wide utilities and controls.*

<p align="center">
  <img src="docs/screenshots/context_menu.png" alt="Poly OS Context Menu" width="95%" />
</p>

- **Quick Look Preview (Spacebar)**: Instant spacebar preview for images, documents, and code files.
- **Live Wallpaper Engine**: Toggle real-time animated Cupertino shaders or switch between 4 curated vector colorways (*Cupertino Glass*, *Redmond Horizon*, *Nordic Aurora*, *Cyber Dusk*).
- **FancyZones Tiling Layouts (`Win + Z`)**: Launch customizable grid zones for power-user screen organization.
- **Toggle Desktop Widgets**: Instantly hide or reveal desktop widgets to keep workspaces distraction-free.

---

### 4. Glassmorphic Unified Control Center
> *A single click in the top-right status bar reveals the iOS-inspired Control Center with real-time sliders and toggles.*

<p align="center">
  <img src="docs/screenshots/control_center.png" alt="Poly OS Control Center" width="95%" />
</p>

- **Quick Action Toggles**: 1-click toggles for Wi-Fi, Bluetooth, PolyDrop, and Magnetic Aero Snap.
- **Interactive ProMotion Sliders**: Smooth volume and brightness control bars.
- **Integrated Now Playing Media Controller**: Native spatial audio playback controls directly tied to the Poly Audio Engine.
- **Poly Energy Engine Profile Switcher**: Instantly switch between **Eco** (aggressive 60Hz freeze), **Balanced**, and **Turbo 120Hz** performance profiles.

---

### 5. Poly System Menu & Global Launcher
> *Top-left system menu offering instant access to core system tools, system preferences, and session controls.*

<p align="center">
  <img src="docs/screenshots/system_menu.png" alt="Poly OS System Menu" width="95%" />
</p>

- **System Preferences**: Full split-pane Settings app for display refresh rates, acoustics, multitasking springs, and ZRAM caches.
- **Activity Monitor & Process Supervisor**: Deep inspection of background cgroups processes.
- **1-Click PWA Installation**: Install Poly OS as a native standalone desktop app on Chrome, Edge, and Safari.

---

## 🛠️ Architecture & Core Subsystems

```
poly-os/
├── architecture/
│   └── SPECIFICATION.md          # Complete architectural blueprint & math formulas
├── docs/
│   └── screenshots/              # High-resolution screenshots for GitHub
│       ├── desktop_dock.png
│       ├── desktop_widgets.png
│       ├── context_menu.png
│       ├── control_center.png
│       └── system_menu.png
├── poly-compositor/              # Native Wayland display server in Rust
│   ├── Cargo.toml
│   └── src/
│       ├── main.rs               # Event loop & Smithay Wayland bridge
│       ├── physics.rs            # Damped Harmonic Oscillator math (k, ζ, RK4)
│       └── window.rs             # Magnetic Aero Snap & FancyZones tiling engine
├── poly-daemon/                  # Battery & lifecycle supervisor in Python
│   └── polyd.py                  # Linux cgroups v2 background task freezer
├── poly-shell/                   # Interactive Web Shell (120Hz Spring UI)
│   ├── index.html                # Shell DOM architecture
│   ├── style.css                 # Glassmorphic layout & gap system
│   ├── shell.js                  # Physics engine, window manager & state store
│   └── manifest.json             # PWA metadata & desktop icons
├── iso-build/                    # Bootable Live ISO pipeline
│   └── build-iso.sh              # Musl/Alpine Linux rootfs mastering script
├── preview.py                    # Zero-dependency local preview runner
└── README.md
```

### 1. Mass-Spring-Damper Physics Engine
Windows in Poly OS do not jump or snap through rigid linear animations. Every window movement is governed by a second-order ordinary differential equation (ODE):

$$m \frac{d^2 x}{dt^2} + c \frac{dx}{dt} + k (x - x_{\text{target}}) = 0$$

- **Stiffness ($k = 260\ \text{N/m}$)**: Provides snappy, responsive window snap deceleration.
- **Damping Ratio ($\zeta = 0.82$)**: Calibrated for organic iOS-style overshoot bounce without infinite oscillation.
- **Velocity Retention**: Flicking a window titlebar calculates $\vec{v} = \frac{\Delta \vec{x}}{\Delta t}$ and integrates natural inertia before coming to rest.

### 2. Proactive Memory & Process Freezing (`polyd`)
Instead of allowing inactive background processes to consume memory and CPU cycles:
1. **Focus Tracking**: When a user focuses a new window, the previously active window is placed on a **15-second grace countdown**.
2. **`cgroups v2` Freezing**: Once the timer expires, `polyd` writes `1` to `/sys/fs/cgroup/poly.slice/app_<id>/cgroup.freeze`.
3. **ZRAM Compaction**: Kernel memory pages for frozen apps are swapped into in-RAM compressed ZRAM (LZ4 3.2:1 ratio).
4. **Instant Thaw**: Clicking the app icon or Alt+Tab instantly writes `0` to unfreeze, restoring interactive state in $< 10\ \text{ms}$.

---

## ⚡ Try Poly OS Locally

Poly OS includes a zero-dependency interactive preview runner:

```bash
# Clone the repository
git clone https://github.com/your-username/poly-os.git
cd poly-os

# Start the interactive preview server
python preview.py
```

The shell will open in your browser at `http://localhost:5173/index.html`.

### Key Shortcuts to Test:
- **`Cmd / Win + Space`**: Open Global Spotlight / Start Launcher.
- **`Win + Tab` / `Ctrl + Tab`**: Toggle 3D App Exposé overview.
- **`Alt + Tab`**: Fast Glass Window Switcher HUD.
- **`Spacebar`**: Quick Look file preview when an icon is selected.
- **`Win + Z`**: Trigger FancyZones multi-window tiling layouts.
- **Drag window to top edge**: Magnetic Aero Maximize.
- **Drag window to left / right**: 50% split-screen snap with strict 16px gaps.
- **Drag window to corners**: 25% quarter corner snap.

---

## 📄 License

Poly OS is open-source software licensed under the **[MIT License](LICENSE)**.
