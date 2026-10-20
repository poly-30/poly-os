# Poly OS — Technical Architecture & System Specification

## 1. Vision & Core Philosophy

**Poly OS** is a lightweight, modern hybrid operating system designed to merge:
1. **The best of iOS:**
   - 120Hz interruptible mass-spring-damper gesture transitions.
   - Aggressive power and background task optimization (freezing inactive execution).
   - Unified glassmorphic UI, Control Center, and sandboxed app permissions.
2. **The best of Windows:**
   - Freeform floating multi-window management with advanced magnetic snapping (Aero Snap + Quarter tiling).
   - Versatile taskbar with running indicators, system tray, and app launcher.
   - Comprehensive POSIX filesystem access, multi-monitor support, and power-user tooling.
3. **Ultra-Lightweight Footprint:**
   - Cold boot in < 2.5 seconds.
   - Idle memory consumption under **250 MB RAM**.
   - Compositor render loop decoupled from application thread load.

---

## 2. System Architecture Layers

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Interaction Layer                          │
│   [Poly Shell: Morphing Dock/Taskbar, Control Center, App Exposé]       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Wayland Protocols (xdg_shell, wlr_layer_shell)
┌───────────────────────────────────▼────────────────────────────────────┐
│                    Poly Compositor (Rust + Smithay)                    │
│   ├── Physics Engine (RK4 Spring-Damper with Velocity Retention)       │
│   ├── Window Layout Manager (Floating + Magnetic Snap + Tiling)        │
│   └── GPU Render Loop (Vulkan/OpenGL, EGL, Direct KMS/DRM)             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ IPC / cgroups v2 / D-Bus
┌───────────────────────────────────▼────────────────────────────────────┐
│                   Poly System Daemons & Services                       │
│   ├── polyd (iOS-style Process Lifecycle & cgroup.freeze manager)      │
│   ├── seatd (Lightweight multi-session manager, replacing logind)      │
│   └── PipeWire (Low-latency audio and media stream routing)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ System Calls
┌───────────────────────────────────▼────────────────────────────────────┐
│                     Linux Kernel (Zen / PREEMPT_RT)                    │
│   ├── Low-latency Preemption (PREEMPT_DYNAMIC / SCHED_FIFO)            │
│   ├── ZRAM (zstd compressed swap in RAM)                               │
│   └── Modern Hardware Drivers (DRM/KMS, Mesa, evdev/libinput)          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mathematical Animation & Physics Engine (`poly-physics`)

Traditional desktop environments (e.g. Windows DWM, X11, GNOME) calculate transitions using fixed duration timing curves ($t \in [0, 1]$ with cubic-bezier):
$$\text{Position}(t) = B(t)$$

This causes jarring jumps when a user interrupts an ongoing window drag or swipe gesture. **Poly OS** uses a continuous physical simulation based on a **Second-Order Damped Harmonic Oscillator**:

$$m \frac{d^2 x}{dt^2} + c \frac{dx}{dt} + k (x - x_{\text{target}}) = 0$$

Where:
- $m$ = Virtual mass of the window or UI card (typically $1.0$).
- $k$ = Spring stiffness (responsiveness, typically $180.0 - 320.0$).
- $c$ = Damping coefficient (controls bounce vs smoothness).
- $\zeta = \frac{c}{2\sqrt{km}}$ (Damping ratio: $\zeta = 1.0$ for critical damping, $\zeta = 0.82$ for iOS-style subtle spring bounce).

### Analytical Closed-Form Solution (Under-damped $\zeta < 1$):
$$\omega_0 = \sqrt{\frac{k}{m}}, \quad \omega_d = \omega_0 \sqrt{1 - \zeta^2}$$
$$x(t) = x_{\text{target}} + e^{-\zeta \omega_0 t} \left[ (x_0 - x_{\text{target}}) \cos(\omega_d t) + \frac{v_0 + \zeta \omega_0 (x_0 - x_{\text{target}})}{\omega_d} \sin(\omega_d t) \right]$$

When the user lifts their finger or releases mouse drag, the exit velocity $v_0$ is fed directly into the initial velocity of the differential equation, giving **zero perceived friction** and natural deceleration into the target snap point.

---

## 4. Process Lifecycle & Battery Optimization (`polyd`)

In Windows, background applications freely consume CPU cycles unless restricted. In iOS, apps are aggressively frozen. Poly OS combines both using Linux `cgroups v2`:

### Process States:
1. **Active (Foreground):**
   - Window has focus.
   - Assigned to high-priority CPU weight: `cpu.weight = 100`.
   - Thread scheduled with dynamic high priority.
2. **Inactive (Grace Period - 15 seconds):**
   - Window lost focus or minimized.
   - Throttled to lower CPU weight: `cpu.weight = 10`.
   - Allows pending network requests or short saves to conclude.
3. **Frozen (Suspended):**
   - Triggered when inactive timeout expires and no background keep-alive lease exists.
   - `polyd` writes `1` to `/sys/fs/cgroup/poly/app_<pid>/cgroup.freeze`.
   - Zero CPU consumption. Inactive pages are compressed into `ZRAM (zstd)`.
4. **Resumed (Instant Wakeup):**
   - When the user clicks or swipes back to the window, `polyd` writes `0` to `cgroup.freeze`.
   - Unfreezes in under $1.2 \text{ ms}$, yielding immediate interactivity without relaunch delays.
5. **Background Leases:**
   - Apps register temporary leases via D-Bus (`org.poly.Lifecycle.RequestLease`):
     - `AudioPlayback`: Keeps process unfrozen while sound is actively streaming through PipeWire.
     - `FileTransfer`: Keeps process unfrozen until bytes transmitted reaches completion.
     - `ComputeTask`: Granted for user-approved background rendering or compilation.

---

## 5. UI Shell & Interaction Paradigms (`poly-shell`)

### A. The Adaptive Bottom Bar (Dock $\leftrightarrow$ Taskbar)
- **Compact Dock Mode (iOS style):** Centered floating glass pill with primary pinned apps and running indicators (glowing pill dots).
- **Expanded Taskbar Mode (Windows style):** On hover or multi-monitor keyboard setup, expands horizontally to display open window title badges, system tray (clock, network, battery), and a start launcher button.

### B. Magnetic Window Snapping (Aero Snap + Gestures)
- Dragging a window to screen edges displays a spring-reactive translucent snap ghost:
  - **Left / Right edges:** Halves screen ($50\% \times 100\%$).
  - **Top edge:** Maximizes window ($100\% \times 100\%$).
  - **Corners:** Quarter tiles ($50\% \times 50\%$).
- Releasing initiates a spring snap into place with natural deceleration.

### C. Gesture Navigation
- **3-Finger Swipe Up / Win + Tab:** Zooms out open windows into a fluid 3D card layout (App Exposé / Stage Switcher).
- **Top-Right Pull-Down:** Triggers the unified Glassmorphic Control Center (Brightness, Volume, Wi-Fi, Bluetooth, Performance Mode).
- **Bottom-Bar Swipe:** Quickly switches between full-screen workspaces.
