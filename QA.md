# Quality Assurance & Verification Report

## Automated Test Suite

- `node tests/mission.test.js` / `node tests/flight.test.cjs` — Full mission flow from countdown to soft landing; steering avoidance; collision handling; corridor boundaries; hard-touchdown failure states; stage separation windows; cutscene playback; pause, restart, and delta-time clamping[cite: 6].
- `node tests/collisions.test.cjs` — Continuous swept-sphere collision detection at high relative velocities, glancing impacts, near-misses, impulse rebound, shield/hull damage layers, destruction state, and full reset[cite: 6].
- `node tests/mars.test.js` — Headless Three.js scene initialization, rover movement across Martian terrain, energy management, and all six permutations of collecting the three archival scientific records[cite: 6].
- `node tests/communications.test.js` — UHF/X-band channel routing, orbital flyby window timing, packet transmission, pause/reset behavior, and scientific conclusion validation[cite: 6].
- Syntax and asset path verification passed across all HTML pages (`index.html`, `mars.html`, `communications.html`) and JavaScript modules[cite: 2, 3, 5, 6].

## Desktop & Mobile Browser Verification

Tested both locally and via the live GitHub Pages deployment across desktop laptops and physical mobile smartphones:

- **Full End-to-End Playthrough:** Intro cutscene → launch clearance → countdown → Atlas V 541 ascent with 3 stage separations → deep-space cruise & asteroid collision physics → Phobos flyby → powered Mars landing → Gale Crater rover exploration → DSN telecommunications and scientific decoding[cite: 2, 3, 5, 6, 7].
- **3D Rendering & NASA Models:** WebGL scenes and NASA 3D geometries (Atlas V and Curiosity rover) load cleanly without console errors or warnings[cite: 6].
- **Cross-Device & Responsive Testing:**
  - Verified on **desktop/laptop viewports** (`1280×800`, `1280×720`) with keyboard (`WASD` / Arrow keys / `Space`) and mouse wheel FOV zoom[cite: 6, 7].
  - Verified on **physical mobile devices** as well as portrait (`390×844`, `477×671`) and landscape (`844×390`) viewports — all on-screen touch controls, action buttons, and HUD panels scale cleanly and respond accurately to touch input[cite: 6].
- **Failure & Recovery States:** Confirmed hard-landing diagnostics, asteroid hull destruction, missed staging windows, and instant stage/mission restart functionality[cite: 6].

## Technical & Scientific Scope Notes

- Orbital trajectories, time compression, hazard fields, and resource thresholds are scaled for interactive educational gameplay rather than literal celestial mechanics[cite: 2, 5, 6, 7].
- Surface exploration uses the official NASA/VTAD Curiosity model; the launch vehicle is an interactive adaptation of NASA's Atlas V geometry (see `assets/models/SOURCES.md`)[cite: 6, 7].
