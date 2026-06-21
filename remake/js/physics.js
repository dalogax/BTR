/**
 * physics.js — Surface detection from collision image
 * Samples pixels from pre-loaded ImageData to determine surface friction factors.
 */

/**
 * Get surface friction factor for a pixel color.
 * Returns a value in [0..1] where 1.0 = full grip, <1 = less grip.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {number}
 */
export function getSurfaceFactor(r, g, b) {
  // Asphalt (black / near-black)
  if (r < 50 && g < 50 && b < 50) return 1.0;

  // Grass (white / near-white) — noticeably slower
  if (r > 200 && g > 200 && b > 200) return 0.72;

  // Kerb: green (0,255,0) or cyan (0,255,255) — slight grip loss
  if (r < 50 && g > 200) return 0.90;

  // Sand: red (255,0,0) on circuits 1-3, magenta (255,0,255) on circuit 0 — very slow
  if (r > 200 && g < 50) return 0.45;

  // Default: treat as asphalt
  return 1.0;
}

/**
 * Sample all pixels under the car's rotated bounding box.
 * Returns the weighted average surface factor.
 *
 * @param {ImageData} imageData  — Pre-sampled collision image (1024×768)
 * @param {number} carX          — Car center X in world space
 * @param {number} carY          — Car center Y in world space
 * @param {number} carDir        — Car direction in radians
 * @returns {number}             — Surface factor [0..1]
 */
export function computeSurfaceFactor(imageData, carX, carY, carDir) {
  const { data, width, height } = imageData;
  let totalFactor = 0;
  let count = 0;

  // Car bounding box: 28×15 pixels, centered
  // lx: -14..14, ly: -7..7
  // Rotate local car coords (lx, ly) to world coords by car direction
  const cosD = Math.cos(carDir);
  const sinD = Math.sin(carDir);

  for (let lx = -14; lx <= 14; lx++) {
    for (let ly = -7; ly <= 7; ly++) {
      // wx = cx + cos(dir)*lx - sin(dir)*ly
      // wy = cy + sin(dir)*lx + cos(dir)*ly
      const wx = Math.round(carX + cosD * lx - sinD * ly);
      const wy = Math.round(carY + sinD * lx + cosD * ly);

      // Clamp to image bounds
      if (wx < 0 || wx >= width || wy < 0 || wy >= height) {
        // Outside image — treat as asphalt
        totalFactor += 1.0;
        count++;
        continue;
      }

      const idx = (wy * width + wx) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      totalFactor += getSurfaceFactor(r, g, b);
      count++;
    }
  }

  return count > 0 ? totalFactor / count : 1.0;
}
