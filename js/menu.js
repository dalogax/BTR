/**
 * menu.js — Menu rendering and input
 */

export const MENU_ACTION = {
  SINGLE:  'single',
  MULTI:   'multi',
  OPTIONS: 'options',
  RECORDS: 'records',
  NONE:    'none',
};

const ITEMS = [
  { label: 'UN JUGADOR',   action: MENU_ACTION.SINGLE  },
  { label: 'MULTIJUGADOR', action: MENU_ACTION.MULTI   },
  { label: 'OPCIONES',     action: MENU_ACTION.OPTIONS },
  { label: 'RÉCORDS',      action: MENU_ACTION.RECORDS },
];

// Bottom-right layout — right-aligned, clear of the BTR logo
const MENU_RIGHT = 990;
const MENU_TOP   = 390;
const MENU_STEP  = 95;

export class Menu {
  constructor(bgImage) {
    this.bgImage   = bgImage;
    this.selected  = 0;
    this._prevKeys = {};
  }

  update(keys) {
    let action = null;

    if (keys['ArrowUp'] && !this._prevKeys['ArrowUp']) {
      this.selected = (this.selected - 1 + ITEMS.length) % ITEMS.length;
    }
    if (keys['ArrowDown'] && !this._prevKeys['ArrowDown']) {
      this.selected = (this.selected + 1) % ITEMS.length;
    }
    if (keys['Enter'] && !this._prevKeys['Enter']) {
      action = ITEMS[this.selected].action;
    }

    this._prevKeys = { ...keys };
    return action;
  }

  draw(ctx) {
    ctx.drawImage(this.bgImage, 0, 0, 1024, 768);

    ctx.save();
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';

    for (let i = 0; i < ITEMS.length; i++) {
      const item     = ITEMS[i];
      const isActive = i === this.selected;
      const fontSize = isActive ? 64 : 44;
      const y        = MENU_TOP + i * MENU_STEP;

      ctx.font      = `${fontSize}px "Bebas Neue", Impact, sans-serif`;
      ctx.fillStyle = isActive ? '#6495ED' : 'rgba(255,255,255,0.75)';
      ctx.fillText(item.label, MENU_RIGHT, y);
    }

    ctx.restore();
  }
}

/**
 * Options screen — fullscreen toggle and controls reference.
 */
export class OptionsScreen {
  constructor() {
    this._prevKeys = {};
    this._fsError  = false;
  }

