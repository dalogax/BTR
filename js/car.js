/**
 * car.js — Car entity with full XNA-ported physics
 */

import { computeSurfaceFactor } from './physics.js';

// Direction constants matching the rescue directions in circuit JSON
export const DIRS = {
  izq:   Math.PI,
  abaj:  Math.PI / 2,
  arrib: -Math.PI / 2,
  der:   0,
};

export class Car {
  /**
   * @param {number} index         — 0 or 1
   * @param {HTMLImageElement} img — car sprite
   * @param {number} startX
   * @param {number} startY
   */
  constructor(index, img, startX, startY) {
    this.index   = index;
    this.img     = img;

    // Physics defaults (from XNA source)
    this.velocidadMax  = 6;
    this.aceleracion   = 2;
    this.frenado       = 1;
    this.giro          = 1;

    // State
    this.x    = startX;
    this.y    = startY;
    this.dir  = Math.PI; // initial: pointing left
    this.vel  = 0;

    // Lap / checkpoint tracking
    this.laps           = 0;
    this.nextCheckpoint = 0;
    this.lastCheckpointIndex = -1; // index of last passed checkpoint (for rescue)
    this.bestLap        = Infinity;
    this._lapStartTime  = null; // timestamp when current lap started (ms)

    // Input state (set externally)
    this.accel  = false;
    this.brake  = false;
    this.left   = false;
    this.right  = false;
  }

  reset(startX, startY, dir) {
    this.x    = startX;
    this.y    = startY;
    this.dir  = dir !== undefined ? dir : Math.PI;
    this.vel  = 0;
    this.laps = 0;
    this.nextCheckpoint     = 0;
    this.lastCheckpointIndex = -1;
    this.bestLap = Infinity;
    this._lapStartTime = null;
    this.accel = this.brake = this.left = this.right = false;
  }

  /**
   * Rescue car to the last-passed checkpoint.
   * @param {Array} checkpoints — array of checkpoint objects from circuit data
   */
  rescue(checkpoints) {
    if (checkpoints.length === 0) return;
    let idx = this.lastCheckpointIndex;
    if (idx < 0) idx = 0;
    const cp = checkpoints[idx];
    this.x   = cp.rescue.x;
    this.y   = cp.rescue.y;
    this.dir = DIRS[cp.rescue.dir] ?? Math.PI;
    this.vel = 0;
  }

  /**
   * Apply acceleration physics (acelerar).
   */
  _acelerar() {
    const vMax = this.velocidadMax;
    const a    = this.aceleracion;
    const pct  = this.vel / vMax; // percentage of max

    if (pct < 0.10)       this.vel += a * 0.050;
    else if (pct < 0.20)  this.vel += a * 0.025;
    else if (pct < 0.40)  this.vel += a * 0.015;
    else if (pct < 0.60)  this.vel += a * 0.010;
    else if (pct < 0.80)  this.vel += a * 0.005;
    else if (pct < 1.00)  this.vel += a * 0.0025;

    if (this.vel > vMax) this.vel = vMax;
  }

  /**
   * Apply braking / reverse physics (frenar).
   */
  _frenar() {
    const vMax = this.velocidadMax;
    const f    = this.frenado;
    const pct  = this.vel / vMax;

    if (this.vel > 0) {
      // Forward braking
      if (pct >= 0.80)       this.vel -= f * 0.20;
      else if (pct >= 0.60)  this.vel -= f * 0.15;
      else if (pct >= 0.40)  this.vel -= f * 0.10;
      else if (pct >= 0.20)  this.vel -= f * 0.05;
      else if (pct >= 0.10)  this.vel -= f * 0.025;
      else if (pct >= 0.05)  this.vel -= f * 0.020;
      else {
        // Below 5% → stop then reverse
        this.vel = 0;
      }
    } else {
      // Reverse acceleration
      const negPct = -this.vel / vMax; // positive value representing reverse magnitude
      if (negPct < 0.04)       this.vel -= f * 0.020;
      else if (negPct < 0.08)  this.vel -= f * 0.025;
      else if (negPct < 0.16)  this.vel -= f * 0.030;
      else {
        // Clamp to max reverse speed
        const maxRev = -(0.16 * vMax);
        if (this.vel < maxRev) this.vel = maxRev;
      }
    }
  }

  /**
   * Coasting deceleration (aminorar) — applied when no key pressed.
   */
  _aminorar() {
    const vMax = this.velocidadMax;
    const pct  = this.vel / vMax;
    const absPct = Math.abs(pct);

    if (this.vel > 0) {
      if (pct >= 0.80)       this.vel -= 0.15;
      else if (pct >= 0.60)  this.vel -= 0.10;
      else if (pct >= 0.40)  this.vel -= 0.05;
      else if (pct >= 0.20)  this.vel -= 0.02;
      else if (pct >= 0.10)  this.vel -= 0.01;
      else if (pct >= 0.04)  this.vel -= 0.005;
      else this.vel = 0;
    } else if (this.vel < 0) {
      // Reverse coasting — bring back toward zero
      if (absPct >= 0.10)       this.vel += 0.10;
      else if (absPct >= 0.04)  this.vel += 0.02;
      else this.vel = 0;
    }
    // Already zero → nothing
  }

