//! Poly OS Spring Physics Engine
//! Implements interruptible, continuous damped harmonic oscillator equations
//! modeled after Apple's CoreAnimation/UIKit spring physics.

use std::f32::consts::PI;

#[derive(Debug, Clone, Copy)]
pub struct SpringConfig {
    /// Spring stiffness (k) - higher means snappier response. (Default: 240.0)
    pub stiffness: f32,
    /// Damping ratio (zeta):
    /// 1.0 = Critical damping (fastest with zero overshoot)
    /// 0.75 - 0.85 = Subtle natural iOS spring bounce
    pub damping_ratio: f32,
    /// Virtual mass (m) (Default: 1.0)
    pub mass: f32,
    /// Threshold to declare the spring at rest
    pub rest_threshold: f32,
}

impl Default for SpringConfig {
    fn default() -> Self {
        Self {
            stiffness: 240.0,
            damping_ratio: 0.82,
            mass: 1.0,
            rest_threshold: 0.1,
        }
    }
}

impl SpringConfig {
    /// Snappy preset for window snapping and window minimize
    pub fn snappy() -> Self {
        Self {
            stiffness: 320.0,
            damping_ratio: 0.85,
            mass: 1.0,
            rest_threshold: 0.05,
        }
    }

    /// Gentle preset for dock hover, control center slide, and App Exposé
    pub fn gentle() -> Self {
        Self {
            stiffness: 180.0,
            damping_ratio: 0.88,
            mass: 1.0,
            rest_threshold: 0.1,
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub struct Spring1D {
    pub current: f32,
    pub target: f32,
    pub velocity: f32,
    pub config: SpringConfig,
}

impl Spring1D {
    pub fn new(initial: f32, config: SpringConfig) -> Self {
        Self {
            current: initial,
            target: initial,
            velocity: 0.0,
            config,
        }
    }

    /// Set a new target. Does NOT reset velocity, preserving gesture momentum!
    pub fn set_target(&mut self, target: f32) {
        self.target = target;
    }

    /// Set a new target with an explicit initial flick velocity from a swipe/drag
    pub fn flick(&mut self, target: f32, initial_velocity: f32) {
        self.target = target;
        self.velocity = initial_velocity;
    }

    /// Advance the simulation by delta-time `dt` in seconds (e.g. 1.0 / 120.0 for 120Hz)
    pub fn update(&mut self, dt: f32) -> bool {
        let displacement = self.current - self.target;
        if displacement.abs() < self.config.rest_threshold && self.velocity.abs() < self.config.rest_threshold {
            self.current = self.target;
            self.velocity = 0.0;
            return false; // Spring has settled to rest
        }

        let k = self.config.stiffness;
        let m = self.config.mass;
        let c = 2.0 * self.config.damping_ratio * (k * m).sqrt();

        // Semi-implicit Euler integration (energy-conserving for UI physics)
        let spring_force = -k * displacement;
        let damping_force = -c * self.velocity;
        let acceleration = (spring_force + damping_force) / m;

        self.velocity += acceleration * dt;
        self.current += self.velocity * dt;

        true // Still moving
    }

    pub fn is_at_rest(&self) -> bool {
        (self.current - self.target).abs() < self.config.rest_threshold
            && self.velocity.abs() < self.config.rest_threshold
    }
}

/// 2D Vector Spring for (X, Y) Coordinates or (Width, Height)
#[derive(Debug, Clone, Copy)]
pub struct Spring2D {
    pub x: Spring1D,
    pub y: Spring1D,
}

impl Spring2D {
    pub fn new(x: f32, y: f32, config: SpringConfig) -> Self {
        Self {
            x: Spring1D::new(x, config),
            y: Spring1D::new(y, config),
        }
    }

    pub fn set_target(&mut self, target_x: f32, target_y: f32) {
        self.x.set_target(target_x);
        self.y.set_target(target_y);
    }

    pub fn flick(&mut self, target_x: f32, target_y: f32, vel_x: f32, vel_y: f32) {
        self.x.flick(target_x, vel_x);
        self.y.flick(target_y, vel_y);
    }

    pub fn update(&mut self, dt: f32) -> bool {
        let active_x = self.x.update(dt);
        let active_y = self.y.update(dt);
        active_x || active_y
    }

    pub fn pos(&self) -> (f32, f32) {
        (self.x.current, self.y.current)
    }

    pub fn is_at_rest(&self) -> bool {
        self.x.is_at_rest() && self.y.is_at_rest()
    }
}
