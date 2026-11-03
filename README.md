# Alien Escapade: Customizable 2D Arcade Game

**Course:** Multimedia Systems Lab — Lab Test 2  
**Implementation:** Built with HTML5 Canvas, CSS3, and Vanilla JavaScript.  
**Architecture:** 100% self-contained with zero external dependencies, images, or audio files. Every sprite is rendered procedurally in Canvas 2D and every sound effect and music track is synthesized via the Web Audio API.

---

## 1. Story and Rules
You are an alien office worker (Gleep the Alien Intern) somewhere in the corporate galaxy. Your energy and caffeine metabolism keep draining continuously over time. You must grab energy drinks and coffee cups to stay awake, while dodging urgent office emails, evading security patrol guards, and escaping your angry boss, **Boss Zorg**.

### Object Legend & Gameplay Mechanics:
| Object | Visual Indicator | Gameplay Effect |
|---|---|---|
| **Energy Drink / Coffee** | Cyan mug with rising steam | **+10 points** and **+25 Energy** |
| **Double Espresso** | Large gold mug with star emblem | **+50 points** and **+60 Energy** |
| **Urgent Email** | Red holographic envelope with '!' badge | **-1 Life** and **-5 points** (wobbles in sine-wave) |
| **Security Guard Drone** | Purple patrol drone with red scanner visor | **-1 Life** and **-10 points** |
| **Day-Off Pass** | Glowing blue/cyan orbital energy orb | Activates the assigned special power-up for **7 seconds** |
| **Boss Zorg** | Purple alien executive in a sharp business suit | Chases player continuously; contact costs a life |

- **Energy / Metabolism Mechanic:** Energy is displayed as a top-center progress bar (0–100%). It drains continuously every frame and drains faster as the level increases.
  - At **0% Energy**, the player suffers **Burnout**: loses 1 life, and energy automatically resets to 50% with invulnerability recovery frames.
- **Lives:** You start with **3 Alien Lives** (`👽 👽 👽`). When all lives reach 0, the game is over.
- **Level Progression:** $\text{Level} = \lfloor\frac{\text{Score}}{\text{PointsPerLevel}}\rfloor + 1$. Each level increases item speed, obstacle spawn frequency, and Boss Zorg's pursuit speed.
- **Game States:** **Start Screen**, **Active Gameplay**, **Paused**, and **Game Over**. You can restart instantly without reloading the page.

---

## 2. Controls
- **Move Alien Intern:**
  - `Arrow Keys` or `W`, `A`, `S`, `D`
  - **Mouse / Touch:** Move mouse or drag finger across the screen (the alien smoothly tracks your cursor).
- **Start / Restart:** `Space`, `Enter`, or click on-screen buttons.
- **AI Autoplay Demo Mode:** `T` key or click `🤖 WATCH AI DEMO` (automatically steers to collect coffee and dodge hazards).
- **Pause / Resume:** `P` key or pause button in the HUD.
- **Mute / Unmute Sound:** `M` key or speaker button in the HUD.
- **Live Customization & Viva Demo Drawer:** `C` key or gear icon `⚙️` in the top right.

---

## 3. How to Run
1. Ensure the following three files are located in the same directory:
   - `index.html`
   - `style.css`
   - `game.js`
2. **Double-click `index.html`** in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Safari).
3. No web server, node modules, or external installation is required.

---

## 4. Customization (Assigned Lab Requirement)
All game configuration options are centralized at the very top of `game.js` in the `CONFIG` object:

