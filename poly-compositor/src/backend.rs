//! Poly OS — DRM/KMS + EGL/GLES Hardware-Accelerated Rendering Backend
//!
//! This module implements the hardware rendering pipeline that connects
//! directly to the Linux Direct Rendering Manager (DRM/KMS) without
//! requiring X11 or an existing Wayland compositor.
//!
//! ## Architecture
//! ```text
//! ┌────────────────────────────────────────────────────────────┐
//! │                    Poly Compositor                         │
//! │                                                            │
//! │  ┌──────────┐   ┌──────────────┐   ┌───────────────────┐  │
//! │  │ Calloop   │──▶│ DRM Backend  │──▶│ CRTC / Connector  │  │
//! │  │ EventLoop │   │ (Page Flip)  │   │ (Physical Output) │  │
//! │  └─────┬────┘   └──────┬───────┘   └───────────────────┘  │
//! │        │               │                                   │
//! │        │        ┌──────▼───────┐   ┌───────────────────┐  │
//! │        │        │ EGL Context  │──▶│ GLES 3.1 Renderer │  │
//! │        │        │ (GBM / DRM)  │   │ + Glass Shader    │  │
//! │        │        └──────────────┘   └───────────────────┘  │
//! │        │                                                   │
//! │  ┌─────▼────────────────────────────────────────────────┐ │
//! │  │  Wayland Display (wl_compositor, xdg_shell, wl_seat) │ │
//! │  └──────────────────────────────────────────────────────┘ │
//! └────────────────────────────────────────────────────────────┘
//! ```

use std::collections::HashMap;
use std::time::{Duration, Instant};

use crate::physics::{Spring1D, SpringConfig};
use crate::window::{PolyWindow, SnapZone};
use crate::shader::{GlassBorderParams, GlassPipeline};

// ─── Display Output (Monitor) ───────────────────────────────────────────────

/// Represents a physical display output connected via DRM/KMS.
#[derive(Debug, Clone)]
pub struct OutputConfig {
    /// DRM connector ID
    pub connector_id: u32,
    /// CRTC (CRT Controller) ID bound to this output
    pub crtc_id: u32,
    /// Output name (e.g. "HDMI-A-1", "eDP-1")
    pub name: String,
    /// Native resolution
    pub width: u32,
    pub height: u32,
    /// Refresh rate in millihertz (e.g. 120_000 for 120 Hz)
    pub refresh_mhz: u32,
    /// Physical size in millimeters for DPI calculation
    pub physical_width_mm: u32,
    pub physical_height_mm: u32,
}

impl OutputConfig {
    /// Calculate the effective DPI of this output.
    pub fn dpi(&self) -> f32 {
        if self.physical_width_mm == 0 {
            return 96.0; // Fallback
        }
        (self.width as f32) / (self.physical_width_mm as f32 / 25.4)
    }

    /// Calculate the scale factor (1× for ≤120 DPI, 2× for HiDPI, etc.)
    pub fn scale_factor(&self) -> f32 {
        let dpi = self.dpi();
        if dpi <= 140.0 {
            1.0
        } else if dpi <= 200.0 {
            1.5
        } else {
            2.0
        }
    }

    /// Refresh interval as a `Duration`.
    pub fn refresh_interval(&self) -> Duration {
        if self.refresh_mhz == 0 {
            return Duration::from_micros(8333); // 120 Hz fallback
        }
        Duration::from_nanos(1_000_000_000_000 / self.refresh_mhz as u64)
    }
}

// ─── VSync Frame Scheduler ──────────────────────────────────────────────────

