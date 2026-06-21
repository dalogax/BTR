/**
 * session.js — Session management
 * Partida: RACING → INTERMISSION → FINAL → back to MENU
 * 4 races per session, circuits 0-3
 */

import { Race, RACE_STATE } from './race.js';
import { Circuit } from './circuit.js';

export const SESSION_STATE = {
  RACING:        'RACING',
  INTERMISSION:  'INTERMISSION',
  FINAL:         'FINAL',
};

export class Session {
  /**
   * @param {AssetLoader}  assets
   * @param {AudioSystem}  audio
   * @param {boolean}      multiplayer
   * @param {Object}       inputMap
   */
  constructor(assets, audio, multiplayer, inputMap) {
    this.assets      = assets;
    this.audio       = audio;
    this.multiplayer = multiplayer;
    this.inputMap    = inputMap;

    this.state       = SESSION_STATE.RACING;
    this.raceIndex   = 0;        // 0..3
    this.totalScores = [0, 0];   // session scores per player
    this.currentRace = null;

    this._waitingEnter = false;  // waiting for ENTER in intermission/final

    this._startRace(0);
  }

  _buildCircuit(index) {
    const data     = this.assets.circuitData[index];
    const img      = this.assets.images[`circuit${index}`];
    const colImg   = this.assets.images[`circuitCol${index}`];
    const colData  = this.assets.collisionData[index];
    const semImages = [
      this.assets.images.semaforo0,
      this.assets.images.semaforo1,
      this.assets.images.semaforo2,
      this.assets.images.semaforo3,
      this.assets.images.semaforo4,
    ];
    return new Circuit(data, img, colImg, colData, semImages);
  }

  _startRace(index) {
    const circuit = this._buildCircuit(index);
    this.currentRace = new Race(
      circuit,
      this.assets,
      this.audio,
      this.multiplayer,
      this.inputMap,
      5 // numLaps for multiplayer
    );
    this.state = SESSION_STATE.RACING;
    this._waitingEnter = false;
    this._raceTallied = false;
  }

  /**
   * Main update — call each frame.
   * @param {number} dt    — delta seconds
   * @param {Object} keys  — key state map
   * @returns {string|null} — 'menu' if session is over
   */
  update(dt, keys) {
    switch (this.state) {
      case SESSION_STATE.RACING:
        this.currentRace.update(dt, keys);

        // Handle rescue keys (one-shot per press)
        if (keys['KeyM'] && !this._prevKeys?.['KeyM']) {
          this.currentRace.rescueCar(0);
        }
        if (this.multiplayer && keys['KeyR'] && !this._prevKeys?.['KeyR']) {
          this.currentRace.rescueCar(1);
        }

        // Detect race end — transition to INTERMISSION only once
        if (this.currentRace.state === RACE_STATE.FINISHED && !this._raceTallied) {
          this._raceTallied = true;
          this._tallyScores();
          this.state = SESSION_STATE.INTERMISSION;
        }
        break;

      case SESSION_STATE.INTERMISSION:
        if (keys['Enter'] && !this._prevKeys?.['Enter']) {
          this._advanceRace();
        }
        break;

      case SESSION_STATE.FINAL:
        if (keys['Enter'] && !this._prevKeys?.['Enter']) {
          return 'menu';
        }
        break;
    }

    // Track previous key state to detect fresh presses
    this._prevKeys = { ...keys };
    return null;
  }

  _tallyScores() {
    const race = this.currentRace;
    if (this.multiplayer) {
      if (race.winner !== null) {
        this.totalScores[race.winner]++;
      }
    } else {
      // Single: score = laps completed
      const laps = race.cars[0]?.laps || 0;
      this.totalScores[0] += laps;
    }
  }

  _advanceRace() {
    this.raceIndex++;
    if (this.raceIndex >= 4) {
      // All 4 races done → Final screen
      this.state = SESSION_STATE.FINAL;
    } else {
      this._startRace(this.raceIndex);
    }
  }

