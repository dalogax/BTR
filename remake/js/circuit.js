/**
 * circuit.js — Circuit loader and renderer
 */

export class Circuit {
  /**
   * @param {Object} data               — parsed circuit JSON
   * @param {HTMLImageElement} img      — track visual overlay image
   * @param {HTMLImageElement} colImg   — track collision/surface image
   * @param {ImageData} colData         — pre-sampled collision image for physics
   * @param {Array<HTMLImageElement>} semImages — semaforo0..4
   */
  constructor(data, img, colImg, colData, semImages) {
    this.data     = data;
    this.img      = img;
    this.colImg   = colImg;
    this.colData  = colData;
    this.semImages = semImages;

    // Convenience
    this.checkpoints = data.checkpoints;
    this.grid        = data.grid;
    this.semaphorePos = data.semaphore;
  }

  /**
   * Draw the track: collision image (surface base) then visual overlay.
   * The road color comes from the cornflower blue background showing through
   * the transparent pixels; colored opaque pixels mark surface hazards.
   * @param {CanvasRenderingContext2D} ctx
   */
  drawTrack(ctx) {
    // Draw collision image first (provides visual surface colors: grass=white, sand=red)
    ctx.drawImage(this.colImg, 0, 0, 1024, 768);
    // Draw visual overlay (decorative elements on top)
    ctx.drawImage(this.img, 0, 0, 1024, 768);
  }

  /**
   * Draw the semaphore (traffic light) during countdown.
   * The semaphore image is 1091×3104 scaled to 2% → ~22×62 px.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} frame — 0..4 (semaforo0..4)
   */
  drawSemaphore(ctx, frame) {
    if (frame < 0 || frame > 4) return;
    const img = this.semImages[frame];
    if (!img) return;

    const srcW = img.naturalWidth  || img.width;
    const srcH = img.naturalHeight || img.height;
    // Scale to 4% (double the XNA 2%) for better visibility in browser
    const scale = 0.04;
    const dw = srcW * scale;  // ~43.6
    const dh = srcH * scale;  // ~124.2

    const [sx, sy] = this.semaphorePos;
    ctx.drawImage(img, sx - dw / 2, sy, dw, dh);
  }

  /**
   * Get grid start positions for cars.
   * Returns array of {x, y} objects.
   */
  getStartPositions() {
    return this.grid.map(([x, y]) => ({ x, y }));
  }
}