/// Schedules compositor frame dispatch synchronized to hardware VSync signals.
///
/// Poly OS targets a 120 Hz dynamic refresh rate.  The scheduler uses the
/// DRM page-flip completion timestamp to compute the next frame deadline,
/// accounting for compositor workload to avoid missed frames.
///
/// ## Adaptive VSync
/// If the compositor's render time exceeds the frame budget, the scheduler
/// automatically halves the target refresh (120 → 60 Hz) to maintain visual
/// consistency, and recovers when headroom returns.
#[derive(Debug)]
pub struct VSyncScheduler {
    /// Target refresh rate in Hz
    pub target_hz: u32,
    /// Frame interval derived from `target_hz`
    pub frame_interval: Duration,
    /// Timestamp of the last completed page-flip
    pub last_flip: Instant,
    /// Exponentially-weighted moving average of frame render time
    pub render_time_ewma: Duration,
    /// Number of consecutive frames that exceeded the deadline
    pub overrun_streak: u32,
    /// Whether we've dropped to half-rate to recover
    pub adaptive_half_rate: bool,
    /// Total frames dispatched
    pub total_frames: u64,
    /// Total missed deadlines
    pub missed_deadlines: u64,
}

impl VSyncScheduler {
    /// Create a new scheduler targeting the given refresh rate.
    pub fn new(target_hz: u32) -> Self {
        let interval = Duration::from_micros(1_000_000 / target_hz as u64);
        Self {
            target_hz,
            frame_interval: interval,
            last_flip: Instant::now(),
            render_time_ewma: Duration::ZERO,
            overrun_streak: 0,
            adaptive_half_rate: false,
            total_frames: 0,
            missed_deadlines: 0,
        }
    }

    /// Record a completed frame render and DRM page-flip.
    ///
    /// Returns the computed delay until the next frame should begin.
    pub fn record_frame(&mut self, render_time: Duration) -> Duration {
        self.total_frames += 1;

        // Update EWMA (α = 0.3 for responsive adaptation)
        let alpha = 0.3;
        let ewma_nanos = (1.0 - alpha) * self.render_time_ewma.as_nanos() as f64
            + alpha * render_time.as_nanos() as f64;
        self.render_time_ewma = Duration::from_nanos(ewma_nanos as u64);

        // Check deadline
        let effective_interval = if self.adaptive_half_rate {
            self.frame_interval * 2
        } else {
            self.frame_interval
        };

        if render_time > effective_interval {
            self.missed_deadlines += 1;
            self.overrun_streak += 1;

            // Drop to half-rate after 3 consecutive overruns
            if self.overrun_streak >= 3 && !self.adaptive_half_rate {
                self.adaptive_half_rate = true;
                log::warn!(
                    "VSyncScheduler: 3 consecutive overruns — dropping to {} Hz",
                    self.target_hz / 2
                );
            }
        } else {
            self.overrun_streak = 0;
            // Recover to full rate if EWMA is well under budget
            if self.adaptive_half_rate
                && self.render_time_ewma < self.frame_interval * 3 / 4
            {
                self.adaptive_half_rate = false;
                log::info!(
                    "VSyncScheduler: headroom recovered — restoring {} Hz",
                    self.target_hz
                );
            }
        }

        let now = Instant::now();
        self.last_flip = now;

        // Compute delay to next frame
        let headroom = effective_interval.saturating_sub(render_time);
        headroom
    }

    /// Get the current effective refresh rate.
    pub fn effective_hz(&self) -> u32 {
        if self.adaptive_half_rate {
            self.target_hz / 2
        } else {
            self.target_hz
        }
    }

    /// Get statistics as a formatted string.
    pub fn stats(&self) -> String {
        format!(
            "VSync: {} Hz (target {}), frames={}, missed={}, render_avg={:.2}ms",
            self.effective_hz(),
            self.target_hz,
            self.total_frames,
            self.missed_deadlines,
            self.render_time_ewma.as_secs_f64() * 1000.0,
        )
    }
}

// ─── EGL/GLES Renderer Context ──────────────────────────────────────────────

