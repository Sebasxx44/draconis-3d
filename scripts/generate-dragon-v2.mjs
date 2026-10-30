// ─── Imports ──────────────────────────────────────────────────────────────────
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// ─── Export environment ───────────────────────────────────────────────────────
globalThis.FileReader = class {
  readAsArrayBuffer = (blob) => {
    blob.arrayBuffer().then((value) => {
      this.result = value;
      this.onloadend?.();
    });
  };
  readAsDataURL = (blob) => {
    blob.arrayBuffer().then((value) => {
      this.result = `data:${blob.type};base64,${Buffer.from(value).toString("base64")}`;
      this.onloadend?.();
    });
  };
};

// ─── Math and sculpting helpers ───────────────────────────────────────────────
const V = (point) => new THREE.Vector3(...point);
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const smooth = (a, b, value) => {
  const t = clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const hash = (x, y) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
};
const noise = (x, y) => {
  const ix = Math.floor(x),
    iy = Math.floor(y);
  const tx = smooth(0, 1, x - ix),
    ty = smooth(0, 1, y - iy);
  return lerp(
    lerp(hash(ix, iy), hash(ix + 1, iy), tx),
    lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), tx),
    ty,
  );
};
const interpolate = (values, t) => {
  const scaled = clamp(t, 0, 1) * (values.length - 1),
    index = Math.floor(scaled);
  return lerp(
    values[index],
    values[Math.min(values.length - 1, index + 1)],
    smooth(0, 1, scaled - index),
  );
};
const makeGeometry = (positions, uv, indices, colors) => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  if (colors)
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
};
const addMesh = (parent, geometry, material, name) => {
  const item = new THREE.Mesh(geometry, material);
  if (name) item.name = name;
  parent.add(item);
  return item;
};

// ─── Authored PBR texture maps ─────────────────────────────────────────────────
const textureDirectory = path.resolve("public/textures/serpentine-v2");
await mkdir(textureDirectory, { recursive: true });
const textureSize = 1024;
const createTextureSet = async (kind) => {
  const size = textureSize,
    height = new Float32Array(size * size);
  const color = Buffer.alloc(size * size * 3),
    packed = Buffer.alloc(size * size * 3),
    normals = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = y * size + x,
        offset = i * 3;
      const coarse = noise(x / 130, y / 130),
        medium = noise(x / 23, y / 23),
        fine = hash(x, y);
      let relief, seam, pigment;
      if (kind === "skin") {
        const row = Math.floor(y / 24),
          gy = (y % 24) / 24;
        const shifted = x / 31 + (row % 2) * 0.5 + Math.sin(y * 0.035) * 0.08;
        const col = Math.floor(shifted),
          gx = shifted - col;
        const cell = hash(col, row),
          width = 0.8 + cell * 0.18;
        const diamond =
          Math.pow((Math.abs(gx - 0.5) * 2) / width, 1.35) +
          Math.pow(Math.abs(gy - 0.45) * 1.9, 1.6);
        seam = 1 - smooth(0.75, 1.03, diamond);
        relief = seam * (0.48 + 0.22 * (1 - gy)) + fine * 0.045 + medium * 0.07;
        pigment = 0.65 + coarse * 0.46 + cell * 0.13 + medium * 0.08;
        color[offset] = (50 + seam * 37) * pigment;
        color[offset + 1] = (13 + seam * 13) * pigment;
        color[offset + 2] = (12 + seam * 10) * pigment;
      } else {
        const folds = Math.sin(x * 0.23 + Math.sin(y * 0.021) * 2.4) * 0.018;
        const veinX = x + Math.sin(y * 0.013) * 11 + Math.sin(y * 0.04) * 3;
        const capillary = Math.abs((veinX % 117) - 58.5);
        const branchX = x + y * 0.37 + Math.sin(y * 0.018) * 9;
        const branch = Math.abs((branchX % 173) - 86.5);
        const veins = Math.max(
          1 - smooth(0.5, 2.4, capillary),
          (1 - smooth(0.2, 1.5, branch)) * 0.4,
        );
        seam = 1 - veins;
        relief = medium * 0.09 + folds + veins * 0.15 + fine * 0.015;
        pigment = 0.65 + coarse * 0.55;
        color[offset] = (95 - veins * 21 + medium * 12) * pigment;
        color[offset + 1] = (28 - veins * 7 + medium * 5) * pigment;
        color[offset + 2] = (22 - veins * 5 + medium * 4) * pigment;
      }
      height[i] = relief;
      packed[offset] = Math.round(192 + seam * 61);
      packed[offset + 1] = Math.round(155 + medium * 48 + fine * 14);
      packed[offset + 2] = 0;
    }
  }
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 3;
      const dx =
        (height[y * size + ((x + 1) % size)] -
          height[y * size + ((x - 1 + size) % size)]) *
        2.6;
      const dy =
        (height[((y + 1) % size) * size + x] -
          height[((y - 1 + size) % size) * size + x]) *
        2.6;
      const normal = new THREE.Vector3(-dx, -dy, 1).normalize();
      normals[index] = Math.round((normal.x * 0.5 + 0.5) * 255);
      normals[index + 1] = Math.round((normal.y * 0.5 + 0.5) * 255);
      normals[index + 2] = Math.round((normal.z * 0.5 + 0.5) * 255);
    }
  }
  const maps = {};
  for (const [name, data] of [
    ["basecolor", color],
    ["normal", normals],
    ["orm", packed],
  ]) {
    const mime = name === "basecolor" ? "image/jpeg" : "image/png";
    const pipeline = sharp(data, {
      raw: { width: size, height: size, channels: 3 },
    }).resize(name === "basecolor" ? 1024 : 512);
    const buffer =
      name === "basecolor"
        ? await pipeline.jpeg({ quality: 91 }).toBuffer()
        : await pipeline
            .png({
              compressionLevel: 9,
              palette: true,
              colours: name === "normal" ? 256 : 128,
              dither: 0,
            })
            .toBuffer();
    const filename = `${kind}-${name}.${name === "basecolor" ? "jpg" : "png"}`;
    await writeFile(path.join(textureDirectory, filename), buffer);
    maps[name] = { buffer, mime, filename };
  }
  return maps;
};
const textureSets = {
  skin: await createTextureSet("skin"),
  membrane: await createTextureSet("membrane"),
};

