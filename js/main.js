/**
 * main.js — Game loop, state machine, entry point
 * Top-level states: LOADING → MENU → RACE → OPTIONS
 */

import { AssetLoader }             from './assets.js';
import { AudioSystem }             from './audio.js';
import { Menu, OptionsScreen, RecordsScreen, MENU_ACTION } from './menu.js';
import { Session }                 from './session.js';

// ─── Canvas setup ───────────────────────────────────────────────────────────

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
canvas.width  = 1024;
canvas.height = 768;

// ─── Global state ───────────────────────────────────────────────────────────

const GAME_STATE = {
  LOADING:  'LOADING',
  MENU:     'MENU',
  RACE:     'RACE',
  OPTIONS:  'OPTIONS',
  RECORDS:  'RECORDS',
};

let gameState   = GAME_STATE.LOADING;
let assets      = null;
let audio       = null;
let menu        = null;
let options     = null;
let records     = null;
let session     = null;

// ─── Input handling ──────────────────────────────────────────────────────────

const keys = {};

// Keys that should not scroll the page
const PREVENTED_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'
]);

window.addEventListener('keydown', e => {
  if (PREVENTED_KEYS.has(e.code)) e.preventDefault();
  keys[e.code] = true;

  // Resume audio on first keypress (browser autoplay policy)
  if (audio) audio.resume();
});

window.addEventListener('keyup', e => {
  keys[e.code] = false;
});

// ─── Input map ───────────────────────────────────────────────────────────────

const INPUT_MAP = {
  p1: {
    accel:  'ArrowUp',
    brake:  'ArrowDown',
    left:   'ArrowLeft',
    right:  'ArrowRight',
    rescue: 'KeyM',
  },
  p2: {
    accel:  'KeyW',
    brake:  'KeyS',
    left:   'KeyA',
    right:  'KeyD',
    rescue: 'KeyR',
  },
};

// ─── Loading screen ──────────────────────────────────────────────────────────

function drawLoading(progress) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 1024, 768);

  ctx.fillStyle = 'white';
  ctx.font = '36px "Orbitron", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Cargando...', 512, 360);

  // Progress bar
  ctx.fillStyle = '#333';
  ctx.fillRect(312, 400, 400, 20);
  ctx.fillStyle = '#6495ED';
  ctx.fillRect(312, 400, 400 * progress, 20);
}

// ─── Transition helpers ───────────────────────────────────────────────────────

function enterMenu() {
  gameState = GAME_STATE.MENU;
  menu = new Menu(assets.images.menuBg);
}

function enterRace(multiplayer) {
  gameState = GAME_STATE.RACE;
  session = new Session(assets, audio, multiplayer, INPUT_MAP);
}

function enterOptions() {
  gameState = GAME_STATE.OPTIONS;
  options = new OptionsScreen();
}

function enterRecords() {
  gameState = GAME_STATE.RECORDS;
  records = new RecordsScreen();
}

// ─── Main update ─────────────────────────────────────────────────────────────

let prevTimestamp = null;

function update(timestamp) {
  const dt = prevTimestamp === null ? 0 : Math.min((timestamp - prevTimestamp) / 1000, 0.1);
  prevTimestamp = timestamp;

  // ESC always returns to menu (except from menu itself)
  if (gameState !== GAME_STATE.MENU && gameState !== GAME_STATE.LOADING) {
    if (keys['Escape']) {
      // Stop audio if in race
      if (gameState === GAME_STATE.RACE && audio) {
        audio.stopRace();
      }
      enterMenu();
      // Clear the key so it doesn't immediately trigger in menu
      keys['Escape'] = false;
      draw(timestamp);
      requestAnimationFrame(update);
      return;
    }
  }

  switch (gameState) {
    case GAME_STATE.LOADING:
      // Loading is handled in init()
      break;

    case GAME_STATE.MENU: {
      const action = menu.update(keys);
      if (action === MENU_ACTION.SINGLE)  enterRace(false);
      if (action === MENU_ACTION.MULTI)   enterRace(true);
      if (action === MENU_ACTION.OPTIONS) enterOptions();
      if (action === MENU_ACTION.RECORDS) enterRecords();
      break;
    }

    case GAME_STATE.RACE: {
      const result = session.update(dt, keys);
      if (result === 'menu') {
        enterMenu();
      }
      // Expose debug state for testing
      if (session?.currentRace?.cars) {
        window.__btrDebug = session.currentRace.cars.map(c => ({
          x: Math.round(c.x), y: Math.round(c.y),
          laps: c.laps, cp: c.nextCheckpoint, vel: c.vel.toFixed(2)
        }));
      }
      break;
    }

    case GAME_STATE.OPTIONS: {
      const back = options.update(keys);
      if (back) enterMenu();
      break;
    }

    case GAME_STATE.RECORDS: {
      const back = records.update(keys);
      if (back) enterMenu();
      break;
    }
  }

  draw(timestamp);
  requestAnimationFrame(update);
}

// ─── Main draw ───────────────────────────────────────────────────────────────

function draw(_timestamp) {
  // Clear to cornflower blue — this is the road/background color (matches XNA Clear)
  ctx.fillStyle = '#6495ED';
  ctx.fillRect(0, 0, 1024, 768);

  switch (gameState) {
    case GAME_STATE.LOADING:
      drawLoading(0.5);
      break;

    case GAME_STATE.MENU:
      menu.draw(ctx);
      break;

    case GAME_STATE.RACE:
      session.draw(ctx);
      break;

    case GAME_STATE.OPTIONS:
      options.draw(ctx);
      break;

    case GAME_STATE.RECORDS:
      records.draw(ctx);
      break;
  }
}

// ─── Initialisation ───────────────────────────────────────────────────────────

async function init() {
  drawLoading(0);

  assets = new AssetLoader();
  audio  = new AudioSystem();

  try {
    // Show loading progress
    const loadingFrame = requestAnimationFrame(() => drawLoading(0.3));
    await assets.loadAll();
    cancelAnimationFrame(loadingFrame);
    drawLoading(1.0);
  } catch (err) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 1024, 768);
    ctx.fillStyle = 'red';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Error cargando assets:', 512, 340);
    ctx.fillText(err.message, 512, 380);
    console.error(err);
    return;
  }

  enterMenu();
  requestAnimationFrame(update);
}

init();
