import * as THREE from "three";

// ─── Procedural surface ────────────────────────────────────────────────────────
// Original, deterministic relief. No downloaded textures or third-party imagery.
export const createDragonRelief = (): THREE.CanvasTexture => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#8c8c8c";
    context.fillRect(0, 0, 512, 512);
    for (let row = -1; row < 17; row += 1) {
      for (let column = -1; column < 17; column += 1) {
        const x = column * 32 + (row % 2) * 16;
        const y = row * 32;
        const shade = 140 + ((row * 37 + column * 19) % 29);
        context.beginPath();
        context.moveTo(x, y - 18);
        context.quadraticCurveTo(x + 18, y - 8, x + 14, y + 4);
        context.lineTo(x, y + 17);
        context.lineTo(x - 14, y + 4);
        context.quadraticCurveTo(x - 18, y - 8, x, y - 18);
        context.fillStyle = `rgb(${shade},${shade},${shade})`;
        context.fill();
        context.strokeStyle = "#525252";
        context.lineWidth = 1.5;
        context.stroke();
        context.beginPath();
        context.moveTo(x - 11, y + 3);
        context.lineTo(x, y + 13);
        context.lineTo(x + 11, y + 3);
        context.strokeStyle = "#d0d0d0";
        context.lineWidth = 1;
        context.stroke();
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  texture.anisotropy = 4;
  return texture;
};
