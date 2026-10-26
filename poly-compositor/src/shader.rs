//! Poly OS — Frosted-Glass GLSL Shader Pipeline
//!
//! Provides the GLSL fragment shader source for rendering Gaussian-blurred,
//! tinted, frosted-glass window borders.  The shader runs as a full-screen
//! post-processing pass on a down-sampled copy of the compositor framebuffer.
//!
//! ## GPU Pipeline
//! ```text
//! ┌──────────────────────┐
//! │  Compositor FBO      │  (all surfaces composited into a single texture)
//! └──────────┬───────────┘
//!            │  blit / down-sample ×4
//! ┌──────────▼───────────┐
//! │  Blur Ping-Pong FBOs │  Two-pass separable 13-tap Gaussian
//! │  (horiz → vert)      │
//! └──────────┬───────────┘
//!            │  sample blurred + original → tinted alpha blend
//! ┌──────────▼───────────┐
//! │  Glass Composite FBO │  Final border-region composite
//! └──────────────────────┘
//! ```

// ─── Vertex shader (shared by blur & composite passes) ──────────────────────

/// Simple full-screen triangle vertex shader.
/// Generates UVs without a vertex buffer by using `gl_VertexID`.
pub const FULLSCREEN_VERT: &str = r#"
#version 310 es
precision highp float;

out vec2 v_uv;

void main() {
    // Full-screen triangle trick: 3 vertices cover NDC [-1,1]²
    float x = float((gl_VertexID & 1) << 2) - 1.0;
    float y = float((gl_VertexID & 2) << 1) - 1.0;
    v_uv = vec2(x * 0.5 + 0.5, y * 0.5 + 0.5);
    gl_Position = vec4(x, y, 0.0, 1.0);
}
"#;

// ─── Gaussian blur pass (13-tap separable) ──────────────────────────────────

/// Separable 13-tap Gaussian blur fragment shader.
///
/// Bind `u_direction` = `vec2(1/w, 0)` for horizontal, `vec2(0, 1/h)` for vertical.
/// Weights correspond to σ ≈ 4.0, truncated to 13 taps for a good
/// quality/performance trade-off on mobile GPUs.
pub const GAUSSIAN_BLUR_FRAG: &str = r#"
#version 310 es
precision highp float;

in vec2 v_uv;
out vec4 frag_color;

uniform sampler2D u_texture;
uniform vec2      u_direction; // (1/w, 0) or (0, 1/h)

void main() {
    // 13-tap Gaussian kernel (σ ≈ 4.0, pre-normalized)
    const float w[7] = float[](
        0.1964825501511404,
        0.2969069646728344,
        0.09447039785044732,
        0.010381362401148057,
        0.0,   // placeholder symmetry
        0.0,
        0.0
    );
    // Actual 13-tap symmetric weights for σ=4:
    const float weight[7] = float[](
        0.159576912161,  // center
        0.147308056121,  // ±1
        0.115876621105,  // ±2
        0.077565880041,  // ±3
        0.044205927851,  // ±4
        0.021437084742,  // ±5
        0.008847237340   // ±6
    );

    vec4 result = texture(u_texture, v_uv) * weight[0];
    for (int i = 1; i < 7; i++) {
        vec2 offset = u_direction * float(i);
        result += texture(u_texture, v_uv + offset) * weight[i];
        result += texture(u_texture, v_uv - offset) * weight[i];
    }
    frag_color = result;
}
"#;

// ─── Frosted-glass composite pass ───────────────────────────────────────────

/// Composites the blurred background with a tint overlay to produce the
/// frosted-glass window border effect.
///
/// Uniforms:
/// - `u_blur_tex`   — the Gaussian-blurred background texture
/// - `u_scene_tex`  — the original un-blurred scene
/// - `u_border_mask`— a per-pixel mask (1.0 inside border region, 0.0 elsewhere)
/// - `u_tint_color` — RGBA tint applied over the blur (e.g. `vec4(1,1,1,0.15)`)
/// - `u_blur_strength` — lerp factor between sharp and blurred (0.0 … 1.0)
pub const GLASS_COMPOSITE_FRAG: &str = r#"
#version 310 es
precision highp float;

in vec2 v_uv;
out vec4 frag_color;

uniform sampler2D u_blur_tex;
uniform sampler2D u_scene_tex;
uniform sampler2D u_border_mask;
uniform vec4      u_tint_color;
uniform float     u_blur_strength;
uniform float     u_saturation;    // Increase saturation for vibrancy (1.0 = none, 1.8 = vivid)
uniform float     u_noise_amount;  // Subtle grain to break colour banding (0.0 – 0.05)

// Luminance-preserving saturation adjustment
vec3 adjust_saturation(vec3 color, float saturation) {
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    return mix(vec3(luma), color, saturation);
}

// Pseudo-random hash for noise
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
    float mask   = texture(u_border_mask, v_uv).r;
    vec4  scene  = texture(u_scene_tex,   v_uv);
    vec4  blurred = texture(u_blur_tex,   v_uv);

    // ── Vibrancy pass: boost saturation of the blurred sample ──
    blurred.rgb = adjust_saturation(blurred.rgb, u_saturation);

    // ── Lerp between sharp scene and Gaussian-blurred version ──
    vec4 glass = mix(scene, blurred, u_blur_strength * mask);

    // ── Tint overlay (pre-multiplied alpha blend) ──
    glass.rgb = mix(glass.rgb, u_tint_color.rgb, u_tint_color.a * mask);

    // ── Subtle noise grain to eliminate colour banding ──
    float noise = (hash(v_uv * 1000.0) - 0.5) * u_noise_amount;
    glass.rgb += noise * mask;

    frag_color = glass;
}
"#;