  _isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  async _toggleFullscreen() {
    this._fsError = false;
    try {
      if (this._isFullscreen()) {
        await (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      } else {
        const el = document.documentElement;
        await (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
      }
    } catch (_) {
      this._fsError = true;
    }
  }

  update(keys) {
    const back = keys['Escape'] && !this._prevKeys['Escape'];
    if (keys['Enter'] && !this._prevKeys['Enter']) this._toggleFullscreen();
    this._prevKeys = { ...keys };
    return back;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, 1024, 768);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '72px "Bebas Neue", Impact, sans-serif';
    ctx.fillStyle = '#6495ED';
    ctx.fillText('OPCIONES', 512, 130);

    ctx.strokeStyle = 'rgba(100,149,237,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(200, 185); ctx.lineTo(824, 185); ctx.stroke();

    // Fullscreen toggle
    const fsOn = this._isFullscreen();
    ctx.font = 'bold 32px "Orbitron", monospace';
    ctx.fillStyle = 'white';
    ctx.fillText('PANTALLA COMPLETA', 512, 260);

    ctx.font = '28px "Bebas Neue", Impact, sans-serif';
    ctx.fillStyle = fsOn ? '#44ff88' : '#ff4444';
    ctx.fillText(fsOn ? '● ACTIVADA' : '● DESACTIVADA', 512, 310);

    ctx.font = '20px "Rajdhani", sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText('Pulsa ENTER para cambiar', 512, 348);

    if (this._fsError) {
      ctx.fillStyle = '#ff6644';
      ctx.fillText('No disponible en este navegador', 512, 380);
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.moveTo(200, 420); ctx.lineTo(824, 420); ctx.stroke();

    // Controls
    ctx.font = '36px "Bebas Neue", Impact, sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText('CONTROLES', 512, 460);

    const controls = [
      ['JUGADOR 1', 'Flechas   ·   M = rescate'],
      ['JUGADOR 2', 'WASD   ·   R = rescate'],
    ];
    controls.forEach(([player, ctrl], i) => {
      const cy = 520 + i * 64;
      ctx.font = 'bold 22px "Orbitron", monospace';
      ctx.fillStyle = i === 0 ? 'limegreen' : '#ff9944';
      ctx.fillText(player, 512, cy);
      ctx.font = '20px "Rajdhani", sans-serif';
      ctx.fillStyle = '#ccc';
      ctx.fillText(ctrl, 512, cy + 28);
    });

    ctx.font = '20px "Russo One", sans-serif';
    ctx.fillStyle = '#555';
    ctx.fillText('ESC para volver', 512, 710);

    ctx.restore();
  }
}

/**
 * Records screen — shows best lap times per circuit from localStorage.
 */
export class RecordsScreen {
  constructor() {
    this._prevKeys = {};
  }

  _loadRecords() {
    try { return JSON.parse(localStorage.getItem('btr_records')) || {}; }
    catch (_) { return {}; }
  }

  update(keys) {
    const back = keys['Escape'] && !this._prevKeys['Escape'];
    this._prevKeys = { ...keys };
    return back;
  }

  draw(ctx) {
    const records = this._loadRecords();
    const wins = records.wins || [0, 0];
    const totalRaces = records.totalRaces || 0;

    ctx.save();
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, 1024, 768);
    ctx.textBaseline = 'middle';

    // Title
    ctx.font = '72px "Bebas Neue", Impact, sans-serif';
    ctx.fillStyle = '#6495ED';
    ctx.textAlign = 'center';
    ctx.fillText('RÉCORDS', 512, 80);

    ctx.strokeStyle = 'rgba(100,149,237,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(100, 130); ctx.lineTo(924, 130); ctx.stroke();

    // Table layout: 3 columns
    // Col 0 — circuit name:  right-edge at x=320
    // Col 1 — J1:            center at x=560
    // Col 2 — J2:            center at x=800
    const X_LABEL = 310; // right-align circuit name here
    const X_J1    = 560;
    const X_J2    = 800;

    // Column headers
    ctx.font = 'bold 20px "Orbitron", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'limegreen';
    ctx.fillText('J1 MEJOR VUELTA', X_J1, 170);
    ctx.fillStyle = '#ff9944';
    ctx.fillText('J2 MEJOR VUELTA', X_J2, 170);

    // Divider under headers
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.moveTo(100, 195); ctx.lineTo(924, 195); ctx.stroke();

    // Data rows — one per circuit
    const ROW_TOP  = 215;
    const ROW_STEP = 80;

    for (let i = 0; i < 4; i++) {
      const y   = ROW_TOP + i * ROW_STEP;
      const key = `circuit${i}`;
      const b0  = records[key]?.car0;
      const b1  = records[key]?.car1;

      // Alternating row tint
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fillRect(100, y - 30, 824, 60);
      }

      // Circuit label
      ctx.font = 'bold 24px "Orbitron", monospace';
      ctx.fillStyle = '#6495ED';
      ctx.textAlign = 'right';
      ctx.fillText(`CIRCUITO ${i + 1}`, X_LABEL, y);

      // Separator between label and values
      ctx.strokeStyle = 'rgba(100,149,237,0.25)';
      ctx.beginPath(); ctx.moveTo(X_LABEL + 20, y - 20); ctx.lineTo(X_LABEL + 20, y + 20); ctx.stroke();

      // J1 value
      const t0 = (b0 && isFinite(b0)) ? b0.toFixed(2) + 's' : '—';
      ctx.font = (b0 && isFinite(b0)) ? 'bold 26px "Orbitron", monospace' : '28px "Rajdhani", sans-serif';
      ctx.fillStyle = (b0 && isFinite(b0)) ? 'white' : '#444';
      ctx.textAlign = 'center';
      ctx.fillText(t0, X_J1, y);

      // J2 value
      const t1 = (b1 && isFinite(b1)) ? b1.toFixed(2) + 's' : '—';
      ctx.font = (b1 && isFinite(b1)) ? 'bold 26px "Orbitron", monospace' : '28px "Rajdhani", sans-serif';
      ctx.fillStyle = (b1 && isFinite(b1)) ? 'white' : '#444';
      ctx.fillText(t1, X_J2, y);
    }

    // Bottom separator
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.moveTo(100, ROW_TOP + 4 * ROW_STEP - 20); ctx.lineTo(924, ROW_TOP + 4 * ROW_STEP - 20); ctx.stroke();

    // Stats row
    const statsY = ROW_TOP + 4 * ROW_STEP + 40;
    ctx.font = '20px "Rajdhani", sans-serif';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText(`CARRERAS JUGADAS: ${totalRaces}`, 512, statsY);

    ctx.font = 'bold 22px "Orbitron", monospace';
    ctx.fillStyle = 'limegreen';
    ctx.fillText(`J1: ${wins[0]} victorias`, X_J1, statsY + 44);
    ctx.fillStyle = '#ff9944';
    ctx.fillText(`J2: ${wins[1]} victorias`, X_J2, statsY + 44);

    if (totalRaces === 0) {
      ctx.font = '24px "Rajdhani", sans-serif';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText('Aún no hay récords. ¡A correr!', 512, statsY + 90);
    }

    ctx.font = '20px "Russo One", sans-serif';
    ctx.fillStyle = '#555';
    ctx.fillText('ESC para volver', 512, 748);

    ctx.restore();
  }
}
