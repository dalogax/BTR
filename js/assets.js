/**
 * assets.js — Asset preloader
 * Loads all images and circuit JSON data.
 * Provides pre-sampled ImageData for collision detection.
 */

export class AssetLoader {
  constructor() {
    this.images = {};
    this.circuitData = [];
    this.collisionData = []; // ImageData arrays per circuit
  }

  /** Load a single image, return Promise<HTMLImageElement> */
  _loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  /** Load a JSON file, return Promise<Object> */
  _loadJSON(src) {
    return fetch(src).then(r => {
      if (!r.ok) throw new Error(`Failed to load JSON: ${src}`);
      return r.json();
    });
  }

  /**
   * Pre-sample collision image into a flat Uint8ClampedArray.
   * We draw the image onto an offscreen canvas and grab ImageData.
   */
  _sampleCollision(img) {
    const w = img.naturalWidth  || img.width;
    const h = img.naturalHeight || img.height;
    const offscreen = document.createElement('canvas');
    offscreen.width  = w;
    offscreen.height = h;
    const ctx = offscreen.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, w, h);
  }

  async loadAll() {
    // ---- Images ----
    const imagePaths = {
      menuBg:     'assets/menu/menu_fondo.png',
      car0:       'assets/cars/coche0.png',
      car1:       'assets/cars/coche1.png',
      semaforo0:  'assets/semaphore/semaforo0.png',
      semaforo1:  'assets/semaphore/semaforo1.png',
      semaforo2:  'assets/semaphore/semaforo2.png',
      semaforo3:  'assets/semaphore/semaforo3.png',
      semaforo4:  'assets/semaphore/semaforo4.png',
    };

    for (let i = 0; i <= 3; i++) {
      imagePaths[`circuit${i}`]          = `assets/circuits/Circuito${i}.png`;
      imagePaths[`circuitCol${i}`]       = `assets/circuits/CircuitoColisiones${i}.png`;
    }

    const imageEntries = Object.entries(imagePaths);
    const loadedImages = await Promise.all(
      imageEntries.map(([, src]) => this._loadImage(src))
    );
    imageEntries.forEach(([key], i) => {
      this.images[key] = loadedImages[i];
    });

    // ---- Collision ImageData ----
    for (let i = 0; i <= 3; i++) {
      this.collisionData[i] = this._sampleCollision(this.images[`circuitCol${i}`]);
    }

    // ---- Circuit JSON ----
    this.circuitData = await Promise.all([
      this._loadJSON('data/circuit0.json'),
      this._loadJSON('data/circuit1.json'),
      this._loadJSON('data/circuit2.json'),
      this._loadJSON('data/circuit3.json'),
    ]);
  }
}