/// Abstraction over the EGL display + GLES 3.1 context used for rendering.
///
/// On real hardware (DRM backend), the EGL context is bound to a GBM (Generic
/// Buffer Manager) surface, which feeds scan-out buffers to the DRM CRTC.
///
/// On the Winit development backend, EGL is bound to the Winit window's
/// native display handle.
#[derive(Debug)]
pub struct RendererContext {
    /// Reported GLES version string
    pub gl_version: String,
    /// Reported GPU renderer string
    pub gl_renderer: String,
    /// Maximum texture size supported by the GPU
    pub max_texture_size: u32,
    /// Whether the GPU supports `GL_EXT_texture_filter_anisotropic`
    pub supports_anisotropic: bool,
    /// Whether the GPU supports `GL_OES_EGL_image_external`
    pub supports_external_textures: bool,
    /// The frosted-glass shader pipeline
    pub glass_pipeline: GlassPipeline,
}

impl RendererContext {
    /// Create a renderer context with default (simulated) capabilities.
    ///
    /// In a production build this would query the real EGL/GLES context.
    pub fn new() -> Self {
        Self {
            gl_version: "OpenGL ES 3.1 (Smithay GLES Renderer)".to_string(),
            gl_renderer: "Poly OS Software Rasterizer".to_string(),
            max_texture_size: 16384,
            supports_anisotropic: true,
            supports_external_textures: true,
            glass_pipeline: GlassPipeline::new(),
        }
    }

    /// Log GPU capabilities.
    pub fn log_caps(&self) {
        log::info!("GPU: {}", self.gl_renderer);
        log::info!("GLES: {}", self.gl_version);
        log::info!("Max texture: {}×{}", self.max_texture_size, self.max_texture_size);
        log::info!(
            "Extensions: anisotropic={}, ext_textures={}",
            self.supports_anisotropic,
            self.supports_external_textures,
        );
        self.glass_pipeline.describe();
    }
}

// ─── Compositor State (top-level) ───────────────────────────────────────────

/// Top-level compositor state that owns all subsystems.
///
/// This is the struct that Smithay's `calloop` event loop callbacks receive a
/// mutable reference to.  It owns the window map, seat state, renderer, VSync
/// scheduler, and the frosted-glass pipeline.
#[derive(Debug)]
pub struct PolyCompositorState {
    /// All managed windows, keyed by Wayland surface ID
    pub windows: HashMap<u64, PolyWindow>,
    /// Next window ID to assign
    pub next_window_id: u64,

    /// Connected physical outputs
    pub outputs: Vec<OutputConfig>,

    /// GPU renderer context (EGL + GLES)
    pub renderer: RendererContext,

    /// VSync frame scheduler
    pub vsync: VSyncScheduler,

    /// Screen dimensions (primary output)
    pub screen_width: f32,
    pub screen_height: f32,

    /// Whether the compositor is running
    pub running: bool,

    /// Focus stack: most recently focused window ID at the top
    pub focus_stack: Vec<u64>,

    /// Global compositor opacity spring (for fade-in on startup)
    pub compositor_opacity: Spring1D,
}

impl PolyCompositorState {
    /// Initialize a new compositor state for the given primary output.
    pub fn new(output: OutputConfig) -> Self {
        let screen_width = output.width as f32;
        let screen_height = output.height as f32;
        let target_hz = output.refresh_mhz / 1000;

        let mut state = Self {
            windows: HashMap::new(),
            next_window_id: 1,
            outputs: vec![output],
            renderer: RendererContext::new(),
            vsync: VSyncScheduler::new(target_hz.max(60)),
            screen_width,
            screen_height,
            running: true,
            focus_stack: Vec::new(),
            compositor_opacity: Spring1D::new(0.0, SpringConfig::gentle()),
        };

        // Fade compositor in from black over ~300ms
        state.compositor_opacity.set_target(1.0);

        state
    }

    /// Register a new client window (called on xdg_toplevel map).
    pub fn map_window(&mut self, title: String, pid: u32, x: f32, y: f32, w: f32, h: f32) -> u64 {
        let id = self.next_window_id;
        self.next_window_id += 1;

        let window = PolyWindow::new(id, title.clone(), pid, x, y, w, h);
        self.windows.insert(id, window);
        self.focus_stack.push(id);

        log::info!(
            "Mapped window #{} '{}' (pid={}) at ({:.0},{:.0}) {}×{}",
            id, title, pid, x, y, w, h
        );

        id
    }

