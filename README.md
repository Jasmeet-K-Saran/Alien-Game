# 👽 Alien Escapade: Customizable 2D Arcade Game

> **Multimedia Systems Lab — Lab Test 2**  
> **Author:** Jasmeet Kaur Saran  
> **Repository:** [github.com/Jasmeet-K-Saran/Alien-Game](https://github.com/Jasmeet-K-Saran/Alien-Game)  
> **Tech Stack:** HTML5 Canvas, CSS3, Modern JavaScript (Vanilla) & Python / Pygame

---

## 🌟 Game Overview
**Alien Escapade** is a high-octane 2D arcade game built entirely from scratch. You control **Gleep**, a hard-working alien office intern whose caffeine metabolism drains continuously over time. You must collect steaming **Coffee Cups** and high-potency **Double Espressos** to prevent burnout, dodge floating **Urgent Emails**, evade **Alien Security Drones**, and outrun your angry corporate boss, **Boss Zorg**!

### Key Technical Highlights:
- **100% Self-Contained:** Zero external image, sprite, or audio files. All graphics are procedurally generated with Canvas 2D paths, and all sound effects and music are synthesized in real-time via the Web Audio API.
- **Autonomous AI Autoplay Demo:** Built-in AI steering mode (press **`T`**) that plays the game automatically for presentations.
- **Refresh-Rate Independent:** Uses high-precision Delta Time ($\Delta t$) physics ensuring identical gameplay speed on 60Hz, 120Hz, and 144Hz displays.
- **Zero-Setup Execution:** Double-click `index.html` to run immediately in any browser without needing servers, libraries, or installations.

---

## 🎮 Objects & Rules

| Object | In-Game Visual | Effect on Player |
|---|---|---|
| ☕ **Coffee Cup** | Cyan mug with rising steam curls | **+10 Points**, **+25% Energy / Caffeine** |
| 🌟 **Double Espresso** | Shimmering gold mug with star emblem | **+50 Points**, **+60% Energy / Caffeine** |
| ✉️ **Urgent Email** | Red holographic envelope with '!' badge | **-1 Life**, **-5 Points** (sine-wave wobble) |
| 👾 **Security Drone** | Purple patrol drone with red laser scanner | **-1 Life**, **-10 Points** (corridor patrol) |
| 🔮 **Day-Off Pass** | Glowing cyan orbital energy sphere | Activates assigned power-up for **7 Seconds** |
| 🛸 **Boss Zorg** | Purple alien executive in a sharp business suit | Chases player continuously; contact costs a life |

- **Energy / Metabolism Mechanic:** Displayed as a dynamic HUD progress bar (0–100%). It drains continuously each frame, and drains faster at higher levels.
  - At **0% Energy**, the player suffers **Burnout**: loses 1 life, and energy automatically resets to 50% with an invulnerability recovery buffer.
- **Lives:** Player starts with **3 Alien Lives** (`👽 👽 👽`). The game ends when all 3 lives are lost.
- **Level Scaling:** $\text{Level} = \lfloor\frac{\text{Score}}{\text{PointsPerLevel}}\rfloor + 1$. Higher levels compress spawn gaps and increase obstacle speed.
- **Game States:** **Start Screen**, **Active Gameplay**, **Paused**, and **Game Over** with instant replay without page reload.

---

## 🕹️ Controls

| Key / Input | Action |
|---|---|
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> | Move Alien Intern |
| **Mouse / Touch Drag** | Alien smoothly follows cursor or finger |
| <kbd>Space</kbd> or <kbd>Enter</kbd> | Start Game / Play Again |
| <kbd>T</kbd> | **Toggle Autonomous AI Autoplay Demo** |
| <kbd>P</kbd> | Pause / Resume Game |
| <kbd>M</kbd> | Mute / Unmute Audio Synthesizer |
| <kbd>C</kbd> | Open Live Customizer & Settings Drawer |

---

## 🚀 How to Run the Game

### Method 1: Direct Browser Play (Easiest)
1. Navigate to the project directory:
   ```text
   C:\Users\DELL\Downloads\game_a\
   ```
2. Double-click **`index.html`** in any web browser (Chrome, Edge, Firefox, Brave, Safari).
3. The game will run immediately with full audio and visual features offline.

### Method 2: Python / Pygame Version
If your lab evaluator requires the Python implementation:
```bash
cd C:\Users\DELL\Downloads\game_a
pip install pygame
python game_pygame.py
```

---

## 🛠️ Individual Customization (`CONFIG`)

All instructor-assigned customizations are centralized at the top of `game.js` (lines 12–60):

```javascript
const CONFIG = {
    collectible: {
        name: "Coffee Cup",
        color: "#00f0ff",        // Cyan glow
        points: 10,              // Points awarded for normal drink
        goldPoints: 50,          // Points awarded for double espresso
        refill: 25,              // Energy restored by normal drink (0-100 scale)
        goldRefill: 60           // Energy restored by double espresso
    },
    hazard: {
        name: "Urgent Email",
        color: "#ff3366",        // Urgent red glow
        lifeLoss: 1,             // Number of lives lost on collision
        scorePenalty: 5          // Score deducted when hit
    },
    guard: {
        name: "Security Drone",
        color: "#a855f7",
        lifeLoss: 1,
        scorePenalty: 10
    },
    energyDrain: 2.5,            // Metabolism drain rate per second
    powerup: "slow",             // 'slow' | 'shield' | 'double'
    difficulty: "both",          // 'speed' | 'spawn' | 'both'
    lives: 3,
    pointsPerLevel: 100,
    bossFromLevel: 2,
    bossName: "Boss Zorg"
};
```

### In-Game Demonstration Panel (Press `C`):
Press **`C`** during gameplay to open the slide-out **Game Customizer**:
- Live-switch power-ups (`Slow-Motion`, `Shield (Vaporize emails)`, or `Double Points`).
- Adjust hazard damage penalty and energy drain speed.
- Instantly spawn coffee, espresso, emails, or summon Boss Zorg on demand.

---

## 📐 Algorithm & Logic Explanation

### 1. Game Loop & Delta Time ($\Delta t$)
```javascript
loop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;
    if (this.mode === "play") this.update(dt);
    this.draw();
    requestAnimationFrame(this.loop.bind(this));
}
```
`requestAnimationFrame` synchronizes rendering with the hardware monitor refresh rate. Multiplying entity translations by $\Delta t$ decouples gameplay speed from monitor hardware.

### 2. Circle-Circle Collision Detection
All entities (player, coffee mugs, emails, guards, and the boss) are bounded by circles with center $(x, y)$ and radius $r$:
```javascript
checkCollision(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r;
}
```
$$\text{Distance} = \sqrt{(a_x - b_x)^2 + (a_y - b_y)^2} < (a_r + b_r)$$
- **Invulnerability Buffer:** On taking damage, the player gains **90 frames of invulnerability** ($\approx 1.5$ seconds) with an alternating visual transparency blink (`globalAlpha = 0.35`) to prevent rapid consecutive life loss.

### 3. Trajectory & Spawning Math
- **Spawning:** Every `spawnGap` frames, items spawn at the right boundary with weighted probabilities:
  - Coffee Cup: 40%
  - Urgent Email: 30%
  - Double Espresso: 12%
  - Security Guard: 12%
  - Day-Off Pass: 6%
- **Email Sine Flutter:**
  $$y(t) = y_{\text{base}} + \sin(t \cdot \text{frequency}) \cdot \text{amplitude}$$

### 4. Boss Pursuit AI (Normalized Vector Navigation)
Boss Zorg calculates a 2D direction vector toward the player, normalizes it to unit length, and scales it by his pursuit speed:
$$\Delta x = p_x - b_x, \quad \Delta y = p_y - b_y, \quad \text{dist} = \sqrt{\Delta x^2 + \Delta y^2}$$
$$v_x = \frac{\Delta x}{\text{dist}} \cdot \text{speed}_{\text{boss}}, \quad v_y = \frac{\Delta y}{\text{dist}} \cdot \text{speed}_{\text{boss}}$$

### 5. Autonomous AI Autoplay Steering (Demo Mode)
When activated via **`T`**, the agent navigates using potential field physics:
- **Attractive Vector:** Pulls the player toward the nearest coffee or power-up.
- **Repulsive Vector:** Repels strongly away from hazards (emails, guards, Boss Zorg) within a 130px radius with quadratic scaling:
  $$F_{\text{repel}} \propto \left(\frac{130 - \text{dist}}{130}\right)^2$$
- Pressing any human control key immediately disengages the AI agent.

---

## 🎨 Multimedia Elements

1. **Canvas 2D Procedural Sprites:**
   - **Gleep the Alien Intern:** 3 directional tracking eyes (using $\operatorname{atan2}$ pupil targeting), animated antenna with glowing tip, oscillating red tie, and jetpack exhaust particles.
   - **Coffee & Espresso:** Ceramic mugs with rising steam bezier curves and emblems.
   - **Urgent Emails:** Holographic envelopes with glowing red flaps and warning badges.
   - **Alien Structure Background:** Parallax starfield, glowing neon conduits, and structural architectural pillars.
2. **Web Audio API Synthesizer:**
   - Real-time mathematical sound synthesis using oscillators and exponential gain ramps:
     - `playDrink()`: Bubbly rising triangle-wave chirp.
     - `playBonus()`: 3-note ascending golden triad fanfare.
     - `playHit()`: Electric sawtooth static buzz.
     - `playBossAlert()`: Sweeping emergency klaxon siren.
     - `startBGM()`: Rhythmic 8-bit space office synth groove in E minor.

---

## 🎓 Viva Questions & Answers for Lab Test

1. **Where is collision detection implemented?**  
   Inside `checkCollision(a, b)` in `game.js`, which checks if `Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r`. Evaluated every frame in `update()`.
2. **How does the energy mechanic work?**  
   Energy drains continuously each frame by `energyDrain * (1 + 0.1 * (level - 1)) * dt`. Drinks replenish it (capped at 100%). Dropping to 0 triggers `hurt('burnout')`.
3. **How does difficulty scale?**  
   $\text{Level} = \lfloor\frac{\text{Score}}{100}\rfloor + 1$. Higher levels boost obstacle speed by $+15\%$ per level, compress the spawn gap down to 18 frames, and trigger Boss Zorg.
4. **Why use $\Delta t$ in the loop?**  
   $\Delta t$ decouples gameplay speed from hardware monitor refresh rates, ensuring uniform speed across 60Hz and 144Hz screens.
5. **How are multimedia elements integrated without external assets?**  
   All visual sprites are drawn procedurally via Canvas 2D paths, and all audio waveforms are synthesized dynamically via the Web Audio API.
