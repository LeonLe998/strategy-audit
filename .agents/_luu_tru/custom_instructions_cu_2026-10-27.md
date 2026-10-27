# Workspace Rules & Custom Instructions: Strategy Audit, Data Science & 3D Quantitative Platform

This document defines the custom instructions, coding standards, and architectural conventions for the **Strategy Audit & Data Science Quantitative 3D Platform**.

---

## 1. Core Architecture & Technology Stack
- **Framework**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS + Custom Dark Theme Tokens (Obsidian `#061624`, `#07131e`, Neon Emerald `#00ffa3`, Bioluminescent Cyan `#06b6d4`, Cyber Violet `#8b5cf6`).
- **3D Graphics & Game Engine**: Three.js (`three` + `three/examples/jsm/`) for high-performance WebGL 3D math surface rendering, chaotic dynamics (Lorenz Attractor), probability density (Gaussian surfaces), and custom 3D model add-ons (`.glb`, `.gltf`, `.obj`).
- **Animations**: Framer Motion / Motion for scroll-driven animations, parallax effects, and smooth transitions.
- **Audio**: Web Audio API synthesized procedural sound effects (zero external audio asset dependencies).

---

## 2. Data Science & Quantitative Mathematics Integration
- **Statistical Rigor**: Apply Monte Carlo permutation testing (10,000 runs) to verify whether backtest returns are statistically significant (p-value < 0.01) or mere artifacts of data mining.
- **Time Series Econometrics**: Check stationarity (ADF test) and model volatility clustering (GARCH(1,1)).
- **Machine Learning & Validation**: Enforce Purged & Embargoed Cross-Validation to prevent forward-looking data leakage.
- **Tail Risk Analytics**: Compute Value-at-Risk (VaR 99%), Conditional VaR (Expected Shortfall), and Risk of Ruin probability.

---

## 3. 3D Game World & Add-on 3D Model Conventions
- **Dual Mode**:
  1. *Scrollytelling Mode*: Background 3D camera smoothly glides through quantitative landmarks (Gaussian Surface, Lorenz Attractor, 300 Strategies Citadel, Sáu Ô Arena) linked to page scroll position.
  2. *Playable 3D Game Mode*: Fullscreen interactive drone exploration with WASD/Arrows/Touch Joystick, GPS radar minimap, checkpoints, and mathematical core collection.
- **3D Model Add-on Extensibility**:
  - Drag-and-drop or file picker for custom `.glb`, `.gltf`, and `.obj` 3D models.
  - Procedural presets: 3D Gaussian Bell Surface, 3D Lorenz Strange Attractor, 3D Volatility Surface, Quantum Vault Core, Cyber Drone.
  - Proper disposal of Three.js geometries and materials to maintain 60fps performance without memory leaks.

---

## 4. Scroll Animation Standards
- Employ scroll-driven progress bars, chapter pill navigators, staggered card reveals, floating badge parallax, and smooth number counters.
- Use `requestAnimationFrame` with lerp for 3D camera scroll synchronization.