  /**
   * Determine overall session winner for multiplayer.
   */
  _getOverallWinner() {
    if (!this.multiplayer) return null;
    if (this.totalScores[0] > this.totalScores[1]) return 0;
    if (this.totalScores[1] > this.totalScores[0]) return 1;
    return null; // tie
  }

  /**
   * Draw — delegate to current race or overlay screens.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    switch (this.state) {
      case SESSION_STATE.RACING:
        this.currentRace.draw(ctx);
        break;

      case SESSION_STATE.INTERMISSION:
        // Draw the track and cars as background (without finished overlay)
        this.currentRace.circuit.drawTrack(ctx);
        for (const car of this.currentRace.cars) car.draw(ctx);
        this._drawIntermission(ctx);
        break;

      case SESSION_STATE.FINAL:
        // Black background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 1024, 768);
        this._drawFinal(ctx);
        break;
    }
  }

  _drawIntermission(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(210, 190, 600, 400);

    const cx = 510;

    // Race number
    ctx.font = '28px "Bebas Neue", Impact, sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'center';
    ctx.fillText(`CARRERA ${this.raceIndex + 1} / 4`, cx, 240);

    if (this.multiplayer) {
      // Header
      ctx.font = 'bold 30px Impact, sans-serif';
      ctx.fillStyle = 'white';
      ctx.fillText('Jugador   /   Puntos', cx, 290);

      // P1
      ctx.font = '36px Impact, sans-serif';
      ctx.fillStyle = 'IndianRed';
      ctx.fillText(`P1   /   ${this.totalScores[0]}`, cx, 340);

      // P2
      ctx.fillText(`P2   /   ${this.totalScores[1]}`, cx, 390);

      // Race winner
      const rw = this.currentRace.winner;
      if (rw !== null) {
        ctx.font = '26px Impact, sans-serif';
        ctx.fillStyle = 'gold';
        ctx.fillText(`Ganador: Jugador ${rw + 1}`, cx, 440);
      }
    } else {
      // Single player: show total laps
      const laps = this.totalScores[0];
      ctx.font = 'bold 40px Impact, sans-serif';
      ctx.fillStyle = 'IndianRed';
      ctx.textAlign = 'center';
      ctx.fillText(`Puntos: ${laps}`, cx, 360);
    }

    ctx.font = '22px "Russo One", sans-serif';
    ctx.fillStyle = '#ccc';
    ctx.textAlign = 'center';
    ctx.fillText('Pulse ENTER para continuar', cx, 520);
    ctx.restore();
  }

  _drawFinal(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(210, 150, 600, 468);

    const cx = 510;

    ctx.font = 'bold 48px Impact, sans-serif';
    ctx.fillStyle = 'Tomato';
    ctx.textAlign = 'center';
    ctx.fillText('FIN DE SESIÓN', cx, 230);

    if (this.multiplayer) {
      ctx.font = '32px Impact, sans-serif';
      ctx.fillStyle = 'white';
      ctx.fillText('Resultados finales', cx, 290);

      ctx.font = '36px Impact, sans-serif';
      ctx.fillStyle = 'IndianRed';
      ctx.fillText(`Jugador 1: ${this.totalScores[0]} victorias`, cx, 350);
      ctx.fillText(`Jugador 2: ${this.totalScores[1]} victorias`, cx, 400);

      const winner = this._getOverallWinner();
      ctx.font = 'bold 38px Impact, sans-serif';
      ctx.fillStyle = 'Tomato';
      if (winner !== null) {
        ctx.fillText(`¡JUGADOR ${winner + 1} CAMPEÓN!`, cx, 460);
      } else {
        ctx.fillText('¡EMPATE!', cx, 460);
      }
    } else {
      ctx.font = '34px Impact, sans-serif';
      ctx.fillStyle = 'white';
      ctx.fillText(`Puntuación total: ${this.totalScores[0]}`, cx, 340);
    }

    ctx.font = '22px "Russo One", sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Pulse ENTER para volver al menú', cx, 560);
    ctx.restore();
  }
}
