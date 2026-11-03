/**
 * Alien Office Escape: Customizable 2D Arcade Game
 * Multimedia Systems Lab — Lab Test 2
 * 
 * Built with HTML5 Canvas, Vanilla CSS & Modern JavaScript.
 * 100% self-contained: No external libraries, images or audio files.
 * Procedural vector sprites & real-time Web Audio API sound synthesis.
 */

/* ==========================================================================
   1. CUSTOMIZATION CONFIGURATION BLOCK (Lab Test Assigned Customizations)
   ========================================================================== */
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
    bg: "alien_structure",      // Visual theme: "alien_structure" | "deep_space"
    accent: "#00f0ff",          // Neon accent color
    playerColor: "#39ff14"      // Neon green alien intern
};


/* ==========================================================================
   2. WEB AUDIO API SYNTHESIZER (Pure Procedural Sound Effects & BGM)
   ========================================================================== */
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.masterVolume = 0.35;
        this.bgmTimer = null;
        this.bgmStep = 0;
        this.isBgmActive = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
        return this.isMuted;
    }

    // Play synthesized tone
    tone(freq, type = 'sine', duration = 0.15, gainVal = 0.3, detune = 0) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (detune !== 0) osc.detune.setValueAtTime(detune, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // Sound: Grab Coffee (bubbly energetic gulp)
    playDrink() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.18);
        gain.gain.setValueAtTime(0.35 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Sound: Double Espresso Bonus (Golden chime)
    playBonus() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [587.33, 783.99, 1046.5].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const t = now + idx * 0.06;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.2);
        });
    }

    // Sound: Power-Up Activation (Cosmic resonance)
    playPowerup() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
        gain.gain.setValueAtTime(0.35 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.38);
    }

    // Sound: Collision / Damage (Electric static shock)
    playHit() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(170, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.22);
        gain.gain.setValueAtTime(0.4 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
    }

    // Sound: Burnout buzzer
    playBurnout() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.35);
        gain.gain.setValueAtTime(0.4 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Sound: Boss Alert Siren
    playBossAlert() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        for (let i = 0; i < 2; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            const t = now + i * 0.28;
            osc.frequency.setValueAtTime(440, t);
            osc.frequency.linearRampToValueAtTime(740, t + 0.2);
            gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.26);
        }
    }

    // Sound: Level Up Fanfare
    playLevelUp() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const t = now + idx * 0.08;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.25);
        });
    }

    // Sound: Game Over Jingle
    playGameOver() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [392, 369.99, 349.23, 293.66];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            const t = now + idx * 0.18;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.35 * this.masterVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.28);
        });
    }

    // Retro Chiptune Space Office Groove (Looping BGM)
    startBGM() {
        if (this.isBgmActive || this.isMuted) return;
        this.init();
        this.isBgmActive = true;
        const bassNotes = [164.81, 164.81, 196.00, 164.81, 220.00, 196.00, 164.81, 146.83];
        const leadNotes = [329.63, 0, 392.00, 0, 440.00, 392.00, 329.63, 293.66];
        let step = 0;

        this.bgmTimer = setInterval(() => {
            if (this.isMuted || !this.isBgmActive || !this.ctx) return;
            const now = this.ctx.currentTime;
            const bFreq = bassNotes[step % bassNotes.length];
            const lFreq = leadNotes[step % leadNotes.length];

            // Bass pulse
            if (bFreq > 0) {
                const bOsc = this.ctx.createOscillator();
                const bGain = this.ctx.createGain();
                bOsc.type = 'triangle';
                bOsc.frequency.setValueAtTime(bFreq, now);
                bGain.gain.setValueAtTime(0.12 * this.masterVolume, now);
                bGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
                bOsc.connect(bGain);
                bGain.connect(this.ctx.destination);
                bOsc.start(now);
                bOsc.stop(now + 0.15);
            }

            // Lead arpeggio
            if (lFreq > 0 && step % 2 === 0) {
                const lOsc = this.ctx.createOscillator();
                const lGain = this.ctx.createGain();
                lOsc.type = 'sine';
                lOsc.frequency.setValueAtTime(lFreq, now);
                lGain.gain.setValueAtTime(0.07 * this.masterVolume, now);
                lGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
                lOsc.connect(lGain);
                lGain.connect(this.ctx.destination);
                lOsc.start(now);
                lOsc.stop(now + 0.18);
            }
            step++;
        }, 180);
    }

    stopBGM() {
        this.isBgmActive = false;
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}

const audio = new AudioEngine();


/* ==========================================================================
   3. PROCEDURAL VECTOR SPRITE RENDERING
   ========================================================================== */

/**
 * Draws the player alien (Gleep the Alien Intern)
 * Features 3 tracking eyes, antenna with light bulb, fluttering necktie & jetpack flames!
 */