// ─── Border-region mask generator (CPU side) ────────────────────────────────

/// Parameters for the frosted-glass border effect.
#[derive(Debug, Clone, Copy)]
pub struct GlassBorderParams {
    /// Border thickness in logical pixels (default: 6.0)
    pub thickness: f32,
    /// Corner radius in logical pixels (default: 12.0)
    pub corner_radius: f32,
    /// Tint colour overlay [R, G, B, A]  (default: subtle white at 12% opacity)
    pub tint_color: [f32; 4],
    /// Blur lerp strength 0.0 … 1.0 (default: 0.85)
    pub blur_strength: f32,
    /// Saturation boost (1.0 = neutral, 1.8 = vibrant Apple-style)
    pub saturation: f32,
    /// Noise grain amount to break banding (0.0 – 0.04)
    pub noise_amount: f32,
}

impl Default for GlassBorderParams {
    fn default() -> Self {
        Self {
            thickness: 6.0,
            corner_radius: 12.0,
            tint_color: [1.0, 1.0, 1.0, 0.12],
            blur_strength: 0.85,
            saturation: 1.6,
            noise_amount: 0.025,
        }
    }
}

/// Generates an 8-bit single-channel mask texture (R8) marking which pixels
/// are inside the frosted-glass border region for a given window rectangle.
///
/// Returns the raw pixel data and dimensions as `(data, width, height)`.
pub fn generate_border_mask(
    window_x: f32,
    window_y: f32,
    window_w: f32,
    window_h: f32,
    screen_w: u32,
    screen_h: u32,
    params: &GlassBorderParams,
) -> (Vec<u8>, u32, u32) {
    let mut data = vec![0u8; (screen_w * screen_h) as usize];

    let thickness = params.thickness;
    let radius = params.corner_radius;

    for py in 0..screen_h {
        for px in 0..screen_w {
            let x = px as f32;
            let y = py as f32;

            // Is pixel inside the outer window bounds?
            let in_outer = x >= window_x
                && x < window_x + window_w
                && y >= window_y
                && y < window_y + window_h;

            // Is pixel outside the inner (content) bounds?
            let in_inner = x >= window_x + thickness
                && x < window_x + window_w - thickness
                && y >= window_y + thickness
                && y < window_y + window_h - thickness;

            if in_outer && !in_inner {
                // Apply rounded-corner SDF for smooth anti-aliased corners
                let cx = x - window_x;
                let cy = y - window_y;
                let half_w = window_w * 0.5;
                let half_h = window_h * 0.5;
                let dx = (cx - half_w).abs() - (half_w - radius);
                let dy = (cy - half_h).abs() - (half_h - radius);
                let dist = (dx.max(0.0).powi(2) + dy.max(0.0).powi(2)).sqrt()
                    + dx.max(dy).min(0.0);
                let outer_sdf = dist - radius;

                // Anti-alias: smooth step over 1 pixel
                let alpha = 1.0 - (outer_sdf).clamp(0.0, 1.0);
                data[(py * screen_w + px) as usize] = (alpha * 255.0) as u8;
            }
        }
    }

    (data, screen_w, screen_h)
}

// ─── Shader compilation helpers ─────────────────────────────────────────────

/// Describes the full frosted-glass GPU pipeline state.
///
/// On real hardware this struct would hold the compiled shader programs and
/// FBO handles.  In this reference implementation it stores the creation
/// parameters so the pipeline can be rebuilt if the GPU context is lost.
#[derive(Debug)]
pub struct GlassPipeline {
    pub params: GlassBorderParams,
    /// Blur down-sample factor (e.g. 4 → blur at ¼ resolution)
    pub downsample_factor: u32,
    /// Number of Gaussian blur passes (default: 2 for two-pass separable)
    pub blur_passes: u32,
}

impl GlassPipeline {
    /// Create a new glass rendering pipeline with default parameters.
    pub fn new() -> Self {
        Self {
            params: GlassBorderParams::default(),
            downsample_factor: 4,
            blur_passes: 2,
        }
    }

    /// Create with custom border parameters.
    pub fn with_params(params: GlassBorderParams) -> Self {
        Self {
            params,
            downsample_factor: 4,
            blur_passes: 2,
        }
    }

    /// Log the shader source lengths for debugging.
    pub fn describe(&self) {
        log::info!(
            "GlassPipeline: vert={} bytes, blur_frag={} bytes, composite_frag={} bytes",
            FULLSCREEN_VERT.len(),
            GAUSSIAN_BLUR_FRAG.len(),
            GLASS_COMPOSITE_FRAG.len(),
        );
        log::info!(
            "GlassPipeline: downsample={}×, blur_passes={}, border_thickness={:.1}px",
            self.downsample_factor,
            self.blur_passes,
            self.params.thickness,
        );
    }
}