// ─── Materials ────────────────────────────────────────────────────────────────
const skin = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  roughness: 1,
  metalness: 0,
  vertexColors: true,
});
const membrane = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  roughness: 1,
  metalness: 0,
  vertexColors: true,
  side: THREE.DoubleSide,
});
const horn = new THREE.MeshStandardMaterial({
  color: "#654b38",
  roughness: 0.57,
  metalness: 0,
});
const teeth = new THREE.MeshStandardMaterial({
  color: "#c9baa1",
  roughness: 0.42,
});
const dark = new THREE.MeshStandardMaterial({
  color: "#170a09",
  roughness: 0.72,
});
const eye = new THREE.MeshStandardMaterial({
  color: "#cc8d34",
  emissive: "#b45b12",
  emissiveIntensity: 0.24,
  roughness: 0.24,
});
skin.name = "DragonSkinPBR";
membrane.name = "DragonMembranePBR";
horn.name = "DragonHorn";
teeth.name = "DragonTeeth";
dark.name = "DragonMouthInterior";
eye.name = "DragonEyes";

// ─── Scene and animation contract ─────────────────────────────────────────────
const scene = new THREE.Scene(),
  dragon = new THREE.Group(),
  root = new THREE.Bone();
dragon.name = "DRACONIS_Original_Serpentine_V2";
root.name = "Root";
scene.add(dragon);
dragon.add(root);
const tracks = [],
  period = 5.8;
const animate = (bone, axis, amplitude, phase = 0, base = 0, harmonic = 0) => {
  const times = [],
    values = [];
  for (let i = 0; i <= 72; i += 1) {
    const phaseTime = (i / 72) * Math.PI * 2;
    const angle =
      Math.sin(phaseTime + phase) * amplitude +
      Math.sin(phaseTime * 2 + phase) * harmonic +
      base;
    times.push((i / 72) * period);
    values.push(
      ...new THREE.Quaternion().setFromAxisAngle(V(axis), angle).toArray(),
    );
  }
  tracks.push(
    new THREE.QuaternionKeyframeTrack(`${bone.name}.quaternion`, times, values),
  );
};
const surfaceTint = (theta, t) => {
  const ventral = Math.pow(Math.max(0, -Math.cos(theta)), 4);
  const fleck =
    0.86 + 0.1 * Math.sin(t * 19) + 0.04 * Math.sin(theta * 7 + t * 31);
  return [
    fleck + ventral * 0.13,
    fleck + ventral * 0.2,
    fleck + ventral * 0.08,
  ];
};

