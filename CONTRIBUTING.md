# Contributing to Poly OS 🌐

Thank you for your interest in contributing to **Poly OS**! We are building an ultra-lightweight hybrid operating system that combines the tactile fluidity and spring physics of iOS with the power and multi-window productivity of desktop Linux/Windows.

Whether you are fixing a UI bug, polishing spring physics, implementing a Wayland compositor feature in Rust, or drafting documentation, your contributions are warmly welcomed!

---

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Repository Architecture](#repository-architecture)
- [Getting Started & Local Setup](#getting-started--local-setup)
- [How to Contribute](#how-to-contribute)
- [Git & Branching Workflow](#git--branching-workflow)
- [Coding Guidelines](#coding-guidelines)
- [Testing Your Changes](#testing-your-changes)
- [Submitting a Pull Request](#submitting-a-pull-request)

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful, constructive, and open to feedback during discussions, issue triages, and code reviews.

---

## Repository Architecture

Poly OS is organized into modular subsystems:

```
poly-os/
├── poly-shell/                   # Interactive Web Shell UI & Compositor Simulator
│   ├── index.html                # Shell DOM structure & desktop layout
│   ├── style.css                 # Glassmorphic layout, gap system, & animations
│   ├── shell.js                  # Spring physics, window management, and built-in apps
│   └── manifest.json             # PWA metadata & desktop icons
├── poly-daemon/                  # Background task & battery supervisor
│   ├── polyd.py                  # Linux cgroups v2 lifecycle & ZRAM manager
│   └── polyd.toml                # User & system daemon configuration file
├── poly-compositor/              # Native Wayland compositor in Rust
│   ├── Cargo.toml                # Rust dependencies (Smithay, Wayland protocols)
│   └── src/
│       ├── main.rs               # Compositor bootstrap & render loop
│       ├── physics.rs            # 120Hz RK4 spring integration math
│       └── window.rs             # Magnetic Aero Snap & FancyZones tiling engine
├── iso-build/                    # Bootable Live ISO pipeline
│   └── build-iso.sh              # Musl/Alpine Linux rootfs mastering script
├── preview.py                    # Zero-dependency local preview runner
├── CONTRIBUTING.md               # Contribution guidelines (this file)
└── README.md                     # High-level architecture & visual showcase
```

---

## Getting Started & Local Setup

### 1. Prerequisites
- **Python 3.10+**: For running the local preview server and the `polyd` daemon.
- **Node.js 18+** *(Optional)*: For running syntax validation checks on `shell.js`.
- **Rust 1.75+ & Cargo** *(Optional)*: If working on `poly-compositor`.

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/poly-os.git
cd poly-os
```

### 3. Start the Local Interactive Shell
To test the web shell and built-in apps:
```bash
python preview.py
```
Open your browser at **`http://localhost:5173/index.html`**. Any changes made to `poly-shell/index.html`, `style.css`, or `shell.js` will immediately be visible on refresh.

### 4. Test the Background Lifecycle Daemon
```bash
cd poly-daemon
python polyd.py --config polyd.toml
```

### 5. Build or Check the Native Compositor
```bash
cd poly-compositor
cargo check
cargo run
```

---

## How to Contribute

### Finding an Issue
- Check out our [Open Issues](https://github.com/your-username/poly-os/issues).
- Look for the **`good first issue`** label if you are new to the codebase.
- Comment on the issue to let others know you are working on it so work is not duplicated.

### Proposing New Features or Reporting Bugs
- If you found a bug, please submit a **[Bug Report](https://github.com/your-username/poly-os/issues/new?template=bug_report.yml)**.
- If you have an idea for a feature or redesign, please open a **[Feature Request / RFC](https://github.com/your-username/poly-os/issues/new?template=feature_request.yml)** first to align on architecture.

---

## Git & Branching Workflow

1. **Fork the repository** on GitHub.
2. **Create a descriptive feature branch** off `main`:
   ```bash
   git checkout -b feat/code-studio-tabs
   # or
   git checkout -b fix/split-snap-gap
   ```
3. **Commit your changes** using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add markdown live preview to notes app`
   - `fix: resolve snap assist recommendation loop`
   - `docs: update setup steps in CONTRIBUTING.md`
   - `refactor: optimize spring physics loop timing`
   - `style: tighten split window margins to 6px`
4. **Push to your fork**:
   ```bash
   git push origin feat/code-studio-tabs
   ```
5. **Open a Pull Request** against the `main` branch of `poly-os`.

---

## Coding Guidelines

### 1. `poly-shell` (Frontend JavaScript & CSS)
- **Vanilla ES6+**: Keep dependencies minimal. Use modern vanilla JavaScript (arrow functions, modules, template literals, `async`/`await`).
- **Spring Physics**: All window movement, snapping, and animations must adhere to the 120Hz mass-spring-damper physics engine ($k = 260\ \text{N/m}$, $\zeta = 0.82$). Avoid rigid linear CSS transitions for window movement.
- **Glassmorphic Theming**: Respect the global CSS custom properties defined in `style.css` (e.g., `--glass-bg`, `--glass-border`, `--window-border-radius`).
- **Gap Tolerances**: Follow the unified spacing rules (6px inner tiling gaps, 4px dock clearance, flush top status bar alignment).

### 2. `poly-daemon` (Python)
- Follow **PEP 8** style guidelines.
- Use explicit type annotations for function signatures.
- Prefer Python standard library modules (`tomllib`, `dataclasses`, `logging`, `pathlib`).

### 3. `poly-compositor` (Rust)
- Format code before submitting:
  ```bash
  cargo fmt --check
  ```
- Run Clippy to catch common lints:
  ```bash
  cargo clippy --all-targets -- -D warnings
  ```
- Ensure all unit tests pass:
  ```bash
  cargo test
  ```

---

## Testing Your Changes

Before submitting your pull request, please verify the following:

1. **JavaScript Syntax Verification**:
   ```bash
   node -c poly-shell/shell.js
   ```
2. **Interactive UI Verification**:
   - Launch `python preview.py` and test the affected feature in Chrome/Firefox/Safari.
   - Test window dragging, snapping to left/right halves, and minimizing/restoring.
   - Verify keyboard shortcuts (<kbd>Win + Left/Right/Up</kbd>, <kbd>Alt + Tab</kbd>, <kbd>Ctrl + Enter</kbd> in Code Studio).
3. **Responsive & Refresh Validation**:
   - Ensure the dock scales smoothly and system tray icons remain pinned.
   - Verify `localStorage` persistence where appropriate (e.g. desktop icon coordinates, notes content, code buffers).

---

## Submitting a Pull Request

1. Fill out the provided **[Pull Request Template](.github/pull_request_template.md)** completely.
2. Link the relevant issue number (`Fixes #1` or `Closes #4`).
3. Include screenshots, GIFs, or short screen recordings for any UI changes.
4. Maintain polite, constructive communication during code reviews.

Thank you for contributing to the future of **Poly OS**! 🚀
