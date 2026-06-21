/**
 * race.js — Race logic (single-player and multiplayer)
 * State machine: STARTING → RACING → FINISHED
 */

import { Car } from './car.js';

export const RACE_STATE = {
  STARTING:  'STARTING',
  RACING:    'RACING',
  FINISHED:  'FINISHED',
};

// Countdown config
const COUNTDOWN_START = -4; // semaforo index 0 at t=-4
const SEMAFORO_HOLD   = 1;  // seconds semaforo4 is visible before transition

export class Race {
  /**
   * @param {Circuit}      circuit   — active circuit
   * @param {AssetLoader}  assets    — for car images
   * @param {AudioSystem}  audio
   * @param {boolean}      multiplayer
   * @param {Object}       inputMap  — { p1: {accel,brake,left,right,rescue}, p2: ... }
   * @param {number}       numLaps   — laps to win in multiplayer (default 5)
   */
  constructor(circuit, assets, audio, multiplayer, inputMap, numLaps = 5) {
    this.circuit     = circuit;
    this.assets      = assets;
    this.audio       = audio;
    this.multiplayer = multiplayer;
    this.inputMap    = inputMap;
    this.numLaps     = numLaps;

    this.state = RACE_STATE.STARTING;

    // Create cars
    const positions = circuit.getStartPositions();
    const numCars   = multiplayer ? 2 : 1;
    this.cars = [];
    for (let i = 0; i < numCars; i++) {
      const pos = positions[i] || positions[0];
      const img = i === 0 ? assets.images.car0 : assets.images.car1;
      const car = new Car(i, img, pos.x, pos.y);
      this.cars.push(car);
    }

    // Countdown timer: goes from COUNTDOWN_START (-4) up to 0
    this.countdownTimer = COUNTDOWN_START; // seconds (real-time)
    this._countdownAccum = 0; // accumulator in ms
    this._prevCountdownTimer = COUNTDOWN_START - 1; // sentinel to trigger first beep

    // Race timer (single-player countdown from 20s, or multiplayer unlimited)
    this.raceTimer   = multiplayer ? 0 : 20; // seconds
    this._raceAccum  = 0;

    // Track which lap a race timer bonus was last awarded to avoid double-counting
    this._lastBonusLap = [-1, -1];

    // Who finished?
    this.finishOrder = []; // car indices in finish order
    this.scores      = [0, 0]; // used by Session

    // For single-player: total laps as score
    // For multiplayer: who won this race?
    this.winner = null; // car index

    // Audio
    this.audio.startRace(numCars);

    // Track when RACING started to measure lap times
    this._racingStartTime = null;
  }

  /**
   * Main update — call every frame with delta time in seconds.
   * @param {number} dt — delta seconds
   * @param {Object} keys — { [key]: boolean } current key state
   */
  update(dt, keys) {
    switch (this.state) {
      case RACE_STATE.STARTING: this._updateStarting(dt, keys); break;
      case RACE_STATE.RACING:   this._updateRacing(dt, keys);   break;
      case RACE_STATE.FINISHED: /* wait for external advance */  break;
    }
  }

  _updateStarting(dt, keys) {
    this._countdownAccum += dt * 1000; // to ms
    if (this._countdownAccum >= 1000) {
      this._countdownAccum -= 1000;
      this.countdownTimer++;
    }

    // Beep on each new semaphore frame (frames 0–4 = lights turning on)
    if (this.countdownTimer !== this._prevCountdownTimer) {
      this._prevCountdownTimer = this.countdownTimer;
      if (this.countdownTimer <= 0) {
        this.audio.playCountdownBeep();
      }
    }

    // Drive cars (frozen) to allow rendering, but no movement
    const frozen = true;
    this._applyInput(keys, frozen);

    // Update physics (frozen — sets vel=0, no position change)
    for (const car of this.cars) {
      car.update(this.circuit.colData, frozen);
    }

    // When countdownTimer reaches 0: show semaforo4 for SEMAFORO_HOLD seconds
    if (this.countdownTimer >= 0) {
      // We let 0 show for SEMAFORO_HOLD seconds, then transition
      if (this.countdownTimer >= SEMAFORO_HOLD) {
        this._transitionToRacing();
      }
    }
  }