// A continuous loft is used for torso, cranium, jaw, horns and limbs; no assembled sphere plates.
const loft = (
  points,
  widths,
  heights,
  {
    segments = 48,
    radial = 24,
    uvLength = 1,
    sculpt = 0.015,
    colors = true,
    vertical = null,
  } = {},
) => {
  const curve = new THREE.CatmullRomCurve3(points.map(V));
  const positions = [],
    uv = [],
    indices = [],
    tint = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments,
      center = curve.getPoint(t),
      tangent = curve.getTangent(t).normalize();
    const lateral = new THREE.Vector3()
      .crossVectors(tangent, new THREE.Vector3(0, 1, 0))
      .normalize();
    const up = new THREE.Vector3().crossVectors(lateral, tangent).normalize();
    const width = interpolate(widths, t),
      height = interpolate(heights, t);
    for (let j = 0; j <= radial; j += 1) {
      const theta = (j / radial) * Math.PI * 2;
      const irregular =
        1 +
        Math.sin(t * 87 + theta * 9) * sculpt +
        Math.sin(t * 31 - theta * 3) * sculpt * 0.7;
      const y =
        Math.cos(theta) *
        height *
        irregular *
        (vertical ? vertical(theta, t) : 1);
      const z = Math.sin(theta) * width * irregular;
      const p = center
        .clone()
        .addScaledVector(up, y)
        .addScaledVector(lateral, z);
      positions.push(...p.toArray());
      uv.push(t * uvLength, j / radial);
      tint.push(...surfaceTint(theta, t));
      if (i < segments && j < radial) {
        const a = i * (radial + 1) + j,
          b = a + radial + 1;
        indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }
  return {
    geometry: makeGeometry(positions, uv, indices, colors ? tint : null),
    curve,
  };
};
const curvedHorn = (parent, points, radii, material = horn, slender = 1) => {
  const { geometry } = loft(
    points,
    radii.map((r) => r * slender),
    radii,
    { segments: 18, radial: 9, colors: material === skin, sculpt: 0.04 },
  );
  return addMesh(parent, geometry, material);
};
const createSpine = (
  name,
  points,
  radii,
  boneCount,
  segments,
  radial,
  parent,
) => {
  const { geometry, curve } = loft(
    points,
    radii.map((r) => r * 0.8),
    radii,
    { segments, radial, uvLength: name === "Neck" ? 2.2 : 3.1, sculpt: 0.021 },
  );
  const bones = [];
  for (let i = 0; i <= boneCount; i += 1) {
    const bone = new THREE.Bone();
    bone.name = `${name}_${i}`;
    const point = curve.getPoint(i / boneCount);
    bone.position.copy(
      i ? point.clone().sub(curve.getPoint((i - 1) / boneCount)) : point,
    );
    (i ? bones[i - 1] : parent).add(bone);
    bones.push(bone);
  }
  const indices = [],
    weights = [];
  for (let i = 0; i <= segments; i += 1) {
    const fraction = (i / segments) * boneCount,
      index = Math.floor(fraction),
      blend = fraction - index;
    for (let j = 0; j <= radial; j += 1) {
      indices.push(index, Math.min(index + 1, boneCount), 0, 0);
      weights.push(1 - blend, blend, 0, 0);
    }
  }
  geometry.setAttribute(
    "skinIndex",
    new THREE.Uint16BufferAttribute(indices, 4),
  );
  geometry.setAttribute(
    "skinWeight",
    new THREE.Float32BufferAttribute(weights, 4),
  );
  const item = new THREE.SkinnedMesh(geometry, skin);
  item.name = `${name}_ContinuousSkin`;
  dragon.add(item);
  dragon.updateMatrixWorld(true);
  item.bind(new THREE.Skeleton(bones));
  for (let i = 1; i < boneCount; i += 1) {
    const t = i / boneCount,
      r = interpolate(radii, t),
      spike = (name === "Neck" ? 0.17 : 0.12) * (1 - t * 0.55);
    const tilt = name === "Neck" ? 1 : -1;
    curvedHorn(
      bones[i],
      [
        [0, r * 0.82, 0],
        [tilt * 0.04, r + spike * 0.5, 0.008],
        [tilt * 0.14, r + spike, 0],
      ],
      [r * 0.12, r * 0.055, 0.0003],
      horn,
      0.75,
    );
    animate(
      bones[i],
      [0, 1, 0],
      name === "Tail" ? 0.018 + t * 0.021 : 0.014,
      -t * Math.PI * 2.5,
    );
  }
  return { bones, curve };
};

// ─── Axial anatomy: slender thorax, exceptionally long cervical spine and tail ──
addMesh(
  root,
  loft(
    [
      [-0.92, 0.08, 0],
      [-0.63, 0.05, 0],
      [-0.05, -0.015, 0],
      [0.56, -0.04, 0],
      [1.03, -0.03, 0],
    ],
    [0.145, 0.245, 0.22, 0.17, 0.12],
    [0.17, 0.31, 0.29, 0.205, 0.13],
    { segments: 64, radial: 32, uvLength: 1.5, sculpt: 0.025 },
  ).geometry,
  skin,
  "SlenderThorax",
);
const neck = createSpine(
  "Neck",
  [
    [-0.83, 0.08, 0],
    [-1.35, 0.33, 0.02],
    [-2.12, 0.83, 0.03],
    [-2.95, 1.02, -0.04],
    [-3.67, 0.83, -0.06],
    [-4.0, 0.61, 0],
  ],
  [0.195, 0.165, 0.117, 0.105, 0.117, 0.135],
  12,
  108,
  28,
  root,
);
createSpine(
  "Tail",
  [
    [0.91, -0.035, 0],
    [1.56, -0.12, 0.08],
    [2.45, -0.44, 0.17],
    [3.42, -0.65, 0.11],
    [4.25, -0.44, -0.03],
    [4.83, -0.03, -0.2],
    [5.12, 0.47, -0.25],
  ],
  [0.15, 0.13, 0.091, 0.06, 0.035, 0.017, 0.0005],
  18,
  132,
  24,
  root,
);
for (let i = 0; i < 15; i += 1) {
  const x = -0.79 + i * 0.116,
    height = 0.22 + Math.sin((i / 14) * Math.PI) * 0.08;
  curvedHorn(
    root,
    [
      [x, height * 0.88, 0],
      [x + 0.035, height + 0.12, 0],
      [x + 0.1, height + 0.21, 0.005],
    ],
    [0.036, 0.018, 0.0005],
    horn,
    0.65,
  );
}

// ─── Head: sculpted planar skull, cheek ridges and separate mandibular rig ──────
const head = new THREE.Bone();
head.name = "Head";
neck.bones.at(-1).add(head);
addMesh(
  head,
  loft(
    [
      [0.12, 0, 0],
      [-0.05, 0.025, 0],
      [-0.24, 0.01, 0],
      [-0.46, -0.035, 0],
      [-0.67, -0.057, 0],
      [-0.79, -0.05, 0],
    ],
    [0.11, 0.18, 0.153, 0.108, 0.088, 0.035],
    [0.11, 0.155, 0.12, 0.067, 0.05, 0.018],
    {
      segments: 58,
      radial: 32,
      uvLength: 0.65,
      sculpt: 0.018,
      vertical: (theta, t) =>
        Math.cos(theta) < 0
          ? 0.5
          : 1 + Math.sin(theta * 4) * 0.06 * Math.sin(t * Math.PI),
    },
  ).geometry,
  skin,
  "SculptedCranium",
);
const jaw = new THREE.Bone();
jaw.name = "Jaw";
jaw.position.set(0.01, -0.105, 0);
head.add(jaw);
addMesh(
  jaw,
  loft(
    [
      [0.05, 0.013, 0],
      [-0.17, -0.025, 0],
      [-0.4, -0.019, 0],
      [-0.66, 0.005, 0],
      [-0.77, 0.027, 0],
    ],
    [0.08, 0.126, 0.095, 0.073, 0.015],
    [0.025, 0.044, 0.025, 0.013, 0.003],
    { segments: 40, radial: 20, uvLength: 0.7, sculpt: 0.015 },
  ).geometry,
  skin,
  "Mandible",
);
addMesh(
  jaw,
  loft(
    [
      [0, 0.02, 0],
      [-0.35, 0.005, 0],
      [-0.69, 0.023, 0],
    ],
    [0.065, 0.082, 0.025],
    [0.008, 0.008, 0.003],
    { segments: 20, radial: 12, colors: false },
  ).geometry,
  dark,
  "MouthCavity",
);
const addEye = (side) => {
  const eyeGeometry = new THREE.SphereGeometry(1, 16, 12);
  const eyeball = addMesh(head, eyeGeometry, eye);
  eyeball.position.set(-0.22, 0.061, side * 0.147);
  eyeball.scale.set(0.029, 0.019, 0.014);
  const slit = addMesh(head, new THREE.SphereGeometry(1, 8, 8), dark);
  slit.position.set(-0.227, 0.063, side * 0.159);
  slit.scale.set(0.005, 0.017, 0.003);
  curvedHorn(
    head,
    [
      [-0.35, 0.073, side * 0.12],
      [-0.23, 0.101, side * 0.154],
      [-0.08, 0.101, side * 0.15],
      [0.06, 0.06, side * 0.13],
    ],
    [0.012, 0.024, 0.025, 0.005],
    skin,
    0.6,
  );
  const nostril = addMesh(head, new THREE.SphereGeometry(1, 10, 8), dark);
  nostril.position.set(-0.666, -0.031, side * 0.082);
  nostril.scale.set(0.023, 0.009, 0.005);
};
for (const side of [-1, 1]) {
  addEye(side);
  for (let h = 0; h < 3; h += 1) {
    const offset = h * 0.055;
    curvedHorn(
      head,
      [
        [0.0 - offset, 0.1 - h * 0.07, side * (0.12 + h * 0.013)],
        [0.18, 0.2 - h * 0.09, side * (0.2 + h * 0.045)],
        [0.41 - h * 0.04, 0.27 - h * 0.11, side * (0.25 + h * 0.055)],
      ],
      [0.047 - h * 0.008, 0.022, 0.0004],
      horn,
      0.7,
    );
  }
  for (let t = 0; t < 11; t += 1) {
    const x = -0.19 - t * 0.049,
      z = side * lerp(0.114, 0.071, t / 10),
      length = 0.035 + Math.sin(t * 1.4) * 0.01;
    curvedHorn(
      head,
      [
        [x, -0.056, z],
        [x - 0.008, -0.07 - length, z * 0.99],
      ],
      [0.008, 0.0004],
      teeth,
    );
    curvedHorn(
      jaw,
      [
        [x, 0.014, z * 0.92],
        [x - 0.007, 0.014 + length * 0.8, z * 0.9],
      ],
      [0.0065, 0.0003],
      teeth,
    );
  }
}
const mouth = new THREE.Object3D();
mouth.name = "Mouth";
mouth.position.set(-0.8, -0.083, 0);
head.add(mouth);

// ─── Membrane builder with three-joint blending per vertex ─────────────────────
const skinWingPart = (geometry, bones, indexWeights, name) => {
  const indices = [],
    weights = [];
  for (const entry of indexWeights) {
    indices.push(...entry.indices);
    weights.push(...entry.weights);
  }
  geometry.setAttribute(
    "skinIndex",
    new THREE.Uint16BufferAttribute(indices, 4),
  );
  geometry.setAttribute(
    "skinWeight",
    new THREE.Float32BufferAttribute(weights, 4),
  );
  const item = new THREE.SkinnedMesh(geometry, membrane);
  item.name = name;
  dragon.add(item);
  dragon.updateMatrixWorld(true);
  item.bind(new THREE.Skeleton(bones));
  return item;
};
const membranePanel = (
  origin,
  a,
  b,
  shoulder,
  segments = 20,
  scallop = 0.23,
) => {
  const positions = [],
    uv = [],
    indices = [],
    colors = [],
    samples = [];
  for (let row = 0; row <= segments; row += 1) {
    const v = row / segments;
    for (let col = 0; col <= segments; col += 1) {
      const u = col / segments;
      const edge = a
        .clone()
        .lerp(b, u)
        .lerp(origin, Math.sin(u * Math.PI) * scallop);
      const point = origin.clone().lerp(edge, v);
      const tension = Math.sin(u * Math.PI) * Math.sin(v * Math.PI);
      point.y -= tension * 0.18;
      point.y += Math.sin(u * Math.PI * 8 + v * 5) * tension * 0.013;
      point.add(shoulder);
      positions.push(...point.toArray());
      uv.push(u * 0.7, v * 1.05);
      const rim = Math.pow(v, 7) * 0.32,
        rootShade = 0.8 + v * 0.18;
      colors.push(
        rootShade - rim,
        rootShade - rim * 0.7,
        rootShade - rim * 0.5,
      );
      samples.push({ u, v });
      if (row < segments && col < segments) {
        const k = row * (segments + 1) + col;
        indices.push(
          k,
          k + 1,
          k + segments + 1,
          k + 1,
          k + segments + 2,
          k + segments + 1,
        );
      }
    }
  }
  return { geometry: makeGeometry(positions, uv, indices, colors), samples };
};

// ─── Articulated wings: shoulder, elbow, wrist and independent membrane fingers ─
for (const side of [-1, 1]) {
  const suffix = side === 1 ? "Near" : "Far";
  const shoulder = V([-0.57, 0.11, side * 0.2]);
  const wing = new THREE.Bone();
  wing.name = `Wing${suffix}`;
  wing.position.copy(shoulder);
  root.add(wing);
  const elbowPoint = V([-0.35, 0.63, side * 0.9]);
  const wristPoint = V([-0.98, 1.5, side * 2.22]);
  const elbow = new THREE.Bone();
  elbow.name = `Elbow${suffix}`;
  elbow.position.copy(elbowPoint);
  wing.add(elbow);
  const wrist = new THREE.Bone();
  wrist.name = `Wrist${suffix}`;
  wrist.position.copy(wristPoint.clone().sub(elbowPoint));
  elbow.add(wrist);
  curvedHorn(
    wing,
    [[0, 0, 0], [-0.17, 0.26, side * 0.3], elbowPoint.toArray()],
    [0.13, 0.088, 0.063],
    skin,
  );
  curvedHorn(
    elbow,
    [[0, 0, 0], [-0.25, 0.41, side * 0.6], wrist.position.toArray()],
    [0.063, 0.042, 0.035],
    skin,
  );
  curvedHorn(
    wrist,
    [
      [0, 0, 0],
      [-0.09, 0.18, side * 0.13],
      [-0.25, 0.24, side * 0.12],
    ],
    [0.034, 0.017, 0.0004],
    horn,
  );
  const tips = [
    V([-0.56, 1.3, side * 3.88]),
    V([0.7, 0.82, side * 3.65]),
    V([1.9, 0.36, side * 2.95]),
    V([2.28, -0.01, side * 1.76]),
    V([1.5, -0.13, side * 0.65]),
  ];
  const fingers = tips.map((tip, index) => {
    const bone = new THREE.Bone();
    bone.name = `Finger${suffix}_${index}`;
    wrist.add(bone);
    const local = tip.clone().sub(wristPoint);
    const mid = local.clone().multiplyScalar(0.53);
    mid.y += 0.055;
    curvedHorn(
      bone,
      [[0, 0, 0], mid.toArray(), local.toArray()],
      [0.029 - index * 0.0027, 0.016 - index * 0.0013, 0.001],
      skin,
      0.84,
    );
    animate(
      bone,
      [0, 1, 0],
      0.025 + index * 0.007,
      side === 1 ? -0.6 - index * 0.15 : Math.PI - 0.6 - index * 0.15,
    );
    return bone;
  });
  const bones = [wing, elbow, wrist, ...fingers];
  const front = membranePanel(
    V([0, 0, 0]),
    wristPoint,
    tips[0],
    shoulder,
    18,
    0.06,
  );
  skinWingPart(
    front.geometry,
    bones,
    front.samples.map(({ u, v }) => ({
      indices: [0, 2, 3, 0],
      weights: [1 - v, v * (1 - u), v * u, 0],
    })),
    `${suffix}_LeadingMembrane`,
  );
  for (let panel = 0; panel < tips.length - 1; panel += 1) {
    const result = membranePanel(
      wristPoint,
      tips[panel],
      tips[panel + 1],
      shoulder,
      22,
      0.24,
    );
    skinWingPart(
      result.geometry,
      bones,
      result.samples.map(({ u, v }) => ({
        indices: [2, panel + 3, panel + 4, 0],
        weights: [1 - v, v * (1 - u), v * u, 0],
      })),
      `${suffix}_Membrane_${panel}`,
    );
  }
  const trailing = membranePanel(
    wristPoint,
    tips.at(-1),
    V([1.15, -0.13, side * 0.02]),
    shoulder,
    18,
    0.12,
  );
  skinWingPart(
    trailing.geometry,
    bones,
    trailing.samples.map(({ u, v }) => ({
      indices: [2, 7, 0, 0],
      weights: [1 - v, v * (1 - u), v * u, 0],
    })),
    `${suffix}_TrailingMembrane`,
  );
  animate(
    wing,
    [1, 0, 0],
    0.28,
    side === 1 ? 0 : Math.PI,
    side === 1 ? -0.12 : 0.12,
    0.045 * side,
  );
  animate(elbow, [1, 0, 0], 0.07, side === 1 ? -0.42 : Math.PI - 0.42);
  animate(wrist, [1, 0, 0], 0.055, side === 1 ? -0.85 : Math.PI - 0.85);

  // Caraxes-inspired, original auxiliary hind membranes; only two hind limbs.
  const leg = new THREE.Bone();
  leg.name = `Leg${suffix}`;
  leg.position.set(0.63, -0.12, side * 0.15);
  root.add(leg);
  curvedHorn(
    leg,
    [
      [0, 0, 0],
      [0.15, -0.23, side * 0.16],
      [0.39, -0.38, side * 0.21],
      [0.45, -0.67, side * 0.24],
    ],
    [0.103, 0.087, 0.048, 0.025],
    skin,
    0.72,
  );
  for (let digit = 0; digit < 3; digit += 1) {
    curvedHorn(
      leg,
      [
        [0.45, -0.65, side * 0.24],
        [0.32, -0.76, side * (0.18 + digit * 0.052)],
        [0.21, -0.74, side * (0.17 + digit * 0.059)],
      ],
      [0.019, 0.012, 0.0004],
      teeth,
    );
  }
  const fin = membranePanel(
    V([0.06, -0.05, side * 0.06]),
    V([0.46, -0.6, side * 0.24]),
    V([1.0, -0.24, side * 0.64]),
    new THREE.Vector3(),
    14,
    0.18,
  );
  addMesh(leg, fin.geometry, membrane, `${suffix}_HindFlightMembrane`);
  curvedHorn(
    leg,
    [
      [0.06, -0.05, side * 0.06],
      [0.58, -0.16, side * 0.43],
      [1, -0.24, side * 0.64],
    ],
    [0.027, 0.011, 0.001],
    skin,
  );
  animate(leg, [0, 0, 1], 0.045, -0.8);
}

// ─── Merge rigid ornaments by joint and material ───────────────────────────────
dragon.traverse((joint) => {
  if (!(joint instanceof THREE.Bone)) return;
  const groups = new Map();
  for (const item of [...joint.children]) {
    if (!(item instanceof THREE.Mesh) || item instanceof THREE.SkinnedMesh)
      continue;
    const key = item.material.uuid;
    if (!groups.has(key))
      groups.set(key, { material: item.material, items: [] });
    groups.get(key).items.push(item);
  }
  for (const { material, items } of groups.values()) {
    if (items.length < 2) continue;
    const geometries = items.map((item) => {
      item.updateMatrix();
      return item.geometry.clone().applyMatrix4(item.matrix);
    });
    const geometry = mergeGeometries(geometries);
    if (!geometry)
      throw new Error(`Incompatible geometry batch: ${material.name}`);
    items.forEach((item) => {
      joint.remove(item);
      item.geometry.dispose();
    });
    geometries.forEach((item) => item.dispose());
    addMesh(joint, geometry, material, `${joint.name}_${material.name}`);
  }
});

// ─── GLB export with embedded original maps ────────────────────────────────────
scene.updateMatrixWorld(true);
// Preserve the full articulated skeleton while batching every material into one
// skinned mesh. Small horns/teeth are rigidly weighted, never separate draw calls.
const allBones = [],
  allMeshes = [],
  skinnedBatches = new Map();
dragon.traverse((object) => {
  if (object instanceof THREE.Bone) allBones.push(object);
  if (object instanceof THREE.Mesh) allMeshes.push(object);
});
for (const object of allMeshes) {
  const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
  const count = geometry.attributes.position.count;
  if (!geometry.attributes.color)
    geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(new Float32Array(count * 3).fill(1), 3),
    );
  const boneIndices = [],
    boneWeights = [];
  if (object instanceof THREE.SkinnedMesh) {
    const sourceIndices = object.geometry.attributes.skinIndex,
      sourceWeights = object.geometry.attributes.skinWeight;
    for (let vertex = 0; vertex < count; vertex += 1) {
      for (let slot = 0; slot < 4; slot += 1) {
        const jointIndex = sourceIndices.getComponent(vertex, slot);
        boneIndices.push(allBones.indexOf(object.skeleton.bones[jointIndex]));
        boneWeights.push(sourceWeights.getComponent(vertex, slot));
      }
    }
  } else {
    let joint = object.parent;
    while (joint && !(joint instanceof THREE.Bone)) joint = joint.parent;
    const boneIndex = allBones.indexOf(joint ?? root);
    for (let vertex = 0; vertex < count; vertex += 1) {
      boneIndices.push(boneIndex, 0, 0, 0);
      boneWeights.push(1, 0, 0, 0);
    }
  }
  geometry.setAttribute(
    "skinIndex",
    new THREE.Uint16BufferAttribute(boneIndices, 4),
  );
  geometry.setAttribute(
    "skinWeight",
    new THREE.Float32BufferAttribute(boneWeights, 4),
  );
  if (!skinnedBatches.has(object.material.uuid))
    skinnedBatches.set(object.material.uuid, {
      material: object.material,
      geometries: [],
    });
  skinnedBatches.get(object.material.uuid).geometries.push(geometry);
  object.removeFromParent();
}
const skeleton = new THREE.Skeleton(allBones);
for (const { material, geometries } of skinnedBatches.values()) {
  const geometry = mergeGeometries(geometries);
  if (!geometry)
    throw new Error(`Failed to batch articulated material ${material.name}`);
  const count = geometry.attributes.position.count;
  const packedNormals = new Int16Array(count * 3),
    packedColors = new Uint8Array(count * 3),
    packedWeights = new Uint8Array(count * 4),
    packedJoints = new Uint8Array(count * 4);
  for (let vertex = 0; vertex < count; vertex += 1) {
    const normal = new THREE.Vector3().fromBufferAttribute(
      geometry.attributes.normal,
      vertex,
    );
    if (normal.lengthSq() < 0.00001) normal.set(0, 1, 0);
    else normal.normalize();
    packedNormals.set(
      normal.toArray().map((value) => Math.round(value * 32767)),
      vertex * 3,
    );
    for (let channel = 0; channel < 3; channel += 1)
      packedColors[vertex * 3 + channel] = Math.round(
        clamp(geometry.attributes.color.getComponent(vertex, channel), 0, 1) *
          255,
      );
    const weights = [0, 1, 2, 3].map((channel) =>
      Math.round(
        geometry.attributes.skinWeight.getComponent(vertex, channel) * 255,
      ),
    );
    const largest = weights.indexOf(Math.max(...weights));
    weights[largest] += 255 - weights.reduce((sum, weight) => sum + weight, 0);
    packedWeights.set(weights, vertex * 4);
    for (let channel = 0; channel < 4; channel += 1)
      packedJoints[vertex * 4 + channel] =
        geometry.attributes.skinIndex.getComponent(vertex, channel);
  }
  geometry.setAttribute(
    "normal",
    new THREE.Int16BufferAttribute(packedNormals, 3, true),
  );
  geometry.setAttribute(
    "color",
    new THREE.Uint8BufferAttribute(packedColors, 3, true),
  );
  geometry.setAttribute(
    "skinWeight",
    new THREE.Uint8BufferAttribute(packedWeights, 4, true),
  );
  geometry.setAttribute(
    "skinIndex",
    new THREE.Uint8BufferAttribute(packedJoints, 4),
  );
  const model = new THREE.SkinnedMesh(geometry, material);
  model.name = `${material.name}_ArticulatedSculpture`;
  dragon.add(model);
  dragon.updateMatrixWorld(true);
  model.bind(skeleton);
  geometries.forEach((item) => item.dispose());
}
const clip = new THREE.AnimationClip("Flight", period, tracks);
const exporter = new GLTFExporter();
const exported = Buffer.from(
  await exporter.parseAsync(scene, {
    binary: true,
    animations: [clip],
    onlyVisible: true,
  }),
);
const jsonLength = exported.readUInt32LE(12);
const document = JSON.parse(exported.subarray(20, 20 + jsonLength).toString());
document.extensionsUsed = [
  ...new Set([...(document.extensionsUsed ?? []), "KHR_mesh_quantization"]),
];
document.extensionsRequired = [
  ...new Set([...(document.extensionsRequired ?? []), "KHR_mesh_quantization"]),
];
const binaryStart = 20 + jsonLength + 8;
const binaryChunks = [exported.subarray(binaryStart)];
let binaryLength = binaryChunks[0].length;
document.images = [];
document.textures = [];
document.samplers = [
  { magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 },
];
const textureIndexes = {};
for (const [kind, maps] of Object.entries(textureSets)) {
  textureIndexes[kind] = {};
  for (const [mapName, { buffer, mime, filename }] of Object.entries(maps)) {
    const padding = (4 - (binaryLength % 4)) % 4;
    if (padding) {
      binaryChunks.push(Buffer.alloc(padding));
      binaryLength += padding;
    }
    const view = document.bufferViews.length;
    document.bufferViews.push({
      buffer: 0,
      byteOffset: binaryLength,
      byteLength: buffer.length,
    });
    document.images.push({ bufferView: view, mimeType: mime, name: filename });
    document.textures.push({ sampler: 0, source: document.images.length - 1 });
    textureIndexes[kind][mapName] = document.textures.length - 1;
    binaryChunks.push(buffer);
    binaryLength += buffer.length;
  }
}
for (const material of document.materials) {
  const kind =
    material.name === skin.name
      ? "skin"
      : material.name === membrane.name
        ? "membrane"
        : null;
  if (!kind) continue;
  material.pbrMetallicRoughness.baseColorTexture = {
    index: textureIndexes[kind].basecolor,
  };
  material.pbrMetallicRoughness.metallicRoughnessTexture = {
    index: textureIndexes[kind].orm,
  };
  material.normalTexture = {
    index: textureIndexes[kind].normal,
    scale: kind === "skin" ? 0.7 : 0.45,
  };
  material.occlusionTexture = {
    index: textureIndexes[kind].orm,
    strength: 0.48,
  };
}
const binaryPadding = (4 - (binaryLength % 4)) % 4;
if (binaryPadding) {
  binaryChunks.push(Buffer.alloc(binaryPadding));
  binaryLength += binaryPadding;
}
document.buffers[0].byteLength = binaryLength;
document.asset.generator =
  "DRACONIS original parametric sculpture v2; Three.js GLTFExporter";
