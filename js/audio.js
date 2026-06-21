/**
 * audio.js — Web Audio API engine sound system
 * Synthesizes engine sounds for each car using oscillators.
 */

export class AudioSystem {
  constructor() {
    this._ctx = null;
    this._carSounds = []; // one entry per car
    this._started = false;
  }

  _getContext() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  }

  /**
   * Create engine sound chain for one car.
   * Returns an object with { osc, filter, gain, scrOsc, scrGain, scrFilter }
   * basePitch: fundamental Hz at idle
   */
  _createCarSound(basePitch) {
    const ctx = this._getContext();

    // --- Engine oscillator (sawtooth for growl) ---
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = basePitch;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 1.0;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    // --- Tire screech: high freq sine for screech effect ---
    const scrOsc = ctx.createOscillator();
    scrOsc.type = 'sine';
    scrOsc.frequency.value = 800 + basePitch * 2;

    const scrFilter = ctx.createBiquadFilter();
    scrFilter.type = 'bandpass';
    scrFilter.frequency.value = 1200;
    scrFilter.Q.value = 5;

    const scrGain = ctx.createGain();
    scrGain.gain.value = 0;

    scrOsc.connect(scrFilter);
    scrFilter.connect(scrGain);
    scrGain.connect(ctx.destination);
    scrOsc.start();

    return { osc, filter, gain, scrOsc, scrGain, scrFilter };
  }

  /**
   * Initialize sounds for N cars.
   * basePitches: array of base Hz per car (e.g. [80, 90])
   */
  startRace(numCars) {
    const ctx = this._getContext();
    // Resume if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Stop previous sounds if any
    this.stopRace();

    const pitches = [80, 90];
    for (let i = 0; i < numCars; i++) {
      this._carSounds.push(this._createCarSound(pitches[i] || 80 + i * 10));
    }
    this._started = true;
  }

  /**
   * Update engine sound each frame.
   * @param {number} carIndex
   * @param {number} speed  — current speed (signed, pixels/frame)
   * @param {number} maxSpeed — velocidadMax
   * @param {boolean} isTurning — whether car is steering at high speed
   */
  updateCar(carIndex, speed, maxSpeed, isTurning) {
    if (!this._started || !this._carSounds[carIndex]) return;
    const ctx = this._getContext();
    const sound = this._carSounds[carIndex];

    const absSpeed = Math.abs(speed);
    const t = Math.min(absSpeed / maxSpeed, 1); // 0..1

    // Frequency: 80..320 Hz based on speed ratio
    const basePitch = (carIndex === 0) ? 80 : 90;
    const targetFreq = basePitch + t * (basePitch * 3); // 80→320 or 90→360
    sound.osc.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.05);

    // Volume: 0..0.15
    const targetGain = absSpeed < 0.05 ? 0 : 0.04 + t * 0.11;
    sound.gain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.05);

    // Tire screech: active when turning at > 60% speed
    const scrGain = (isTurning && t > 0.6) ? (t - 0.6) * 0.15 : 0;
    sound.scrGain.gain.setTargetAtTime(scrGain, ctx.currentTime, 0.05);
  }

  stopRace() {
    for (const sound of this._carSounds) {
      try {
        sound.osc.stop();
        sound.scrOsc.stop();
      } catch (_) {
        // already stopped
      }
    }
    this._carSounds = [];
    this._started = false;
  }

  /**
   * Play an F1-style countdown pip (one per semaphore light).
   * Short sine-wave burst at ~1050 Hz with fast attack/release.
   */
  playCountdownBeep() {
    const ctx = this._getContext();
    if (ctx.state !== 'running') return;

    const now = ctx.currentTime;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1050, now);

    // Fast attack, short sustain, fast release — clean pip
    gain.gain.setValueAtTime(0,    now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.008);
    gain.gain.setValueAtTime(0.45, now + 0.13);
    gain.gain.linearRampToValueAtTime(0,    now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Resume AudioContext on first user interaction.
   * Call from any input handler.
   */
  resume() {
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  }
}
