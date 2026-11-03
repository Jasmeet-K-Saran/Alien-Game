/**
 * Cosmic Caffeine: Alien Office Rush
 * Audio Synthesis Engine using HTML5 Web Audio API
 * 100% self-contained: No external audio files or dependencies needed.
 * Perfect for offline grading and lab demonstrations.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.masterVolume = 0.4;
        this.bgmTimer = null;
        this.bgmStep = 0;
        this.isBgmPlaying = false;
    }

    // Initialize Web Audio Context upon first user interaction (browser requirement)
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Toggle sound mute state
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted && this.isBgmPlaying) {
            this.stopBGM();
        } else if (!this.isMuted && !this.isBgmPlaying) {
            this.startBGM();
        }
        return this.isMuted;
    }

    // Generic sound tone generator
    playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.3, detune = 0) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (detune !== 0) {
            osc.detune.setValueAtTime(detune, this.ctx.currentTime);
        }

        gain.gain.setValueAtTime(gainVal * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // 1. Collect Coffee Sound (Warm bubbly gulp & energy chirp)
    playCoffeeSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.18);

        gain.gain.setValueAtTime(0.35 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);

        // Bubble pop overtone
        setTimeout(() => {
            if (!this.isMuted && this.ctx) {
                const now2 = this.ctx.currentTime;
                const osc2 = this.ctx.createOscillator();
                const gain2 = this.ctx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(880, now2);
                osc2.frequency.exponentialRampToValueAtTime(1100, now2 + 0.1);
                gain2.gain.setValueAtTime(0.25 * this.masterVolume, now2);
                gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.12);
                osc2.connect(gain2);
                gain2.connect(this.ctx.destination);
                osc2.start(now2);
                osc2.stop(now2 + 0.12);
            }
        }, 80);
    }

    // 2. Collect Email Sound (Futuristic dual-chime notification)
    playEmailSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [587.33, 880].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);

            gain.gain.setValueAtTime(0.28 * this.masterVolume, now + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.16);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.16);
        });
    }

    // 3. Hazard / Guard Collision (Electric zap / stun buzz)
    playHazardSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(70, now + 0.25);

        gain.gain.setValueAtTime(0.4 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    // 4. Coffee Toss / Attack Sound (Whoosh & launch)
    playTossSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);

        gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
    }

    // 5. Boss Alert Siren (Urgent warning klaxon)
    playBossAlertSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        for (let i = 0; i < 2; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            const startTime = now + i * 0.35;
            osc.frequency.setValueAtTime(450, startTime);
            osc.frequency.linearRampToValueAtTime(750, startTime + 0.2);

            gain.gain.setValueAtTime(0.3 * this.masterVolume, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        }
    }

    // 6. Boss Laser / Memo Projectile Blast
    playBossShootSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.18);

        gain.gain.setValueAtTime(0.25 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
    }

    // 7. Boss Hit / Stunned by Coffee
    playBossHitSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);

        gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    // 8. Boss Defeated / Pacified Fanfare
    playBossDefeatSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [440, 554.37, 659.25, 880];
        const now = this.ctx.currentTime;
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const t = now + i * 0.12;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.35 * this.masterVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.35);
        });
    }

    // 9. Caffeine Overdrive / Power-Up Chime
    playPowerupSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [300, 450, 600, 900, 1200];
        const now = this.ctx.currentTime;
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const t = now + idx * 0.05;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.28 * this.masterVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.15);
        });
    }

    // 10. Game Over Melancholy Jingle
    playGameOverSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [440, 415.3, 392, 349.23, 261.63];
        const now = this.ctx.currentTime;
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            const t = now + idx * 0.18;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.3);
        });
    }

    // 11. Retro Space-Office Chiptune Background Loop
    startBGM() {
        if (this.isBgmPlaying || this.isMuted) return;
        this.init();
        this.isBgmPlaying = true;

        // Catchy 16-step bassline & melody pattern (E minor sci-fi groove)
        const bassNotes = [164.81, 164.81, 196.00, 164.81, 220.00, 196.00, 164.81, 146.83];
        const leadNotes = [329.63, 0, 392.00, 0, 440.00, 392.00, 329.63, 293.66];
        
        let step = 0;
        this.bgmTimer = setInterval(() => {
            if (this.isMuted || !this.isBgmPlaying || !this.ctx) return;

            const now = this.ctx.currentTime;
            const bFreq = bassNotes[step % bassNotes.length];
            const lFreq = leadNotes[step % leadNotes.length];

            // Bass synth
            if (bFreq > 0) {
                const bOsc = this.ctx.createOscillator();
                const bGain = this.ctx.createGain();
                bOsc.type = 'triangle';
                bOsc.frequency.setValueAtTime(bFreq, now);
                bGain.gain.setValueAtTime(0.12 * this.masterVolume, now);
                bGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
                bOsc.connect(bGain);
                bGain.connect(this.ctx.destination);
                bOsc.start(now);
                bOsc.stop(now + 0.16);
            }

            // Lead synth
            if (lFreq > 0 && step % 2 === 0) {
                const lOsc = this.ctx.createOscillator();
                const lGain = this.ctx.createGain();
                lOsc.type = 'sine';
                lOsc.frequency.setValueAtTime(lFreq, now);
                lGain.gain.setValueAtTime(0.08 * this.masterVolume, now);
                lGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
                lOsc.connect(lGain);
                lGain.connect(this.ctx.destination);
                lOsc.start(now);
                lOsc.stop(now + 0.2);
            }

            step++;
        }, 180); // ~166 BPM 8-bit tempo
    }

    stopBGM() {
        this.isBgmPlaying = false;
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}

// Global sound engine instance
window.soundEngine = new SoundEngine();
