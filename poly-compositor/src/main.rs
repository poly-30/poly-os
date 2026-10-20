//! Poly OS Compositor Main Entrypoint
//! Bootstraps display server, physics loop, and manages Wayland clients.

mod physics;
mod window;

use std::time::Instant;
use window::{PolyWindow, SnapZone};

fn main() {
    env_logger::init();
    println!("=====================================================");
    println!("          Poly OS Wayland Compositor v0.1            ");
    println!("      Smooth Physics Engine + Windows Multitasking   ");
    println!("=====================================================");

    // Example initialization of compositor state
    let screen_w = 1920.0;
    let screen_h = 1080.0;

    println!("[poly-compositor] Initializing display backend...");
    println!("[poly-compositor] Decoupled 120Hz render loop active (SCHED_FIFO).");

    // Spawn a sample window (e.g. Browser)
    let mut win = PolyWindow::new(1, "Poly Web Browser".into(), 101, 100.0, 100.0, 900.0, 600.0);
    println!("[poly-compositor] Created window '{}' at ({:.1}, {:.1})", win.title, win.position.x.current, win.position.y.current);

    // Simulate dragging to right edge (Aero Snap to Right Half)
    println!("[poly-compositor] User dragged window to screen right edge...");
    let zone = PolyWindow::calculate_snap_zone(1915.0, 400.0, screen_w, screen_h);
    assert_eq!(zone, SnapZone::RightHalf);
    
    println!("[poly-compositor] Magnetic snap triggered: {:?}. Applying spring snap...", zone);
    win.apply_snap(zone, screen_w, screen_h);

    // Run physics simulation frames
    let dt = 1.0 / 120.0; // 120 FPS
    let mut frame = 0;
    while win.update(dt) {
        frame += 1;
        if frame % 15 == 0 {
            println!(
                "  Frame {:3} (t={:.3}s): Pos=({:6.1}, {:6.1}) Size=({:6.1}, {:6.1})",
                frame,
                frame as f32 * dt,
                win.position.x.current,
                win.position.y.current,
                win.size.x.current,
                win.size.y.current
            );
        }
    }

    println!("[poly-compositor] Spring settled cleanly in {} frames (~{:.2}s).", frame, frame as f32 * dt);
    println!("[poly-compositor] Final Window Target Reached: Pos=({:.1}, {:.1}) Size=({:.1}, {:.1})",
        win.position.x.current, win.position.y.current, win.size.x.current, win.size.y.current);
}