function drawPlayer(ctx, player) {
    ctx.save();
    ctx.translate(player.x, player.y);

    // Blinking effect during invulnerability frames
    if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer / 6) % 2 === 0) {
        ctx.globalAlpha = 0.35;
    }

    // Power-up Shield Aura
    if (player.hasShield) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, player.r + 14, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 240, 255, 0.22)";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.7 + Math.sin(Date.now() * 0.01) * 0.3})`;
        ctx.stroke();
        ctx.restore();
    }

    // Jetpack & Thruster Fire (drawn behind body)
    ctx.fillStyle = "#4a5568";
    ctx.fillRect(-player.r - 8, -6, 9, 14);
    ctx.fillStyle = "#718096";
    ctx.fillRect(-player.r - 10, -8, 5, 18);

    // Thruster exhaust flame
    const flameFlicker = Math.random() * 8;
    ctx.beginPath();
    ctx.moveTo(-player.r - 10, -4);
    ctx.lineTo(-player.r - 20 - flameFlicker, 1);
    ctx.lineTo(-player.r - 10, 6);
    ctx.fillStyle = Math.random() > 0.5 ? "#00f0ff" : "#ffbe0b";
    ctx.fill();

    // Alien Body (Cute rounded neon alien)
    ctx.beginPath();
    ctx.ellipse(0, 2, player.r, player.r * 0.88, 0, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.playerColor;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#1b8a0a";
    ctx.stroke();

    // Antenna & glowing bulb
    ctx.beginPath();
    ctx.moveTo(0, -player.r * 0.88);
    ctx.quadraticCurveTo(-4, -player.r - 12, 0, -player.r - 16);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#1b8a0a";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -player.r - 16, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffbe0b";
    ctx.shadowColor = "#ffbe0b";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0; // reset shadow

    // Fluttering Office Necktie! (Alien intern uniform)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-2, 6);
    ctx.lineTo(2, 6);
    const tieWobble = Math.sin(Date.now() * 0.008) * 4;
    ctx.lineTo(4 + tieWobble, 20);
    ctx.lineTo(0 + tieWobble, 24);
    ctx.lineTo(-4 + tieWobble, 20);
    ctx.closePath();
    ctx.fillStyle = "#e53e3e"; // Red corporate tie
    ctx.fill();
    ctx.strokeStyle = "#9b2c2c";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 3 Big Expressive Eyes with directional tracking pupils
    const eyeOffsets = [
        { x: -9, y: -4, r: 6 },
        { x: 0,  y: -7, r: 7.5 },
        { x: 9,  y: -4, r: 6 }
    ];

    eyeOffsets.forEach(eye => {
        // Sclera (white)
        ctx.beginPath();
        ctx.arc(eye.x, eye.y, eye.r, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "#1a202c";
        ctx.stroke();

        // Pupil tracking mouse/movement
        const dx = (player.targetX - (player.x + eye.x)) || 1;
        const dy = (player.targetY - (player.y + eye.y)) || 0;
        const angle = Math.atan2(dy, dx);
        const pupilDist = eye.r * 0.45;
        const px = eye.x + Math.cos(angle) * pupilDist;
        const py = eye.y + Math.sin(angle) * pupilDist;

        ctx.beginPath();
        ctx.arc(px, py, eye.r * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = "#0f172a";
        ctx.fill();

        // Eye glint
        ctx.beginPath();
        ctx.arc(px - 1, py - 1, eye.r * 0.16, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
    });

    ctx.restore();
}

/**
 * Draws Coffee Cup / Energy Drink
 */
function drawCoffee(ctx, item) {
    ctx.save();
    ctx.translate(item.x, item.y);

    const isGold = item.isGold;
    const primaryColor = isGold ? "#ffbe0b" : CONFIG.collectible.color;

    // Steam puffs rising
    ctx.strokeStyle = isGold ? "rgba(255, 190, 11, 0.4)" : "rgba(0, 240, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const t = Date.now() * 0.005;
    ctx.moveTo(-5, -item.r);
    ctx.quadraticCurveTo(-10 + Math.sin(t) * 3, -item.r - 8, -5, -item.r - 14);
    ctx.moveTo(4, -item.r);
    ctx.quadraticCurveTo(8 + Math.cos(t) * 3, -item.r - 8, 4, -item.r - 14);
    ctx.stroke();

    // Coffee Mug Body
    ctx.beginPath();
    ctx.arc(0, 0, item.r, 0, Math.PI * 2);
    ctx.fillStyle = primaryColor;
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // Mug handle
    ctx.beginPath();
    ctx.arc(item.r * 0.9, 0, item.r * 0.45, -Math.PI / 2, Math.PI / 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = primaryColor;
    ctx.stroke();

    // Mug coffee surface inside
    ctx.beginPath();
    ctx.ellipse(0, -item.r * 0.25, item.r * 0.65, item.r * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = isGold ? "#78350f" : "#451a03";
    ctx.fill();

    // Emblem on mug (Coffee bean or Star)
    ctx.fillStyle = "#ffffff";
    ctx.font = isGold ? "bold 13px sans-serif" : "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isGold ? "★" : "☕", 0, item.r * 0.28);

    ctx.restore();
}

/**
 * Draws Urgent Email (Red Holographic Envelope with @ symbol)
 */
function drawEmail(ctx, item) {
    ctx.save();
    ctx.translate(item.x, item.y);

    const w = item.r * 2.2;
    const h = item.r * 1.5;

    // Red warning pulse aura
    ctx.shadowColor = CONFIG.hazard.color;
    ctx.shadowBlur = 12;

    // Envelope background
    ctx.fillStyle = "#1e0b14";
    ctx.strokeStyle = CONFIG.hazard.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 4);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Envelope Flap Lines
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2);
    ctx.lineTo(0, h * 0.15);
    ctx.lineTo(w / 2, -h / 2);
    ctx.strokeStyle = CONFIG.hazard.color;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Urgent '@' or '!' badge
    ctx.fillStyle = "#ff0055";
    ctx.beginPath();
    ctx.arc(0, 0, item.r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", 0, 1);

    ctx.restore();
}

/**
 * Draws Day-Off Pass (Glowing Blue/Cyan Orb)
 */
function drawPass(ctx, item) {
    ctx.save();
    ctx.translate(item.x, item.y);

    const pulse = Math.sin(Date.now() * 0.008) * 3;

    // Orbital energy ring
    ctx.save();
    ctx.rotate(Date.now() * 0.003);
    ctx.beginPath();
    ctx.ellipse(0, 0, item.r + 6 + pulse, item.r * 0.45, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Orb body
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, item.r);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.4, "#38bdf8");
    grad.addColorStop(1, "#1d4ed8");

    ctx.beginPath();
    ctx.arc(0, 0, item.r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Star icon inside
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦", 0, 1);

    ctx.restore();
}

/**
 * Draws Security Drone / Alien Guard
 */
function drawGuard(ctx, guard) {
    ctx.save();
    ctx.translate(guard.x, guard.y);

    // Scanning searchlight beam
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-65, -35);
    ctx.lineTo(-65, 35);
    ctx.closePath();
    ctx.fillStyle = "rgba(168, 85, 247, 0.14)";
    ctx.fill();
    ctx.restore();

    // Drone chassis
    ctx.beginPath();
    ctx.arc(0, 0, guard.r, 0, Math.PI * 2);
    ctx.fillStyle = "#2d1b4e";
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "#a855f7";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Rotating stun prongs
    const spin = Date.now() * 0.006;
    for (let i = 0; i < 3; i++) {
        const ang = spin + (i * (Math.PI * 2 / 3));
        const px = Math.cos(ang) * (guard.r + 6);
        const py = Math.sin(ang) * (guard.r + 6);
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#c084fc";
        ctx.fill();
    }

    // Glowing scanner visor
    ctx.beginPath();
    ctx.ellipse(0, 0, guard.r * 0.6, guard.r * 0.28, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();

    ctx.restore();
}

/**
 * Draws Boss Zorg (Purple Executive Alien in a sharp corporate suit!)
 */
function drawBoss(ctx, boss) {
    ctx.save();
    ctx.translate(boss.x, boss.y);

    // Chasing aura
    ctx.shadowColor = "#9333ea";
    ctx.shadowBlur = 18;

    // Hover-throne / Boss Mech Base
    ctx.beginPath();
    ctx.ellipse(0, boss.r * 0.7, boss.r * 0.9, boss.r * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#3b0764";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#a855f7";
    ctx.stroke();

    // Corporate Suit (Purple / Charcoal)
    ctx.beginPath();
    ctx.moveTo(-boss.r * 0.7, boss.r * 0.7);
    ctx.lineTo(-boss.r * 0.55, -boss.r * 0.2);
    ctx.lineTo(boss.r * 0.55, -boss.r * 0.2);
    ctx.lineTo(boss.r * 0.7, boss.r * 0.7);
    ctx.closePath();
    ctx.fillStyle = "#1e1b4b"; // Dark suit
    ctx.fill();
    ctx.stroke();

    // Boss Shirt & Crimson Tie
    ctx.beginPath();
    ctx.moveTo(-6, -boss.r * 0.2);
    ctx.lineTo(6, -boss.r * 0.2);
    ctx.lineTo(0, boss.r * 0.3);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-3, -boss.r * 0.15);
    ctx.lineTo(3, -boss.r * 0.15);
    ctx.lineTo(5, boss.r * 0.4);
    ctx.lineTo(0, boss.r * 0.55);
    ctx.lineTo(-5, boss.r * 0.4);
    ctx.closePath();
    ctx.fillStyle = "#dc2626"; // Crimson boss tie
    ctx.fill();

    // Boss Purple Alien Head
    ctx.beginPath();
    ctx.arc(0, -boss.r * 0.35, boss.r * 0.58, 0, Math.PI * 2);
    ctx.fillStyle = "#7e22ce"; // Purple alien skin
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Eyebrow furrow (Angry Boss expression)
    ctx.beginPath();
    ctx.moveTo(-16, -boss.r * 0.55);
    ctx.lineTo(-3, -boss.r * 0.45);
    ctx.moveTo(3, -boss.r * 0.45);
    ctx.lineTo(16, -boss.r * 0.55);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#3b0764";
    ctx.stroke();

    // Two Menacing Red Eyes
    [-8, 8].forEach(xOff => {
        ctx.beginPath();
        ctx.ellipse(xOff, -boss.r * 0.4, 5, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#ff0055";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(xOff + (xOff < 0 ? -1 : 1), -boss.r * 0.4, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
    });

    // Mouth with sharp teeth
    ctx.beginPath();
    ctx.arc(0, -boss.r * 0.2, 10, 0.15, Math.PI - 0.15);
    ctx.strokeStyle = "#1e1b4b";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Boss Name Tag Header
    ctx.fillStyle = "#ffbe0b";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚡ " + CONFIG.bossName.toUpperCase(), 0, -boss.r - 8);

    ctx.restore();
}

/**
 * Draws Alien Structure Sci-Fi Background with Parallax Stars & Conduits
 */
function drawBackground(ctx, width, height, stars, gameTime) {
    // 1. Deep Space Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#050714");
    bgGrad.addColorStop(0.6, "#0a0f26");
    bgGrad.addColorStop(1, "#0f1738");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Parallax Stars
    stars.forEach(star => {
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha * (0.6 + Math.sin(gameTime * 3 + star.x) * 0.4);
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    ctx.globalAlpha = 1.0;

    // 3. Alien Architectural Pillars & Neon Cyber Conduits
    const conduitOffset = (gameTime * 40) % 120;

    // Top and bottom alien structural trusses
    ctx.fillStyle = "#0c1228";
    ctx.fillRect(0, 0, width, 24);
    ctx.fillRect(0, height - 24, width, 24);

    // Glowing Neon Conduits
    ctx.strokeStyle = "rgba(0, 240, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 24);
    ctx.lineTo(width, 24);
    ctx.moveTo(0, height - 24);
    ctx.lineTo(width, height - 24);
    ctx.stroke();

    // Cyber conduit nodes
    for (let x = -conduitOffset; x < width + 120; x += 120) {
        ctx.fillStyle = "rgba(0, 240, 255, 0.35)";
        ctx.fillRect(x, 18, 14, 12);
        ctx.fillRect(x, height - 30, 14, 12);

        // Vertical holographic structural beams in background
        ctx.fillStyle = "rgba(20, 30, 65, 0.25)";
        ctx.fillRect(x, 24, 6, height - 48);
    }

    // Holographic Corporate Billboard
    ctx.save();
    ctx.font = "bold 11px monospace";
    ctx.fillStyle = "rgba(0, 240, 255, 0.18)";
    ctx.fillText("SECTOR 7: ZORG CORP HQ  |  COFFEE SYNTHESIZER ONLINE  |  METABOLISM 100%", 18, height - 8);
    ctx.restore();
}


/* ==========================================================================
   4. CORE GAME ENGINE & STATE MACHINE
   ========================================================================== */

class GameEngine {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // UI DOM Elements
        this.hud = document.getElementById("hud");
        this.scoreDisplay = document.getElementById("scoreDisplay");
        this.levelDisplay = document.getElementById("levelDisplay");
        this.livesContainer = document.getElementById("livesContainer");
        this.energyFill = document.getElementById("energyFill");
        this.energyText = document.getElementById("energyText");
        this.powerupBanner = document.getElementById("powerupBanner");
        this.powerupName = document.getElementById("powerupName");
        this.powerupTimer = document.getElementById("powerupTimer");
        this.aiBanner = document.getElementById("aiBanner");

        this.startScreen = document.getElementById("startScreen");
        this.pauseScreen = document.getElementById("pauseScreen");
        this.gameOverScreen = document.getElementById("gameOverScreen");
        this.customSummary = document.getElementById("customSummary");
        this.finalScore = document.getElementById("finalScore");
        this.highScore = document.getElementById("highScore");
        this.finalLevel = document.getElementById("finalLevel");
        this.coffeeCount = document.getElementById("coffeeCount");
        this.emailsDodged = document.getElementById("emailsDodged");
        this.gameOverReason = document.getElementById("gameOverReason");
        this.configDrawer = document.getElementById("configDrawer");

        // Game States: 'start' | 'play' | 'pause' | 'over'
        this.mode = "start";
        this.isAutoPlay = false;

        // Game Stats
        this.score = 0;
        this.level = 1;
        this.lives = CONFIG.lives;
        this.energy = 100; // 0 to 100
        this.bestScore = parseInt(localStorage.getItem("alien_best_score") || "0", 10);
        this.drinksCollected = 0;
        this.emailsAvoided = 0;

        // Player Entity
        this.player = {
            x: 140,
            y: this.height / 2,
            r: 22,
            speed: 340,
            targetX: 140,
            targetY: this.height / 2,
            invulnerableTimer: 0,
            hasShield: false,
            powerupRemaining: 0
        };

        // Entities Lists
        this.items = [];      // Collectibles, emails, guard hazards
        this.particles = [];  // Visual explosion & sparkle effects
        this.boss = null;     // Boss Zorg instance

        // Spawning Controls
        this.spawnTimer = 0;
        this.spawnGap = 55;   // Base spawn interval in frames

        // Starfield Background
        this.stars = [];
        this.initStars();

        // Timing & Input
        this.lastTime = performance.now();
        this.gameTime = 0;
        this.keys = {};
        this.isMouseControl = false;

        // Setup Event Listeners & Customizer
        this.initInput();
        this.initUI();
        this.updateCustomSummary();

        // Start Game Loop
        requestAnimationFrame(this.loop.bind(this));
    }

    // Initialize 70 parallax stars
    initStars() {
        this.stars = [];
        for (let i = 0; i < 70; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * (this.height - 48) + 24,
                size: Math.random() < 0.25 ? 2.5 : 1.5,
                speed: Math.random() * 0.8 + 0.3,
                alpha: Math.random() * 0.8 + 0.2,
                color: Math.random() < 0.3 ? "#00f0ff" : Math.random() < 0.6 ? "#a855f7" : "#ffffff"
            });
        }
    }

    // Bind keyboard and pointer inputs
    initInput() {
        window.addEventListener("keydown", (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code] = true;

            // Space / Enter to Start / Restart
            if (e.code === "Space" || e.code === "Enter") {
                if (this.mode === "start") this.startPlay();
                else if (this.mode === "over") this.reset();
            }

            // P: Pause / Resume
            if (e.key.toLowerCase() === "p") {
                this.togglePause();
            }

            // M: Toggle Audio
            if (e.key.toLowerCase() === "m") {
                this.toggleAudio();
            }

            // T: Toggle AI Demo Autoplay Mode
            if (e.key.toLowerCase() === "t") {
                this.toggleAutoPlay();
            }

            // C: Toggle Customizer Drawer
            if (e.key.toLowerCase() === "c") {
                this.toggleConfigDrawer();
            }
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code] = false;
        });

        // Mouse movement (Alien follows cursor)
        this.canvas.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.width / rect.width;
            const scaleY = this.height / rect.height;
            this.player.targetX = (e.clientX - rect.left) * scaleX;
            this.player.targetY = (e.clientY - rect.top) * scaleY;
            this.isMouseControl = true;
        });

        // Touch drag support
        const handleTouch = (e) => {
            if (e.touches.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.width / rect.width;
                const scaleY = this.height / rect.height;
                this.player.targetX = (e.touches[0].clientX - rect.left) * scaleX;
                this.player.targetY = (e.touches[0].clientY - rect.top) * scaleY;
                this.isMouseControl = true;
            }
        };
        this.canvas.addEventListener("touchstart", handleTouch, { passive: true });
        this.canvas.addEventListener("touchmove", handleTouch, { passive: true });
    }

    // Bind UI buttons
    initUI() {
        document.getElementById("startBtn").onclick = () => this.startPlay();
        document.getElementById("demoBtn").onclick = () => this.toggleAutoPlay(true);
        document.getElementById("hudDemoBtn").onclick = () => this.toggleAutoPlay();
        document.getElementById("resumeBtn").onclick = () => this.togglePause();
        document.getElementById("restartFromPauseBtn").onclick = () => this.reset();
        document.getElementById("restartBtn").onclick = () => this.reset();
        document.getElementById("pauseBtn").onclick = () => this.togglePause();
        document.getElementById("muteBtn").onclick = () => this.toggleAudio();
        document.getElementById("configToggleBtn").onclick = () => this.toggleConfigDrawer();
        document.getElementById("configCloseBtn").onclick = () => this.toggleConfigDrawer();

        // 1-Click Screenshot Export for Lab Submission
        document.getElementById("screenshotBtn").onclick = () => this.captureScreenshot();

        // Lab Live Customizer Controls
        const cfgPower = document.getElementById("cfgPowerup");
        const cfgDiff = document.getElementById("cfgDifficulty");
        const cfgLoss = document.getElementById("cfgHazardLoss");
        const cfgDrain = document.getElementById("cfgDrain");

        cfgPower.value = CONFIG.powerup;
        cfgDiff.value = CONFIG.difficulty;
        cfgLoss.value = CONFIG.hazard.lifeLoss.toString();
        cfgDrain.value = CONFIG.energyDrain.toString();

        cfgPower.onchange = (e) => { CONFIG.powerup = e.target.value; this.updateCustomSummary(); };
        cfgDiff.onchange = (e) => { CONFIG.difficulty = e.target.value; this.updateCustomSummary(); };
        cfgLoss.onchange = (e) => { CONFIG.hazard.lifeLoss = parseInt(e.target.value, 10); this.updateCustomSummary(); };
        cfgDrain.onchange = (e) => { CONFIG.energyDrain = parseFloat(e.target.value); this.updateCustomSummary(); };

        // Instant Lab Viva Demonstration Buttons
        document.getElementById("btnSpawnCoffee").onclick = () => this.spawnSpecific("coffee");
        document.getElementById("btnSpawnEspresso").onclick = () => this.spawnSpecific("espresso");
        document.getElementById("btnSpawnEmail").onclick = () => this.spawnSpecific("email");
        document.getElementById("btnSpawnPass").onclick = () => this.spawnSpecific("pass");
        document.getElementById("btnTriggerBoss").onclick = () => this.summonBoss();
        document.getElementById("btnToggleGod").onclick = () => {
            this.godMode = !this.godMode;
            alert(`Lab Test God Mode: ${this.godMode ? "ENABLED (Invincible)" : "DISABLED"}`);
        };
    }

    toggleAudio() {
        const isMuted = audio.toggleMute();
        const muteBtn = document.getElementById("muteBtn");
        muteBtn.textContent = isMuted ? "🔇" : "🔊";
    }

    toggleAutoPlay(force) {
        this.isAutoPlay = (force !== undefined) ? force : !this.isAutoPlay;
        if (this.isAutoPlay) {
            if (this.mode === "start") this.startPlay();
            else if (this.mode === "over") this.reset();
            if (this.aiBanner) this.aiBanner.classList.remove("hidden");
        } else {
            if (this.aiBanner) this.aiBanner.classList.add("hidden");
        }
    }

    toggleConfigDrawer() {
        this.configDrawer.classList.toggle("closed");
    }

    updateCustomSummary() {
        this.customSummary.innerHTML = `
            <strong>Assigned Customization Active:</strong> Power-Up = <code>${CONFIG.powerup.toUpperCase()}</code> | 
            Difficulty = <code>${CONFIG.difficulty.toUpperCase()}</code> | 
            Hazard Loss = <code>${CONFIG.hazard.lifeLoss} Life</code> | 
            Energy Drain = <code>${CONFIG.energyDrain}/s</code>
        `;
    }

    startPlay() {
        audio.init();
        audio.startBGM();
        this.mode = "play";
        this.startScreen.classList.remove("active");
        this.startScreen.classList.add("hidden");
        this.hud.classList.remove("hidden");
    }

    togglePause() {
        if (this.mode === "play") {
            this.mode = "pause";
            this.pauseScreen.classList.remove("hidden");
            this.pauseScreen.classList.add("active");
        } else if (this.mode === "pause") {
            this.mode = "play";
            this.pauseScreen.classList.remove("active");
            this.pauseScreen.classList.add("hidden");
            this.lastTime = performance.now(); // prevent large dt jump
        }
    }

    reset() {
        this.mode = "play";
        this.score = 0;
        this.level = 1;
        this.lives = CONFIG.lives;
        this.energy = 100;
        this.drinksCollected = 0;
        this.emailsAvoided = 0;

        this.player.x = 140;
        this.player.y = this.height / 2;
        this.player.targetX = 140;
        this.player.targetY = this.height / 2;
        this.player.invulnerableTimer = 0;
        this.player.hasShield = false;
        this.player.powerupRemaining = 0;

        this.items = [];
        this.particles = [];
        this.boss = null;
        this.spawnTimer = 0;

        this.pauseScreen.classList.remove("active");
        this.pauseScreen.classList.add("hidden");
        this.gameOverScreen.classList.remove("active");
        this.gameOverScreen.classList.add("hidden");
        this.hud.classList.remove("hidden");

        this.updateHUD();
        audio.startBGM();
        this.lastTime = performance.now();
    }

    triggerGameOver(reason) {
        this.mode = "over";
        audio.stopBGM();
        audio.playGameOver();

        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem("alien_best_score", this.bestScore.toString());
        }

        this.gameOverReason.textContent = reason === "burnout" ? "BURNOUT: METABOLISM DEPLETED" : "LIVES DEPLETED: CAUGHT BY OFFICE OVERLORDS";
        this.finalScore.textContent = this.score;
        this.highScore.textContent = this.bestScore;
        this.finalLevel.textContent = this.level;
        this.coffeeCount.textContent = this.drinksCollected;
        this.emailsDodged.textContent = this.emailsAvoided;

        this.hud.classList.add("hidden");
        this.gameOverScreen.classList.remove("hidden");
        this.gameOverScreen.classList.add("active");
    }

    // Capture Canvas Screenshot as High-Def PNG download
    captureScreenshot() {
        const link = document.createElement("a");
        link.download = `Alien_Office_Escape_LabTest_${Date.now()}.png`;
        link.href = this.canvas.toDataURL("image/png");
        link.click();
    }


    /* ======================================================================
       5. SPAWNING & DIFFICULTY PROGRESSION ALGORITHM
       ====================================================================== */

    /**
     * Spawns items at the right screen edge
     * Distribution:
     * - Energy Drink / Coffee: ~40%
     * - Urgent Email: ~30%
     * - Double Espresso: ~12%
     * - Alien Guard Hazard: ~12%
     * - Day-Off Pass: ~6%
     */
    spawn() {
        const y = Math.random() * (this.height - 120) + 60;
        const roll = Math.random();

        if (roll < 0.40) {
            // Normal Coffee Cup
            this.items.push({
                type: "coffee",
                isGold: false,
                x: this.width + 30,
                y: y,
                r: 16,
                vx: -180,
                vy: 0
            });
        } else if (roll < 0.70) {
            // Urgent Email (Hazard) with sine-wave trajectory
            this.items.push({
                type: "email",
                x: this.width + 30,
                y: y,
                r: 15,
                baseY: y,
                vx: -220,
                sineFreq: 3.5 + Math.random() * 2,
                sineAmp: 30 + Math.random() * 25
            });
        } else if (roll < 0.82) {
            // Double Espresso (High reward)
            this.items.push({
                type: "coffee",
                isGold: true,
                x: this.width + 30,
                y: y,
                r: 20,
                vx: -210,
                vy: 0
            });
        } else if (roll < 0.94) {
            // Security Drone / Guard Hazard
            this.items.push({
                type: "guard",
                x: this.width + 35,
                y: y,
                r: 18,
                vx: -160,
                vy: (Math.random() - 0.5) * 80
            });
        } else {
            // Day-Off Pass (Special power-up)
            this.items.push({
                type: "pass",
                x: this.width + 30,
                y: y,
                r: 16,
                vx: -190,
                vy: 0
            });
        }
    }

    // Instant Spawner for Lab Examination Demo
    spawnSpecific(type) {
        const y = Math.random() * (this.height - 120) + 60;
        if (type === "coffee") {
            this.items.push({ type: "coffee", isGold: false, x: this.width - 40, y: y, r: 16, vx: -180, vy: 0 });
        } else if (type === "espresso") {
            this.items.push({ type: "coffee", isGold: true, x: this.width - 40, y: y, r: 20, vx: -200, vy: 0 });
        } else if (type === "email") {
            this.items.push({ type: "email", x: this.width - 40, y: y, r: 15, baseY: y, vx: -210, sineFreq: 4, sineAmp: 30 });
        } else if (type === "pass") {
            this.items.push({ type: "pass", x: this.width - 40, y: y, r: 16, vx: -180, vy: 0 });
        }
    }

    // Summon Boss Zorg event
    summonBoss() {
        if (this.boss) return;
        audio.playBossAlert();
        this.boss = {
            x: this.width + 70,
            y: this.height / 2,
            r: 38,
            speed: 120 + (this.level * 15),
            life: 30 // seconds or health
        };
    }


    /* ======================================================================
       6. COLLISION DETECTION & HIT LOGIC
       ====================================================================== */

    /**
     * Circle-Circle Collision Detection Formula:
     * Distance between centers = Math.hypot(a.x - b.x, a.y - b.y)
     * Collision occurs when distance < (a.r + b.r)
     */
    checkCollision(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r;
    }

    /**
     * Handles player damage / hazard collision
     */
    hurt(source) {
        if (this.godMode) return;
        if (this.player.invulnerableTimer > 0) return;

        if (source === "burnout") {
            // Energy reached 0: Burnout penalty
            this.lives -= 1;
            this.energy = 50; // Resets energy to 50
            this.player.invulnerableTimer = 90; // 90 frames invulnerability
            audio.playBurnout();
            this.createBurst(this.player.x, this.player.y, "#ff3366", 20);

            if (this.lives <= 0) {
                this.triggerGameOver("burnout");
            }
        } else {
            // Hazard collision (Urgent Email, Guard, or Boss)
            const lifePenalty = source === "email" ? CONFIG.hazard.lifeLoss : 1;
            const scorePenalty = source === "email" ? CONFIG.hazard.scorePenalty : 10;

            this.lives -= lifePenalty;
            this.score = Math.max(0, this.score - scorePenalty);
            this.player.invulnerableTimer = 90; // 90 frames blinking invulnerability
            audio.playHit();
            this.createBurst(this.player.x, this.player.y, "#ff0055", 25);

            if (this.lives <= 0) {
                this.triggerGameOver("lives");
            }
        }
        this.updateHUD();
    }

    /**
     * Handles collectible item pickup
     */
    collectItem(item) {
        let pts = 0;
        const multiplier = (this.player.powerupRemaining > 0 && CONFIG.powerup === "double") ? 2 : 1;

        if (item.type === "coffee") {
            if (item.isGold) {
                pts = CONFIG.collectible.goldPoints * multiplier;
                this.energy = Math.min(100, this.energy + CONFIG.collectible.goldRefill);
                audio.playBonus();
                this.createBurst(item.x, item.y, "#ffbe0b", 16);
            } else {
                pts = CONFIG.collectible.points * multiplier;
                this.energy = Math.min(100, this.energy + CONFIG.collectible.refill);
                audio.playDrink();
                this.createBurst(item.x, item.y, CONFIG.collectible.color, 12);
            }
            this.drinksCollected++;
        } else if (item.type === "pass") {
            // Activate Assigned Day-Off Power-up for 7 seconds
            this.player.powerupRemaining = 7.0;
            audio.playPowerup();
            this.createBurst(item.x, item.y, "#38bdf8", 22);

            if (CONFIG.powerup === "shield") {
                this.player.hasShield = true;
            }
        }

        this.score += pts;
        this.checkLevelProgression();
        this.updateHUD();
    }

    // Check level up milestone
    checkLevelProgression() {
        const newLevel = Math.floor(this.score / CONFIG.pointsPerLevel) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            audio.playLevelUp();
            this.createBurst(this.player.x, this.player.y, "#39ff14", 30);

            // Boss Zorg appears when reaching bossFromLevel milestone
            if (this.level >= CONFIG.bossFromLevel && !this.boss) {
                this.summonBoss();
            }
        }
    }

    // Particle Burst Generator
    createBurst(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 140 + 40;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                alpha: 1.0,
                radius: Math.random() * 3.5 + 1.5,
                decay: Math.random() * 1.5 + 1.2
            });
        }
    }


    /* ======================================================================
       7. UPDATE LOGIC (60 FPS Delta-Time Loop)
       ====================================================================== */

    update(dt) {
        this.gameTime += dt;

        // 1. Difficulty Multipliers
        const speedMultiplier = (CONFIG.difficulty === "speed" || CONFIG.difficulty === "both")
            ? 1 + 0.15 * (this.level - 1)
            : 1.0;

        // Power-Up 'slow' cuts obstacle speed in half
        const globalSpeed = (this.player.powerupRemaining > 0 && CONFIG.powerup === "slow")
            ? 0.5 * speedMultiplier
            : speedMultiplier;

        // 2. Power-Up Timer
        if (this.player.powerupRemaining > 0) {
            this.player.powerupRemaining -= dt;
            if (this.player.powerupRemaining <= 0) {
                this.player.powerupRemaining = 0;
                this.player.hasShield = false;
            }
        }

        // 3. Player Movement: AI Autoplay Steering vs Human Controls
        let moveX = 0;
        let moveY = 0;
        if (this.keys["arrowup"] || this.keys["w"] || this.keys["KeyW"]) moveY -= 1;
        if (this.keys["arrowdown"] || this.keys["s"] || this.keys["KeyS"]) moveY += 1;
        if (this.keys["arrowleft"] || this.keys["a"] || this.keys["KeyA"]) moveX -= 1;
        if (this.keys["arrowright"] || this.keys["d"] || this.keys["KeyD"]) moveX += 1;

        if (moveX !== 0 || moveY !== 0) {
            // Human player took control: disengage AI autoplay
            if (this.isAutoPlay) this.toggleAutoPlay(false);
            this.isMouseControl = false;
            const len = Math.hypot(moveX, moveY);
            this.player.x += (moveX / len) * this.player.speed * dt;
            this.player.y += (moveY / len) * this.player.speed * dt;
        } else if (this.isAutoPlay) {
            // AI Autoplay Mode: Target coffee while dodging emails, guards, and Boss
            let steerX = 0;
            let steerY = 0;

            // Find closest coffee or power-up pass
            let targetItem = null;
            let minDist = 9999;
            for (const it of this.items) {
                if (it.type === "coffee" || it.type === "pass") {
                    const d = Math.hypot(it.x - this.player.x, it.y - this.player.y);
                    if (d < minDist) {
                        minDist = d;
                        targetItem = it;
                    }
                }
            }

            if (targetItem) {
                const dx = targetItem.x - this.player.x;
                const dy = targetItem.y - this.player.y;
                const dLen = Math.hypot(dx, dy) || 1;
                steerX += (dx / dLen) * 1.2;
                steerY += (dy / dLen) * 1.2;
            } else {
                // Default patrol hover point around left-center
                steerX += (170 - this.player.x) * 0.006;
                steerY += (this.height / 2 - this.player.y) * 0.006;
            }

            // Strong repulsive force away from hazards (emails, guards)
            for (const it of this.items) {
                if (it.type === "email" || it.type === "guard") {
                    const hdx = this.player.x - it.x;
                    const hdy = this.player.y - it.y;
                    const hdist = Math.hypot(hdx, hdy);
                    if (hdist < 130 && hdist > 1) {
                        const push = Math.pow((130 - hdist) / 130, 2) * 2.8;
                        steerX += (hdx / hdist) * push;
                        steerY += (hdy / hdist) * push;
                    }
                }
            }

            // Repel away from Boss Zorg
            if (this.boss) {
                const bdx = this.player.x - this.boss.x;
                const bdy = this.player.y - this.boss.y;
                const bdist = Math.hypot(bdx, bdy);
                if (bdist < 180 && bdist > 1) {
                    const bpush = Math.pow((180 - bdist) / 180, 2) * 3.4;
                    steerX += (bdx / bdist) * bpush;
                    steerY += (bdy / bdist) * bpush;
                }
            }

            // Keep within comfortable screen margin
            if (this.player.y < 80) steerY += 1.4;
            if (this.player.y > this.height - 80) steerY -= 1.4;
            if (this.player.x < 70) steerX += 1.0;
            if (this.player.x > this.width - 150) steerX -= 1.4;

            const sLen = Math.hypot(steerX, steerY);
            if (sLen > 0.05) {
                this.player.x += (steerX / sLen) * this.player.speed * dt;
                this.player.y += (steerY / sLen) * this.player.speed * dt;
            }

            this.player.targetX = this.player.x + steerX * 30;
            this.player.targetY = this.player.y + steerY * 30;
        } else if (this.isMouseControl) {
            // Smooth lerp follow cursor
            const dx = this.player.targetX - this.player.x;
            const dy = this.player.targetY - this.player.y;
            this.player.x += dx * 7 * dt;
            this.player.y += dy * 7 * dt;
        }

        // Screen Boundaries Clamp
        this.player.x = Math.max(this.player.r + 10, Math.min(this.width - this.player.r - 10, this.player.x));
        this.player.y = Math.max(this.player.r + 28, Math.min(this.height - this.player.r - 28, this.player.y));

        // Player invulnerability frame countdown
        if (this.player.invulnerableTimer > 0) {
            this.player.invulnerableTimer--;
        }

        // 4. Energy Drain Mechanic
        // Energy -= energyDrain * (1 + 0.1 * (level - 1)) * dt
        const drainRate = CONFIG.energyDrain * (1 + 0.1 * (this.level - 1));
        this.energy -= drainRate * dt;

        if (this.energy <= 0) {
            this.energy = 0;
            this.hurt("burnout");
        }

        // 5. Spawning Routine
        const baseGap = (CONFIG.difficulty === "spawn" || CONFIG.difficulty === "both")
            ? Math.max(18, 55 - 6 * (this.level - 1))
            : 55;

        this.spawnTimer++;
        if (this.spawnTimer >= baseGap) {
            this.spawnTimer = 0;
            this.spawn();
        }

        // 6. Update Entities & Check Collisions
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];

            // Movement
            item.x += item.vx * globalSpeed * dt;
            if (item.type === "email") {
                // Sine wave fluttering wobble
                item.y = item.baseY + Math.sin(this.gameTime * item.sineFreq) * item.sineAmp;
            } else if (item.type === "guard") {
                item.y += item.vy * dt;
                // Bounce guards off walls
                if (item.y < 40 || item.y > this.height - 40) item.vy *= -1;
            }

            // Remove items that scrolled off screen
            if (item.x < -40) {
                if (item.type === "email") this.emailsAvoided++;
                this.items.splice(i, 1);
                continue;
            }

            // Test collision with player
            if (this.checkCollision(this.player, item)) {
                if (item.type === "coffee" || item.type === "pass") {
                    this.collectItem(item);
                    this.items.splice(i, 1);
                } else if (item.type === "email" || item.type === "guard") {
                    if (this.player.hasShield) {
                        // Shield vaporizes hazardous email / guard!
                        audio.playHit();
                        this.createBurst(item.x, item.y, "#00f0ff", 14);
                        this.items.splice(i, 1);
                    } else {
                        this.hurt(item.type);
                        this.items.splice(i, 1);
                    }
                }
            }
        }

        // 7. Update Boss Zorg AI (Vector chasing logic)
        if (this.boss) {
            const bdx = this.player.x - this.boss.x;
            const bdy = this.player.y - this.boss.y;
            const dist = Math.hypot(bdx, bdy);

            if (dist > 1) {
                const bSpeed = this.boss.speed * globalSpeed;
                this.boss.x += (bdx / dist) * bSpeed * dt;
                this.boss.y += (bdy / dist) * bSpeed * dt;
            }

            // Boss collision with player
            if (this.checkCollision(this.player, this.boss)) {
                if (!this.player.hasShield) {
                    this.hurt("boss");
                }
            }
        }

        // 8. Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.alpha -= p.decay * dt;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // 9. Update Parallax Starfield
        this.stars.forEach(star => {
            star.x -= star.speed * globalSpeed * 60 * dt;
            if (star.x < 0) {
                star.x = this.width;
                star.y = Math.random() * (this.height - 48) + 24;
            }
        });

        this.updateHUD();
    }


    /* ======================================================================
       8. DRAW / RENDER LOOP
       ====================================================================== */

    draw() {
        // Draw Sci-Fi Background
        drawBackground(this.ctx, this.width, this.height, this.stars, this.gameTime);

        // Draw Items (Drinks, Emails, Guards, Passes)
        this.items.forEach(item => {
            if (item.type === "coffee") drawCoffee(this.ctx, item);
            else if (item.type === "email") drawEmail(this.ctx, item);
            else if (item.type === "pass") drawPass(this.ctx, item);
            else if (item.type === "guard") drawGuard(this.ctx, item);
        });

        // Draw Boss Zorg
        if (this.boss) {
            drawBoss(this.ctx, this.boss);
        }

        // Draw Player Alien
        drawPlayer(this.ctx, this.player);

        // Draw Particles
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    // Refresh HUD displays
    updateHUD() {
        this.scoreDisplay.textContent = this.score;
        this.levelDisplay.textContent = this.level;

        // Render Lives as Alien Icons
        let livesHTML = "";
        for (let i = 0; i < CONFIG.lives; i++) {
            if (i < this.lives) {
                livesHTML += `<span class="alien-life-icon">👽</span>`;
            } else {
                livesHTML += `<span class="alien-life-icon lost">👽</span>`;
            }
        }
        this.livesContainer.innerHTML = livesHTML;

        // Energy Bar styling
        const clampedEnergy = Math.max(0, Math.min(100, this.energy));
        this.energyFill.style.width = `${clampedEnergy}%`;
        this.energyText.textContent = `${Math.round(clampedEnergy)}%`;

        if (clampedEnergy < 20) {
            this.energyFill.className = "energy-bar-fill danger";
        } else if (clampedEnergy < 45) {
            this.energyFill.className = "energy-bar-fill warning";
        } else {
            this.energyFill.className = "energy-bar-fill";
        }

        // Power-Up Banner
        if (this.player.powerupRemaining > 0) {
            this.powerupBanner.classList.remove("hidden");
            this.powerupName.textContent = CONFIG.powerup === "slow" ? "DAY-OFF (SLOW-MO)" :
                                           CONFIG.powerup === "shield" ? "DAY-OFF (SHIELD)" : "DAY-OFF (2X POINTS)";
            this.powerupTimer.textContent = `${this.player.powerupRemaining.toFixed(1)}s`;
        } else {
            this.powerupBanner.classList.add("hidden");
        }
    }

    // Main 60 FPS RequestAnimationFrame Loop
    loop(currentTime) {
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Clamp to prevent spiral
        this.lastTime = currentTime;

        if (this.mode === "play") {
            this.update(dt);
        }

        this.draw();
        requestAnimationFrame(this.loop.bind(this));
    }
}

// Instantiate game engine on window load
window.addEventListener("DOMContentLoaded", () => {
    window.gameInstance = new GameEngine();
});
