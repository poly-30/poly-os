//! Poly OS Window Layout & Magnetic Snap Engine

use crate::physics::{Spring2D, SpringConfig};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SnapZone {
    None,
    Maximize,      // Top edge
    LeftHalf,      // Left edge
    RightHalf,     // Right edge
    TopLeftQuarter,
    TopRightQuarter,
    BottomLeftQuarter,
    BottomRightQuarter,
}

#[derive(Debug, Clone)]
pub struct PolyWindow {
    pub id: u64,
    pub title: String,
    pub pid: u32,
    
    // Physical animated transform (driven by spring physics)
    pub position: Spring2D,
    pub size: Spring2D,
    pub opacity: f32,
    pub scale: f32,

    // Normal restore bounds (for when un-maximizing/unsnapping)
    pub restore_x: f32,
    pub restore_y: f32,
    pub restore_w: f32,
    pub restore_h: f32,

    pub snap_zone: SnapZone,
    pub is_minimized: bool,
    pub is_focused: bool,
}

impl PolyWindow {
    pub fn new(id: u64, title: String, pid: u32, x: f32, y: f32, w: f32, h: f32) -> Self {
        let config = SpringConfig::snappy();
        Self {
            id,
            title,
            pid,
            position: Spring2D::new(x, y, config),
            size: Spring2D::new(w, h, config),
            opacity: 1.0,
            scale: 1.0,
            restore_x: x,
            restore_y: y,
            restore_w: w,
            restore_h: h,
            snap_zone: SnapZone::None,
            is_minimized: false,
            is_focused: true,
        }
    }

    /// Tests cursor position against screen boundaries to detect magnetic snap zones
    pub fn calculate_snap_zone(cursor_x: f32, cursor_y: f32, screen_w: f32, screen_h: f32) -> SnapZone {
        let margin = 20.0;
        let corner_threshold = 80.0;

        // Corners
        if cursor_x <= margin && cursor_y <= corner_threshold {
            return SnapZone::TopLeftQuarter;
        }
        if cursor_x >= screen_w - margin && cursor_y <= corner_threshold {
            return SnapZone::TopRightQuarter;
        }
        if cursor_x <= margin && cursor_y >= screen_h - corner_threshold {
            return SnapZone::BottomLeftQuarter;
        }
        if cursor_x >= screen_w - margin && cursor_y >= screen_h - corner_threshold {
            return SnapZone::BottomRightQuarter;
        }

        // Edges
        if cursor_y <= margin {
            return SnapZone::Maximize;
        }
        if cursor_x <= margin {
            return SnapZone::LeftHalf;
        }
        if cursor_x >= screen_w - margin {
            return SnapZone::RightHalf;
        }

        SnapZone::None
    }

    /// Snap the window into target zone using fluid spring animations
    pub fn apply_snap(&mut self, zone: SnapZone, screen_w: f32, screen_h: f32) {
        if self.snap_zone == SnapZone::None && zone != SnapZone::None {
            // Save restore rectangle
            self.restore_x = self.position.x.current;
            self.restore_y = self.position.y.current;
            self.restore_w = self.size.x.current;
            self.restore_h = self.size.y.current;
        }

        self.snap_zone = zone;
        let gap = 10.0; // Outer padding
        let top_bar_height = 36.0;

        match zone {
            SnapZone::None => {
                self.position.set_target(self.restore_x, self.restore_y);
                self.size.set_target(self.restore_w, self.restore_h);
            }
            SnapZone::Maximize => {
                self.position.set_target(gap, top_bar_height + gap);
                self.size.set_target(screen_w - gap * 2.0, screen_h - top_bar_height - gap * 2.0 - 64.0);
            }
            SnapZone::LeftHalf => {
                self.position.set_target(gap, top_bar_height + gap);
                self.size.set_target((screen_w / 2.0) - gap * 1.5, screen_h - top_bar_height - gap * 2.0 - 64.0);
            }
            SnapZone::RightHalf => {
                self.position.set_target((screen_w / 2.0) + gap * 0.5, top_bar_height + gap);
                self.size.set_target((screen_w / 2.0) - gap * 1.5, screen_h - top_bar_height - gap * 2.0 - 64.0);
            }
            SnapZone::TopLeftQuarter => {
                self.position.set_target(gap, top_bar_height + gap);
                self.size.set_target((screen_w / 2.0) - gap * 1.5, ((screen_h - top_bar_height - 64.0) / 2.0) - gap);
            }
            SnapZone::TopRightQuarter => {
                self.position.set_target((screen_w / 2.0) + gap * 0.5, top_bar_height + gap);
                self.size.set_target((screen_w / 2.0) - gap * 1.5, ((screen_h - top_bar_height - 64.0) / 2.0) - gap);
            }
            SnapZone::BottomLeftQuarter => {
                let half_h = (screen_h - top_bar_height - 64.0) / 2.0;
                self.position.set_target(gap, top_bar_height + half_h + gap);
                self.size.set_target((screen_w / 2.0) - gap * 1.5, half_h - gap);
            }
            SnapZone::BottomRightQuarter => {
                let half_h = (screen_h - top_bar_height - 64.0) / 2.0;
                self.position.set_target((screen_w / 2.0) + gap * 0.5, top_bar_height + half_h + gap);
                self.size.set_target((screen_w / 2.0) - gap * 1.5, half_h - gap);
            }
        }
    }

    /// Frame tick: updates the spring positions towards their targets
    pub fn update(&mut self, dt: f32) -> bool {
        let pos_anim = self.position.update(dt);
        let size_anim = self.size.update(dt);
        pos_anim || size_anim
    }
}