  _transitionToRacing() {
    this.state = RACE_STATE.RACING;
    this._racingStartTime = performance.now();

    // Set lap start times
    for (const car of this.cars) {
      car._lapStartTime = this._racingStartTime;
    }
  }

  _updateRacing(dt, keys) {
    // Race timer
    if (!this.multiplayer) {
      this._raceAccum += dt;
      this.raceTimer = Math.max(0, 20 - this._raceAccum);
    }

    this._applyInput(keys, false);

    const nowMs = performance.now();

    for (const car of this.cars) {
      car.update(this.circuit.colData, false);
      car.checkCheckpoints(this.circuit.checkpoints, nowMs);

      // Audio update
      const isTurning = car.left || car.right;
      this.audio.updateCar(car.index, car.vel, car.velocidadMax, isTurning);

      // Single-player: add 8s bonus per new lap
      if (!this.multiplayer) {
        if (car.laps > this._lastBonusLap[car.index]) {
          if (car.laps > 0) {
            // Each new lap gives +8s (accumulator offset)
            this._raceAccum -= 8;
          }
          this._lastBonusLap[car.index] = car.laps;
        }
      }
    }

    // Check end conditions
    if (this.multiplayer) {
      // Race to numLaps; ends when any car reaches numLaps+1 (i.e. completed numLaps laps)
      for (const car of this.cars) {
        if (car.laps >= this.numLaps && this.winner === null) {
          this.winner = car.index;
          this._transitionToFinished();
          return;
        }
      }
    } else {
      // Single-player: ends when timer hits 0
      if (this.raceTimer <= 0) {
        this.raceTimer = 0;
        this.winner = 0;
        this._transitionToFinished();
      }
    }
  }

  _transitionToFinished() {
    this.state = RACE_STATE.FINISHED;
    this.audio.stopRace();

    // Save best lap times to localStorage
    this._saveRecords();
  }

  _saveRecords() {
    const key = 'btr_records';
    let records;
    try {
      records = JSON.parse(localStorage.getItem(key)) || {};
    } catch (_) {
      records = {};
    }

    const circuitKey = `circuit${this.circuit.data.id}`;
    if (!records[circuitKey]) records[circuitKey] = {};

    for (const car of this.cars) {
      const carKey = `car${car.index}`;
      const existing = records[circuitKey][carKey] || Infinity;
      if (car.bestLap < existing) {
        records[circuitKey][carKey] = car.bestLap;
      }
    }

    if (!records.totalRaces) records.totalRaces = 0;
    records.totalRaces++;

    if (this.winner !== null) {
      if (!records.wins) records.wins = [0, 0];
      records.wins[this.winner] = (records.wins[this.winner] || 0) + 1;
    }

    try {
      localStorage.setItem(key, JSON.stringify(records));
    } catch (_) {}
  }

  /**
   * Apply keyboard state to car input flags.
   */
  _applyInput(keys, frozen) {
    const p1 = this.inputMap.p1;
    const car0 = this.cars[0];
    if (car0) {
      car0.accel = !frozen && keys[p1.accel];
      car0.brake = !frozen && keys[p1.brake];
      car0.left  = !frozen && keys[p1.left];
      car0.right = !frozen && keys[p1.right];
    }

    if (this.multiplayer && this.cars[1]) {
      const p2  = this.inputMap.p2;
      const car1 = this.cars[1];
      car1.accel = !frozen && keys[p2.accel];
      car1.brake = !frozen && keys[p2.brake];
      car1.left  = !frozen && keys[p2.left];
      car1.right = !frozen && keys[p2.right];
    }
  }

  /**
   * Handle rescue key for a specific player.
   */
  rescueCar(playerIndex) {
    const car = this.cars[playerIndex];
    if (car && this.state === RACE_STATE.RACING) {
      car.rescue(this.circuit.checkpoints);
    }
  }

  /**
   * Get the current semaphore frame index (0..4).
   * Returns -1 if no semaphore should be shown.
   */
  getSemaphoreFrame() {
    if (this.state !== RACE_STATE.STARTING) return -1;
    // countdownTimer goes -4 → 0
    // frame mapping: timer=-4→frame0, -3→1, -2→2, -1→3, 0→4
    const frame = this.countdownTimer - COUNTDOWN_START; // 0..4
    return Math.max(0, Math.min(4, frame));
  }