  /**
   * Compute turn amount (radians) and apply turn speed penalty.
   * @param {number} sign — +1 for right, -1 for left
   */
  _girar(sign) {
    const vMax = this.velocidadMax;
    const g    = this.giro;
    const pct  = this.vel / vMax;

    let turnAmount = 0;
    let speedPenalty = 0;

    if (this.vel >= 0) {
      // Forward steering
      if (pct < 0.03)       turnAmount = g * 0.01;
      else if (pct < 0.07)  turnAmount = g * 0.02;
      else if (pct < 0.10)  turnAmount = g * 0.03;
      else if (pct < 0.20)  turnAmount = g * 0.04;
      else if (pct < 0.40)  turnAmount = g * 0.035;
      else if (pct < 0.60)  turnAmount = g * 0.03;
      else if (pct < 0.80)  turnAmount = g * 0.025;
      else                  turnAmount = g * 0.02;

      // Turn speed penalty
      if (pct >= 0.10 && pct < 0.20)       speedPenalty = 0.002;
      else if (pct >= 0.20 && pct < 0.40)  speedPenalty = 0.004;
      else if (pct >= 0.40 && pct < 0.60)  speedPenalty = 0.006;
      else if (pct >= 0.60 && pct < 0.80)  speedPenalty = 0.008;
      else if (pct >= 0.80)                speedPenalty = 0.010;

    } else {
      // Reverse steering (inverted direction)
      const negPct = -pct; // positive
      sign = -sign;
      if (negPct < 0.04)       turnAmount = g * 0.02;
      else if (negPct < 0.08)  turnAmount = g * 0.03;
      else if (negPct < 0.12)  turnAmount = g * 0.04;
      else                     turnAmount = g * 0.05;
    }

    this.dir  += sign * turnAmount;
    this.vel  -= speedPenalty;
    if (this.vel < 0 && speedPenalty > 0) this.vel = Math.max(this.vel, 0);
  }

  /**
   * Main physics update — call once per frame.
   * @param {ImageData} collisionData — pre-sampled collision image
   * @param {boolean}   frozen        — true during countdown (no input)
   */
  update(collisionData, frozen) {
    const prevX = this.x;
    const prevY = this.y;

    if (!frozen) {
      // Apply acceleration / braking / coasting
      if (this.accel && !this.brake) {
        this._acelerar();
      } else if (this.brake) {
        this._frenar();
      } else {
        this._aminorar();
      }

      // Steering
      const isTurning = this.left || this.right;
      if (this.left)  this._girar(-1);
      if (this.right) this._girar(+1);

      this._isTurning = isTurning;
    } else {
      // Frozen during countdown
      this.vel = 0;
      this._isTurning = false;
    }

    // Surface friction — caps velocity and applies drag so the car genuinely slows down
    const surfaceFactor = computeSurfaceFactor(collisionData, this.x, this.y, this.dir);
    if (surfaceFactor < 1.0) {
      const capVel = this.velocidadMax * surfaceFactor;
      if (Math.abs(this.vel) > capVel) {
        // Pull velocity toward the surface cap (smooth, ~8 frames to reach cap)
        this.vel += (capVel - this.vel) * 0.12;
      }
    }

    // Update position
    this.x += Math.cos(this.dir) * this.vel;
    this.y += Math.sin(this.dir) * this.vel;

    // Boundary check: if outside [10..1015]×[10..760], revert
    if (this.x < 10 || this.x > 1015 || this.y < 10 || this.y > 760) {
      this.x   = prevX;
      this.y   = prevY;
      this.vel = 0;
    }
  }

  /**
   * Check if this car passes a checkpoint.
   * @param {Array} checkpoints — circuit checkpoints array
   * @param {number} nowMs      — current timestamp for lap timing
   */
  checkCheckpoints(checkpoints, nowMs) {
    if (checkpoints.length === 0) return;

    const cp = checkpoints[this.nextCheckpoint];
    const [x1, y1, x2, y2] = cp.bounds;

    // Use axis-aligned bounding box intersection (car is 28×15, half = 14×7)
    // This gives a ~28px effective window for 1px-wide checkpoints
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    const carMinX = this.x - 14;
    const carMaxX = this.x + 14;
    const carMinY = this.y - 7;
    const carMaxY = this.y + 7;

    if (carMaxX >= minX && carMinX <= maxX && carMaxY >= minY && carMinY <= maxY) {
      this.lastCheckpointIndex = this.nextCheckpoint;
      this.nextCheckpoint++;

      if (this.nextCheckpoint >= checkpoints.length) {
        // Completed a lap
        this.nextCheckpoint = 0;
        this.laps++;

        // Lap timing
        if (this._lapStartTime !== null) {
          const lapTime = (nowMs - this._lapStartTime) / 1000;
          if (lapTime < this.bestLap) this.bestLap = lapTime;
        }
        this._lapStartTime = nowMs;
      }
    }
  }

  /**
   * Draw the car sprite onto the canvas, rotated around its center.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const w = 28;
    const h = 15;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.dir);
    ctx.drawImage(this.img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
}