    /// Remove a window (called on xdg_toplevel unmap / client disconnect).
    pub fn unmap_window(&mut self, id: u64) {
        if let Some(win) = self.windows.remove(&id) {
            self.focus_stack.retain(|&wid| wid != id);
            log::info!("Unmapped window #{} '{}'", id, win.title);
        }
    }

    /// Focus a window: move it to the top of the focus stack.
    pub fn focus_window(&mut self, id: u64) {
        self.focus_stack.retain(|&wid| wid != id);
        self.focus_stack.push(id);

        for (&wid, win) in self.windows.iter_mut() {
            win.is_focused = wid == id;
        }

        log::debug!("Focus → window #{}", id);
    }

    /// Process a magnetic snap for the given window at cursor position.
    pub fn handle_snap(&mut self, window_id: u64, cursor_x: f32, cursor_y: f32) {
        let zone = PolyWindow::calculate_snap_zone(
            cursor_x, cursor_y, self.screen_width, self.screen_height,
        );

        if let Some(win) = self.windows.get_mut(&window_id) {
            if zone != win.snap_zone {
                log::info!(
                    "Window #{} snap: {:?} → {:?}",
                    window_id, win.snap_zone, zone
                );
                win.apply_snap(zone, self.screen_width, self.screen_height);
            }
        }
    }

    /// Advance all spring physics by one frame.  Returns `true` if any window
    /// is still animating (i.e. the compositor should keep rendering).
    pub fn tick_physics(&mut self, dt: f32) -> bool {
        let mut any_active = self.compositor_opacity.update(dt);

        for win in self.windows.values_mut() {
            if win.update(dt) {
                any_active = true;
            }
        }

        any_active
    }

    /// Get the topmost (focused) window ID, if any.
    pub fn focused_window(&self) -> Option<u64> {
        self.focus_stack.last().copied()
    }
}

// ─── DRM Backend Initialization (Linux-only) ────────────────────────────────

/// Describes the result of probing DRM/KMS hardware.
#[derive(Debug)]
pub struct DrmProbeResult {
    /// Path to the DRM device node (e.g. "/dev/dri/card0")
    pub device_path: String,
    /// Available outputs (connectors with an attached monitor)
    pub outputs: Vec<OutputConfig>,
    /// Whether Vulkan is available as an alternative renderer
    pub vulkan_available: bool,
    /// DRM driver name (e.g. "amdgpu", "i915", "nouveau")
    pub driver_name: String,
}

/// Probe the DRM subsystem for available GPUs and connected outputs.
///
/// On real Linux hardware, this would:
/// 1. Enumerate `/dev/dri/card*` device nodes via udev
/// 2. Open the primary GPU with `libseat` session privileges
/// 3. Query DRM connectors for connected monitors
/// 4. Select the best CRTC → connector → encoder binding
/// 5. Negotiate the preferred mode (resolution + refresh rate)
///
/// This reference implementation returns a simulated probe result that
/// matches a typical 120 Hz gaming monitor setup.
pub fn probe_drm() -> DrmProbeResult {
    log::info!("Probing DRM/KMS subsystem...");

    // Simulated primary output: a 2560×1440 @ 120 Hz monitor on HDMI
    let primary_output = OutputConfig {
        connector_id: 87,
        crtc_id: 51,
        name: "HDMI-A-1".to_string(),
        width: 2560,
        height: 1440,
        refresh_mhz: 120_000,
        physical_width_mm: 597,
        physical_height_mm: 336,
    };

    log::info!(
        "  Found output '{}': {}×{} @ {} Hz ({:.0} DPI, {:.1}× scale)",
        primary_output.name,
        primary_output.width,
        primary_output.height,
        primary_output.refresh_mhz / 1000,
        primary_output.dpi(),
        primary_output.scale_factor(),
    );

    DrmProbeResult {
        device_path: "/dev/dri/card0".to_string(),
        outputs: vec![primary_output],
        driver_name: "amdgpu".to_string(),
        vulkan_available: true,
    }
}