  /**
   * Draw HUD (timers, laps, labels).
   */
  drawHUD(ctx) {
    if (this.multiplayer) {
      this._drawHUDMulti(ctx);
    } else {
      this._drawHUDSingle(ctx);
    }
  }

  _drawHUDSingle(ctx) {
    const t = Math.max(0, this.raceTimer);
    const car = this.cars[0];
    const lapText = car ? `LAP ${car.laps}` : 'LAP 0';
    const timerText = t.toFixed(1) + 's';

    ctx.save();
    // Dark strip behind HUD
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, 1024, 38);

    // Timer (center)
    ctx.font = 'bold 26px Orbitron, monospace';
    ctx.fillStyle = t < 5 ? '#ff4444' : 'white';
    ctx.textAlign = 'center';
    ctx.fillText(timerText, 512, 27);

    // Lap counter (left)
    ctx.font = 'bold 22px Orbitron, monospace';
    ctx.fillStyle = '#44ff88';
    ctx.textAlign = 'left';
    ctx.fillText(lapText, 14, 27);
    ctx.restore();
  }

  _drawHUDMulti(ctx) {
    const car0 = this.cars[0];
    const car1 = this.cars[1];

    ctx.save();
    // Dark strip
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, 1024, 38);

    ctx.font = 'bold 22px Orbitron, monospace';
    if (car0) {
      ctx.fillStyle = 'limegreen';
      ctx.textAlign = 'left';
      ctx.fillText(`P1: ${car0.laps}/${this.numLaps}`, 14, 27);
    }
    if (car1) {
      ctx.fillStyle = '#ff4444';
      ctx.textAlign = 'left';
      ctx.fillText(`P2: ${car1.laps}/${this.numLaps}`, 200, 27);
    }
    ctx.restore();
  }

  /**
   * Draw countdown overlay during STARTING state.
   */
  drawCountdown(ctx) {
    if (this.state !== RACE_STATE.STARTING) return;
    const frame = this.getSemaphoreFrame();
    this.circuit.drawSemaphore(ctx, frame);

    // Big countdown number overlay (center screen, semi-transparent)
    const count = this.countdownTimer; // -4 to 0 then 1
    if (count < 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(462, 320, 100, 100);
      ctx.font = 'bold 80px Orbitron, monospace';
      ctx.fillStyle = '#ff4444';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(-count), 512, 375);
      ctx.restore();
    } else {
      // "GO!" at timer == 0 or 1
      ctx.save();
      ctx.font = 'bold 90px Orbitron, monospace';
      ctx.fillStyle = '#00ff44';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 10;
      ctx.fillText('GO!', 512, 375);
      ctx.restore();
    }
  }

  /**
   * Draw finishing overlay when FINISHED.
   * This is a thin overlay; the full intermission is handled by Session.
   */
  drawFinished(ctx) {
    if (this.state !== RACE_STATE.FINISHED) return;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(210, 190, 600, 400);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Impact, sans-serif';
    ctx.textAlign = 'center';

    if (this.multiplayer && this.winner !== null) {
      ctx.fillText(`JUGADOR ${this.winner + 1} GANA!`, 512, 320);
    } else {
      const laps = this.cars[0] ? this.cars[0].laps : 0;
      ctx.fillText(`VUELTAS: ${laps}`, 512, 320);
    }

    ctx.font = '24px "Russo One", sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Pulse ENTER para continuar', 512, 420);
    ctx.restore();
  }

  /**
   * Draw the full race frame.
   */
  draw(ctx) {
    // Track
    this.circuit.drawTrack(ctx);

    // Cars
    for (const car of this.cars) {
      car.draw(ctx);
    }

    // HUD
    this.drawHUD(ctx);

    // Semaphore during countdown
    if (this.state === RACE_STATE.STARTING) {
      this.drawCountdown(ctx);
    }

    // Finished overlay
    if (this.state === RACE_STATE.FINISHED) {
      this.drawFinished(ctx);
    }
  }
}