```javascript
const CONFIG = {
    // Collectible Item configuration
    collectible: {
        name: "Coffee Cup",
        color: "#00f0ff",        // Cyan glow
        points: 10,              // Points awarded for normal drink
        goldPoints: 50,          // Points awarded for double espresso
        refill: 25,              // Energy restored by normal drink (0-100 scale)
        goldRefill: 60           // Energy restored by double espresso
    },

    // Hazard configuration
    hazard: {
        name: "Urgent Email",
        color: "#ff3366",        // Urgent red glow
        lifeLoss: 1,             // Number of lives lost on collision
        scorePenalty: 5          // Score deducted when hit
    },

    // Guard Hazard configuration (Alien Security Patrol)
    guard: {
        name: "Security Drone",
        color: "#a855f7",
        lifeLoss: 1,
        scorePenalty: 10
    },

    // Energy drain mechanics (burnout rate per second)
    energyDrain: 2.5,            // Units of energy drained per second at Level 1

    // Power-up special effect: 'slow' | 'shield' | 'double'
    // - 'slow': Objects & Boss move at 50% speed for 7 seconds
    // - 'shield': Complete immunity to hazards/boss + vaporizes incoming emails
    // - 'double': All points gained are doubled (2x) for 7 seconds
    powerup: "slow",

    // Difficulty progression rule: 'speed' | 'spawn' | 'both'
    // - 'speed': Objects move faster as level increases
    // - 'spawn': Objects spawn more frequently as level increases
    // - 'both': Both speed and spawn rate scale with level
    difficulty: "both",

    // Lives & Level rules
    lives: 3,                   // Starting player lives
    pointsPerLevel: 100,        // Score needed to advance each level
    bossFromLevel: 2,           // Level at which Boss Zorg appears
    bossName: "Boss Zorg",      // Name of the chasing Boss

    // Visual Theme
    bg: "alien_structure",      // Visual theme: "alien_structure"
    accent: "#00f0ff",          // Neon accent color
    playerColor: "#39ff14"      // Neon green alien intern
};
```

### Demonstration of Assigned Customizations:
During the lab evaluation, you can demonstrate customizations in two ways:
1. **Via Code:** Modify any property in the `CONFIG` object in `game.js` and refresh.
2. **Via Live In-Game Demo Panel (Press `C`):** Open the slide-out panel to switch power-ups (`slow`, `shield`, `double`), toggle hazard life loss, test different energy drain rates, and instantly summon Boss Zorg or spawn test items with one click.

---

## 5. Algorithm Explanation

### 1. Game Loop & Delta Timing:
The game runs on the browser's `requestAnimationFrame(loop)`. Each frame calculates:
$$\Delta t = \min\left(\frac{t_{\text{current}} - t_{\text{last}}}{1000}, 0.1\right)$$
Using $\Delta t$ guarantees that player movement, item scrolling, and particle physics proceed at identical speeds regardless of whether the monitor refreshes at 60Hz, 120Hz, or 144Hz.

### 2. Spawning Mechanism:
Every `spawnGap` frames, `spawn()` triggers at the right canvas boundary (`x = width + 30`) with a random vertical position $y \in [60, \text{height} - 60]$. A pseudo-random floating roll decides the entity type:
- **Coffee Cup:** 40% probability
- **Urgent Email:** 30% probability
- **Double Espresso:** 12% probability
- **Security Guard Drone:** 12% probability
- **Day-Off Pass:** 6% probability

### 3. Movement & Trajectory Math:
- Horizontal displacement: $x \leftarrow x + (v_x \cdot \text{speedMultiplier} \cdot \Delta t)$.
- **Email Sine-Wave Flutter:** Urgent emails oscillate vertically using:
  $$y = y_{\text{base}} + \sin(\text{time} \cdot \text{frequency}) \cdot \text{amplitude}$$
- Items that scroll past the left edge ($x < -40$) are cleanly spliced from the entity array to prevent memory leaks.

### 4. Continuous Energy Drain & Burnout:
Energy drains every frame based on the formula:
$$\text{Energy} \leftarrow \text{Energy} - \text{energyDrain} \times [1 + 0.1 \times (\text{level} - 1)] \times \Delta t$$
When $\text{Energy} \le 0$, `hurt('burnout')` executes, subtracting 1 life and resetting energy to 50%.

### 5. Difficulty Progression:
- $\text{Level} = \lfloor\frac{\text{score}}{\text{pointsPerLevel}}\rfloor + 1$
- **Speed Multiplier:** $1 + 0.15 \times (\text{level} - 1)$
- **Spawn Interval:** $\max(18, 55 - 6 \times (\text{level} - 1))$ frames
- At Level 2 (or higher), **Boss Zorg** enters the screen with pursuit behavior.

### 6. Boss Zorg Chasing AI (Normalized Vector):
To smoothly chase the alien intern across 2D space, the vector from Boss $(b_x, b_y)$ to Player $(p_x, p_y)$ is computed and normalized:
$$\Delta x = p_x - b_x, \quad \Delta y = p_y - b_y$$
$$\text{distance} = \sqrt{\Delta x^2 + \Delta y^2}$$
$$\vec{v}_{\text{boss}} = \left(\frac{\Delta x}{\text{distance}} \times \text{speed}_{\text{boss}}, \; \frac{\Delta y}{\text{distance}} \times \text{speed}_{\text{boss}}\right)$$

