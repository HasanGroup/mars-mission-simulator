# 🚀 CURIOSITY — Historical Events & Scientific Discoveries (3D Mission Simulator)

> **NASA Space Apps Challenge Project**  
> An interactive 3D web simulation of NASA's **Mars Science Laboratory (Curiosity)** mission — from launch clearance and stage separation aboard an Atlas V 541 rocket to Gale Crater surface exploration and Deep Space Network (DSN) telecommunications[cite: 2, 3, 5, 7].

🌐 **Live Demo:** [https://hasangroup.github.io/mars-mission-simulator/](https://hasangroup.github.io/mars-mission-simulator/)  
📂 **Repository:** [https://github.com/HasanGroup/mars-mission-simulator](https://github.com/HasanGroup/mars-mission-simulator)

---

## 🎯 Project Overview & Educational Impact

Planetary missions involve complex engineering, multi-stage aerodynamics, and deep-space communications that are difficult for students to grasp from static textbooks. **Curiosity: Path to Mars** transforms verified NASA mission archives and scientific discoveries into an interactive, zero-install 3D browser experience[cite: 2, 3, 5, 7].

* **Entry Point:** `index.html` (runs completely offline without an internet connection, except for external NASA reference links; WebGL is required for 3D flight and surface exploration).
* **Cross-Platform:** Supports desktop keyboard controls and responsive mobile touch interfaces[cite: 2, 3, 5].

---

## 🗺️ Mission Route & Gameplay Flow

1. **Mission Background & Launch Clearance (`index.html`)**[cite: 3, 7]
   * Presents the historical context of NASA's Mars Science Laboratory (MSL)[cite: 3, 7].
   * Features a dedicated launch-clearance screen: on **November 26, 2011**, Omar Baez (Launch Director, NASA Launch Services Program) gave his official *"go"* for launch aboard ULA's **Atlas V 541**[cite: 3, 7]. Clicking **"Signal Received"** initiates the countdown.
2. **3D Launch, Transit & Mars Landing (`index.html`)**[cite: 3, 7]
   * Autonomous engine cutscene (mission control room → launch pad with smoke and engine ignition) followed by an external rear-quarter launch view[cite: 3, 7].
   * **Active Stage Separation (`Space` / on-screen button):** Players must trigger three timed separation events within altitude windows:
     * **First Stage & SRBs:** `40–55 km`[cite: 7]
     * **Centaur Upper Stage:** `110–130 km`[cite: 7]
     * **Payload Fairing:** `160–180 km`[cite: 7]
   * **Deep Space Cruise & Phobos Flyby:** Smooth third-person Chase Cam through a three-layer procedural starfield (`js/space-sky.js`) with continuous collision physics against asteroid hazards[cite: 3, 7].
   * **Mars Approach & Powered Descent:** Smooth 1.6s scene transitions leading to powered landing on **August 6, 2012 (UTC)**[cite: 7]. *(Note: Atmospheric entry and parachute deployment are compressed into the transition; no orbital docking occurs[cite: 7].)*
3. **Gale Crater Surface Exploration (`mars.html`)**[cite: 5, 7]
   * Drive the official static **NASA/VTAD Curiosity rover model** across Martian terrain to locate and scan three real NASA archival milestones within 180 seconds of active driving[cite: 5, 7]:
     * **Hottah Outcrop:** Rounded gravel conglomerates indicating transport by an ancient flowing stream[cite: 2, 5, 7].
     * **John Klein / Yellowknife Bay:** Clay minerals and chemical conditions (analyzed by *CheMin* and *SAM*) confirming an ancient habitable environment[cite: 2, 5, 7].
     * **RAD (Radiation Assessment Detector):** Surface radiation measurements used to evaluate health risks for future human Mars expeditions[cite: 2, 5, 7].
4. **Deep Space Telecommunications (`communications.html`)**[cite: 2, 7]
   * Configure the relay path: select **UHF**, wait for the green orbital pass window, and transmit all three research records via **Mars Odyssey** or **Mars Reconnaissance Orbiter (MRO)**[cite: 2, 7].
   * Switch to **X-band** and the **NASA Deep Space Network (DSN)** to deliver data to Earth[cite: 2, 7].
   * Decode results from **Mastcam**, **CheMin/SAM**, and **RAD**, then select the scientifically accurate conclusion: *ancient Mars possessed conditions habitable for microbial life (not the discovery of living organisms)*[cite: 2, 7].

---

## 🎮 Controls & Physics Mechanics

### Flight & Landing (`index.html`)
* **Steering:** `W A S D` / `Arrow Keys` or on-screen touch buttons (maintain launch pitch deviation within `±6.7°`; ascent thrust is automatic)[cite: 3, 7].
* **Stage Separation & Landing Burn:** `Spacebar` or on-screen action button[cite: 3, 7].
* **Camera Zoom:** Smooth FOV adjustment via mouse wheel[cite: 7].
* **Landing Thresholds:** Touchdown vertical speed `≤ 3.5 m/s`, lateral speed `≤ 1.5 m/s`, target circle deviation `≤ 6 m`[cite: 7].
* **Space Collision Physics:** Continuous swept-sphere collision detection (MSL bounding radius `2.3` units; asteroid radius `1.15×` geometry) with partially elastic impulse response (restitution `0.42`), shield/hull damage layers, light flash, 72-particle bursts, and damped Chase Cam shake[cite: 7].

### Surface Rover (`mars.html`)
* **Drive:** `W A S D` / `Arrow Keys` (`W`/`↑` forward along `-Z`, `S`/`↓` reverse)[cite: 5, 7].
* **Scan Record:** `E` or **"Study Record"** button (reading archival cards pauses the mission timer)[cite: 5].
* **Camera / Brake:** `C` to switch camera views; `Spacebar` to brake[cite: 5].

---

## 🔬 Scientific Validity & Scope Boundaries

All historical dates, spacecraft systems, radio frequencies, and scientific conclusions are grounded in official NASA documentation[cite: 7]. To provide an accessible interactive educational experience rather than a raw engineering digital twin, the simulation clearly distinguishes game abstractions from historical telemetry[cite: 7]:

* **Automated vs. Manual Control:** Real launch, stage separations, and Sky Crane landing were executed autonomously; manual steering, staging windows, asteroid fields, and the close Phobos flyby are interactive gameplay mechanics[cite: 3, 7].
* **Simplified Orbital & Surface Scales:** Flight durations, speed thresholds, rover power reserves, terrain distances, and the three "data packets" (representing grouped research findings rather than a single literal telemetry pass) are scaled for a 3–5 minute educational session[cite: 2, 5, 7]. While Curiosity could transmit directly to Earth, this module demonstrates orbiter relay via UHF/X-band[cite: 2, 7].
* **Scientific Precision:** Evidence of a habitable environment does not prove past or present life, and RAD measurements inform radiation shielding rather than guaranteeing crew safety[cite: 2, 7].
* **3D Models:** Surface exploration uses the official NASA/VTAD Curiosity model; the Atlas V launcher is an adaptation of NASA's Atlas V 551 model configured with four SRBs (see `assets/models/SOURCES.md`)[cite: 5, 7].

---

## 📚 NASA Open Data & Official Sources

* [NASA Spaceport News (Aug 10, 2012, p. 1)](https://www3.nasa.gov/centers/kennedy/pdf/676259main_aug10-2012.pdf) — Launch Director Omar Baez and the Nov 26, 2011 launch clearance[cite: 7].
* [NASA Science: Curiosity's Launch](https://science.nasa.gov/resource/curiositys-launch/) — Launch coverage and archival media[cite: 7].
* [NASA Curiosity Poster (PDF)](https://science.nasa.gov/wp-content/uploads/2024/03/CuriosityPoster.pdf) — Atlas V 541 specifications and mission timeline[cite: 7].
* [NASA/JPL: Mars Science Laboratory / Curiosity](https://www.jpl.nasa.gov/missions/mars-science-laboratory-curiosity-rover-msl/) — Mission objectives, Gale Crater landing, and Sky Crane[cite: 3, 7].
* [NASA Science: Communicating with Curiosity](https://science.nasa.gov/resource/communicating-with-curiosity-2/) & [NASA MSL Communications](https://mars.nasa.gov/internal_resources/822/) — UHF orbiter relays, X-band links, and Deep Space Network (DSN)[cite: 2, 7].
* [NASA/JPL (Sep 27, 2012): Ancient Streambed](https://www.jpl.nasa.gov/news/nasa-rover-finds-old-streambed-on-martian-surface/) — Rounded pebbles at Hottah[cite: 7].
* [NASA/JPL (Mar 12, 2013): Habitable Environment](https://www.jpl.nasa.gov/news/nasa-rover-finds-conditions-once-suited-for-ancient-life-on-mars/) — CheMin, SAM, and Yellowknife Bay findings[cite: 7].
* [NASA Science (Dec 9, 2013): Radiation Exposure](https://science.nasa.gov/resource/radiation-exposure-comparisons-with-mars-trip-calculation/) — RAD data applied to human Mars mission risk assessment[cite: 7].

---

## 🧪 Local Development & Automated Tests

No external bundlers or npm dependencies are required to run the application[cite: 7].

### Run Local Preview Server
```bash
node tools/preview.cjs
# Open [http://127.0.0.1:4173](http://127.0.0.1:4173) in a WebGL-enabled browser