document.asset.extras = {
  provenance:
    "Original authored geometry and procedural PBR textures. Not an official Caraxes asset.",
  referenceOnly: "MPC House of the Dragon VFX breakdown",
  referenceUrl: "https://www.mpcvfx.com/en/filmography/house-of-the-dragon/",
};
const json = Buffer.from(JSON.stringify(document));
const jsonPadding = (4 - (json.length % 4)) % 4;
const paddedJson = Buffer.concat([json, Buffer.alloc(jsonPadding, 0x20)]);
const header = Buffer.alloc(20);
header.write("glTF");
header.writeUInt32LE(2, 4);
header.writeUInt32LE(20 + paddedJson.length + 8 + binaryLength, 8);
header.writeUInt32LE(paddedJson.length, 12);
header.writeUInt32LE(0x4e4f534a, 16);
const binaryHeader = Buffer.alloc(8);
binaryHeader.writeUInt32LE(binaryLength);
binaryHeader.writeUInt32LE(0x004e4942, 4);
const output = Buffer.concat([
  header,
  paddedJson,
  binaryHeader,
  ...binaryChunks,
]);
const modelsDirectory = path.resolve("public/models");
await mkdir(modelsDirectory, { recursive: true });
await writeFile(
  path.join(modelsDirectory, "draconis-serpentine-v2.glb"),
  output,
);