---

## 6. Collision Detection Logic
Every entity (player, coffee mugs, emails, guards, and the boss) is bounded by a circular bounding region centered at $(x, y)$ with radius $r$.

Two entities $A$ and $B$ collide if the Euclidean distance between their centers is strictly less than the sum of their radii:

```javascript
checkCollision(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r;
}
```

Where `Math.hypot(dx, dy)` calculates $\sqrt{dx^2 + dy^2}$.

### Hit Handling & Invulnerability Buffer:
- On collectible collision: Points and energy are granted, and particle bursts trigger.
- On hazard collision: The player loses lives/points, and an invulnerability timer is set to **90 frames** (~1.5 seconds) with an alternating alpha blink (`globalAlpha = 0.35`). This prevents multiple lives from being lost on a single overlapping collision.

---

## 7. Multimedia Elements
1. **Procedural Vector Graphics (Canvas 2D):**
   - **Gleep the Alien Intern:** 3 directional tracking eyes, antenna with glowing bulb, fluttering red corporate tie, and jetpack exhaust particles.
   - **Coffee Cup & Double Espresso:** Porcelain mug with rising animated steam curves and coffee emblem.
   - **Urgent Email:** Holographic envelope with glowing red flap, exclamation badge, and sine-wave motion.
   - **Security Drone:** Floating chassis with rotating stun prongs and scanning light beam.
   - **Boss Zorg:** Purple alien executive with an angry brow, sharp teeth, and sharp charcoal office suit with a red tie.
   - **Alien Structure Background:** Cybernetic neon conduits, architectural pillars, scrolling parallax stars, and holographic billboards.
2. **Web Audio API Synthesizer:**
   - Real-time audio synthesis using oscillator nodes, gain ramps, and biquad filters:
     - `playDrink()`: Bubbly triangle-wave gulp chirp.
     - `playBonus()`: 3-note ascending golden chime.
     - `playHit()`: Sawtooth electric static buzz.
     - `playBossAlert()`: Sweeping klaxon siren.
     - `playLevelUp()`: Major triad fanfare.
     - `playGameOver()`: Descending minor cadence.
     - `startBGM()`: 8-bit space-office bassline and lead arpeggio.

---

## 8. Screenshots for Lab Submission
You can take screenshots anytime using `Win + Shift + S` on Windows, or click the built-in **"📸 SAVE LAB SCREENSHOT"** button on the Game Over screen:
1. **Start Screen:** Shows the title, objective, instructions, and customization badge.
2. **Active Gameplay:** Shows the alien player collecting coffee, dodging emails, and the energy bar.
3. **Boss Encounter:** Shows Boss Zorg actively chasing the player.
4. **Game Over Screen:** Shows final score, statistics, and high score.
5. **Assigned Customization Active:** Shows the live customization panel with special power-up or custom rules active.

---

## 9. Likely Viva Questions & Answers
- **Q: Where and how is collision detection implemented in your code?**  
  *A:* In the `checkCollision(a, b)` method in `game.js`, which uses the circle-circle collision formula `Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r`. It is evaluated during the entity iteration inside `update()`.
- **Q: How does the energy mechanic work?**  
  *A:* A float variable `energy` (0 to 100) decreases each frame by `energyDrain * (1 + 0.1 * (level - 1)) * dt`. Collecting coffee refills it via `Math.min(100, energy + refill)`. Reaching 0 triggers `hurt('burnout')`.
- **Q: How does difficulty increase as the game progresses?**  
  *A:* `level` scales with score. As level increases, obstacle horizontal speed scales by `1 + 0.15 * (level - 1)`, spawn frequency increases by reducing the frame gap down to 18 frames, and Boss Zorg appears.
- **Q: How do you change or demonstrate the assigned customization?**  
  *A:* By editing the `CONFIG` object at the top of `game.js` (e.g. changing `powerup` to `'shield'`, `'slow'`, or `'double'`), or by pressing `C` in-game to toggle the live customization panel.
- **Q: Why use delta time ($\Delta t$) instead of fixed increments?**  
  *A:* Delta time decouples gameplay updates from the display refresh rate, ensuring that movement and animations run at the exact same physical speed on a 60Hz laptop or a 144Hz monitor.