// ─── Reproducible audit summary ────────────────────────────────────────────────
const bounds = new THREE.Box3().setFromObject(dragon);
const animatedBounds = new THREE.Box3();
const auditMixer = new THREE.AnimationMixer(dragon);
auditMixer.clipAction(clip).play();
let validatedVertices = 0;
for (let frame = 0; frame <= 24; frame += 1) {
  auditMixer.setTime((frame / 24) * period);
  dragon.updateMatrixWorld(true);
  for (const object of dragon.children) {
    if (!(object instanceof THREE.SkinnedMesh)) continue;
    const position = object.geometry.attributes.position;
    for (let index = 0; index < position.count; index += 1) {
      const point = new THREE.Vector3().fromBufferAttribute(position, index);
      object.applyBoneTransform(index, point);
      if (!point.toArray().every(Number.isFinite))
        throw new Error("Non-finite skinned vertex during Flight");
      animatedBounds.expandByPoint(point);
      validatedVertices += 1;
    }
  }
}
auditMixer.stopAllAction();
const stats = {
  name: "Original serpentine v2",
  byteLength: output.length,
  triangles: document.meshes.reduce(
    (total, mesh) =>
      total +
      mesh.primitives.reduce(
        (sum, primitive) =>
          sum + document.accessors[primitive.indices].count / 3,
        0,
      ),
    0,
  ),
  meshes: document.meshes.length,
  skins: document.skins.length,
  textures: document.textures.length,
  animationChannels: clip.tracks.length,
  rigValidation: {
    sampledPoses: 25,
    validatedVertices,
    finite: true,
    animatedBounds: {
      min: animatedBounds.min.toArray(),
      max: animatedBounds.max.toArray(),
    },
  },
  bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
  bones: [
    "Head",
    "Jaw",
    "Mouth",
    "Neck_0…12",
    "Tail_0…18",
    "WingNear/Far",
    "ElbowNear/Far",
    "WristNear/Far",
    "FingerNear_0…4",
    "FingerFar_0…4",
    "LegNear/Far",
  ],
  status:
    "Original provisional interpretation, not a production VFX asset or licensed replica.",
  references: [
    "https://www.mpcvfx.com/en/filmography/house-of-the-dragon/",
    "https://www.syfy.com/syfy-wire/house-of-the-dragon-vfx-interview-game-of-thrones-prequel",
  ],
  externalAssetAudit: [
    {
      url: "https://sketchfab.com/3d-models/caraxes-the-blood-wyrm-6694de8be0d846418a53202a81851bb8",
      result:
        "403 when inspecting source. Download rights and commercial permission not verified; not used.",
    },
    {
      url: "https://space.snapmaker.com/en/model/17359-caraxes-house-of-the-dragon",
      result:
        "Page restricts redistribution/hosting of digital and derivative assets. Not used.",
    },
  ],
};
await writeFile(
  path.join(modelsDirectory, "serpentine-v2-provenance.json"),
  JSON.stringify(stats, null, 2) + "\n",
);
console.log(JSON.stringify(stats, null, 2));
