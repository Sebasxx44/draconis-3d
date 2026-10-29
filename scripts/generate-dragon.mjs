import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Original procedural sculpture. No third-party character mesh or texture.
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

const scene = new THREE.Scene();
const dragon = new THREE.Group();
dragon.name = "DRACONIS_Original_Serpentine_Dragon";
scene.add(dragon);
const skin = new THREE.MeshStandardMaterial({
  color: "#8b2823",
  roughness: 0.55,
  metalness: 0.16,
});
const scales = new THREE.MeshStandardMaterial({
  color: "#5a211c",
  roughness: 0.47,
  metalness: 0.18,
});
const belly = new THREE.MeshStandardMaterial({
  color: "#7b4634",
  roughness: 0.75,
});
const membrane = new THREE.MeshStandardMaterial({
  color: "#7e2e25",
  roughness: 0.75,
  metalness: 0.04,
  side: THREE.DoubleSide,
});
const horn = new THREE.MeshStandardMaterial({
  color: "#b7936e",
  roughness: 0.46,
});
const eye = new THREE.MeshStandardMaterial({
  color: "#ffb643",
  emissive: "#ff7c12",
  emissiveIntensity: 2.5,
});
const pupil = new THREE.MeshStandardMaterial({
  color: "#0b0705",
  roughness: 0.2,
});
skin.name = "DragonSkin";
scales.name = "DragonScales";
belly.name = "DragonBelly";
membrane.name = "DragonMembrane";
const root = new THREE.Bone();
root.name = "Root";
dragon.add(root);
const vector = (values) => new THREE.Vector3(...values);
const mesh = (geometry, material, parent, position, scale) => {
  const object = new THREE.Mesh(geometry, material);
  if (position) object.position.copy(vector(position));
  if (scale) object.scale.copy(vector(scale));
  parent.add(object);
  return object;
};
const orb = (parent, position, scale, material = skin) =>
  mesh(
    new THREE.SphereGeometry(
      1,
      material === scales ? 8 : 18,
      material === scales ? 6 : 12,
    ),
    material,
    parent,
    position,
    scale,
  );
const curveMesh = (parent, points, radius, material = skin, segments = 18) => {
  const curve = new THREE.CatmullRomCurve3(points.map(vector));
  const geometry = new THREE.TubeGeometry(curve, segments, radius, 7, false);
  return mesh(geometry, material, parent);
};
const tapered = (parent, points, radii, material = horn) => {
  const curve = new THREE.CatmullRomCurve3(points.map(vector));
  const geometry = new THREE.TubeGeometry(curve, 16, 1, 7, false);
  const pos = geometry.attributes.position;
  for (let i = 0; i <= 16; i += 1) {
    const point = curve.getPointAt(i / 16);
    const t = (i / 16) * (radii.length - 1);
    const index = Math.floor(t);
    const radius = THREE.MathUtils.lerp(
      radii[index],
      radii[Math.min(index + 1, radii.length - 1)],
      t - index,
    );
    for (let j = 0; j <= 7; j += 1) {
      const k = i * 8 + j;
      const offset = new THREE.Vector3()
        .fromBufferAttribute(pos, k)
        .sub(point)
        .multiplyScalar(radius)
        .add(point);
      pos.setXYZ(k, offset.x, offset.y, offset.z);
    }
  }
  geometry.computeVertexNormals();
  return mesh(geometry, material, parent);
};
const tracks = [];
const period = 4.8;
const animateBone = (bone, axis, amplitude, phase = 0, base = 0) => {
  const times = [];
  const rotations = [];
  for (let i = 0; i <= 48; i += 1) {
    const t = (i / 48) * period;
    const angle =
      Math.sin((t / period) * Math.PI * 2 + phase) * amplitude + base;
    const quaternion = new THREE.Quaternion().setFromAxisAngle(
      vector(axis),
      angle,
    );
    times.push(t);
    rotations.push(...quaternion.toArray());
  }
  tracks.push(
    new THREE.QuaternionKeyframeTrack(
      `${bone.name}.quaternion`,
      times,
      rotations,
    ),
  );
};

const createSpine = (name, points, radii, count, radial, parent) => {
  const curve = new THREE.CatmullRomCurve3(points.map(vector));
  const bones = [];
  for (let i = 0; i <= count; i += 1) {
    const bone = new THREE.Bone();
    bone.name = `${name}_${i}`;
    const point = curve.getPoint(i / count);
    bone.position.copy(
      i ? point.clone().sub(curve.getPoint((i - 1) / count)) : point,
    );
    (i ? bones[i - 1] : parent).add(bone);
    bones.push(bone);
  }
  const positions = [];
  const normals = [];
  const indexes = [];
  const skinIndices = [];
  const skinWeights = [];
  const uvs = [];
  const frames = curve.computeFrenetFrames(count, false);
  for (let i = 0; i <= count; i += 1) {
    const t = i / count;
    const point = curve.getPoint(t);
    const r = t * (radii.length - 1);
    const rIndex = Math.floor(r);
    const radius = THREE.MathUtils.lerp(
      radii[rIndex],
      radii[Math.min(rIndex + 1, radii.length - 1)],
      r - rIndex,
    );
    for (let j = 0; j <= radial; j += 1) {
      const theta = (j / radial) * Math.PI * 2;
      const normal = frames.normals[i]
        .clone()
        .multiplyScalar(Math.cos(theta))
        .addScaledVector(frames.binormals[i], Math.sin(theta));
      const surface = point
        .clone()
        .addScaledVector(
          normal,
          radius * (1 + Math.cos(theta * 9 + t * 65) * 0.035),
        );
      positions.push(...surface.toArray());
      normals.push(...normal.toArray());
      uvs.push(t, j / radial);
      skinIndices.push(i, Math.min(i + 1, count), 0, 0);
      skinWeights.push(0.8, 0.2, 0, 0);
      if (i < count && j < radial) {
        const a = i * (radial + 1) + j;
        const b = a + radial + 1;
        indexes.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute(
    "skinIndex",
    new THREE.Uint16BufferAttribute(skinIndices, 4),
  );
  geometry.setAttribute(
    "skinWeight",
    new THREE.Float32BufferAttribute(skinWeights, 4),
  );
  geometry.setIndex(indexes);
  geometry.computeVertexNormals();
  const object = new THREE.SkinnedMesh(geometry, skin);
  object.name = `${name}_Sculpture`;
  dragon.add(object);
  dragon.updateMatrixWorld(true);
  object.bind(new THREE.Skeleton(bones));
  for (let i = 1; i < count; i += 2) {
    const t = i / count;
    const r = t * (radii.length - 1);
    const index = Math.floor(r);
    const radius = THREE.MathUtils.lerp(
      radii[index],
      radii[Math.min(index + 1, radii.length - 1)],
      r - index,
    );
    const spikeSize =
      name === "Tail"
        ? 0.12 * (1 - t) + 0.04
        : 0.1 + 0.1 * Math.sin(t * Math.PI);
    tapered(
      bones[i],
      [
        [0, radius * 0.8, 0],
        [0.04, radius + spikeSize, 0],
        [0.13, radius + spikeSize * 1.1, 0],
      ],
      [radius * 0.3, radius * 0.13, 0.001],
      scales,
    );
    for (let row = 0; row < 3; row += 1) {
      for (const side of [-1, 1]) {
        const theta = -0.3 + row * 0.62;
        const plate = orb(
          bones[i],
          [
            (row % 2) * radius * 0.2,
            Math.sin(theta) * radius * 0.98,
            side * Math.cos(theta) * radius * 0.98,
          ],
          [radius * 0.48, radius * 0.24, radius * 0.055],
          scales,
        );
        plate.rotation.x = -side * theta;
        plate.rotation.z = -0.4;
      }
    }
    animateBone(
      bones[i],
      [0, 1, 0],
      name === "Tail" ? 0.04 + t * 0.03 : 0.025,
      t * Math.PI * 2,
    );
  }
  return { bones, curve };
};

orb(root, [0.1, 0, 0], [0.78, 0.3, 0.29]);
orb(root, [-0.15, -0.12, 0], [0.57, 0.2, 0.24], belly);
for (let i = 0; i < 9; i += 1) {
  const x = -0.55 + i * 0.14;
  tapered(
    root,
    [
      [x, 0.24, 0],
      [x + 0.07, 0.55, 0],
      [x + 0.16, 0.56, 0],
    ],
    [0.08, 0.04, 0.001],
    scales,
  );
  for (let row = 0; row < 4; row += 1) {
    for (const side of [-1, 1]) {
      const theta = -0.55 + row * 0.5;
      const plate = orb(
        root,
        [
          x + (row % 2) * 0.035,
          Math.sin(theta) * 0.28,
          side * Math.cos(theta) * 0.28,
        ],
        [0.085, 0.058, 0.014],
        scales,
      );
      plate.rotation.x = -side * theta;
      plate.rotation.z = -0.4;
    }
  }
}
const neck = createSpine(
  "Neck",
  [
    [-0.48, 0.11, 0],
    [-0.95, 0.3, 0.03],
    [-1.5, 0.73, 0.04],
    [-2.07, 0.83, 0],
    [-2.55, 0.65, 0],
  ],
  [0.24, 0.2, 0.17, 0.145, 0.16],
  18,
  14,
  root,
);
createSpine(
  "Tail",
  [
    [0.66, 0, 0],
    [1.3, -0.15, 0.1],
    [2, -0.57, 0.2],
    [2.9, -0.58, 0.15],
    [3.55, -0.12, -0.05],
    [3.84, 0.27, -0.18],
  ],
  [0.23, 0.17, 0.11, 0.07, 0.035, 0.002],
  25,
  12,
  root,
);
const head = new THREE.Bone();
head.name = "Head";
neck.bones.at(-1).add(head);
orb(head, [-0.15, 0.015, 0], [0.3, 0.17, 0.19]);
orb(head, [-0.38, -0.025, 0], [0.3, 0.085, 0.115]);
orb(head, [-0.55, -0.055, 0], [0.17, 0.045, 0.105], scales);
const jaw = new THREE.Bone();
jaw.name = "Jaw";
jaw.position.set(0.0, -0.09, 0);
head.add(jaw);
orb(jaw, [-0.29, -0.035, 0], [0.38, 0.045, 0.12], belly);
for (const side of [-1, 1]) {
  orb(head, [-0.22, 0.065, side * 0.15], [0.042, 0.029, 0.025], eye);
  orb(head, [-0.238, 0.068, side * 0.175], [0.009, 0.023, 0.005], pupil);
  orb(head, [-0.19, 0.115, side * 0.15], [0.13, 0.055, 0.045], scales);
  orb(head, [-0.55, -0.015, side * 0.092], [0.024, 0.02, 0.02], pupil);
  tapered(
    head,
    [
      [0.015, 0.13, side * 0.14],
      [0.2, 0.28, side * 0.2],
      [0.48, 0.37, side * 0.3],
      [0.65, 0.47, side * 0.35],
    ],
    [0.085, 0.065, 0.025, 0.001],
  );
  tapered(
    head,
    [
      [-0.02, 0.07, side * 0.17],
      [0.17, 0.11, side * 0.32],
      [0.4, 0.17, side * 0.4],
    ],
    [0.065, 0.035, 0.001],
    scales,
  );
  tapered(
    head,
    [
      [0.02, -0.07, side * 0.12],
      [0.27, -0.13, side * 0.24],
      [0.41, -0.1, side * 0.25],
    ],
    [0.045, 0.025, 0.001],
    scales,
  );
  for (let i = 0; i < 7; i += 1) {
    tapered(
      head,
      [
        [-0.2 - i * 0.057, -0.09, side * 0.1],
        [-0.22 - i * 0.057, -0.145, side * 0.1],
      ],
      [0.014, 0.001],
    );
    tapered(
      jaw,
      [
        [-0.2 - i * 0.057, 0.0, side * 0.09],
        [-0.2 - i * 0.057, 0.04, side * 0.09],
      ],
      [0.011, 0.001],
    );
  }
}
const mouth = new THREE.Object3D();
mouth.name = "Mouth";
mouth.position.set(-0.65, -0.085, 0);
head.add(mouth);

// Layered membrane panels meet sculpted finger bones, with curved scalloped edges.
for (const side of [-1, 1]) {
  const wing = new THREE.Bone();
  wing.name = side === 1 ? "WingNear" : "WingFar";
  wing.position.set(-0.12, 0.15, side * 0.16);
  root.add(wing);
  const wrist = [-0.85, 1.65, side * 2.5];
  const tips = [
    [-0.85, 1.65, side * 2.5],
    [0.1, 1, side * 3.65],
    [1.5, 0.4, side * 3.1],
    [2.2, 0.13, side * 2.1],
    [1.65, -0.05, side * 0.9],
    [0.65, -0.15, side * 0.12],
  ];
  tapered(
    wing,
    [[0, 0, 0], [-0.38, 0.5, side * 0.65], wrist],
    [0.13, 0.095, 0.052],
    skin,
  );
  tapered(
    wing,
    [wrist, [-1.03, 1.82, side * 2.6], [-1.15, 1.85, side * 2.5]],
    [0.045, 0.03, 0.001],
    horn,
  );
  for (let f = 1; f < tips.length; f += 1) {
    const end = tips[f];
    const midpoint = vector(wrist).lerp(vector(end), 0.55);
    midpoint.y += 0.06;
    tapered(
      wing,
      [wrist, midpoint.toArray(), end],
      [0.045, 0.026, 0.002],
      scales,
    );
  }
  for (let p = 0; p < tips.length - 1; p += 1) {
    const a = vector(tips[p]);
    const b = vector(tips[p + 1]);
    const origin = p === 0 ? vector([-0.38, 0.5, side * 0.65]) : vector(wrist);
    const positions = [];
    const indices = [];
    const divisions = 12;
    for (let row = 0; row <= divisions; row += 1) {
      for (let col = 0; col <= divisions; col += 1) {
        const u = col / divisions;
        const v = row / divisions;
        const edge = a
          .clone()
          .lerp(b, u)
          .lerp(origin, Math.sin(Math.PI * u) * 0.19);
        const point = origin.clone().lerp(edge, v);
        point.y -= Math.sin(Math.PI * u) * Math.sin(Math.PI * v) * 0.18;
        positions.push(...point.toArray());
        if (row < divisions && col < divisions) {
          const k = row * (divisions + 1) + col;
          indices.push(
            k,
            k + 1,
            k + divisions + 1,
            k + 1,
            k + divisions + 2,
            k + divisions + 1,
          );
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    mesh(geometry, membrane, wing);
    const edgePoints = [];
    for (let k = 0; k <= 12; k += 1) {
      const u = k / 12;
      edgePoints.push(
        a
          .clone()
          .lerp(b, u)
          .lerp(origin, Math.sin(Math.PI * u) * 0.19)
          .toArray(),
      );
    }
    curveMesh(wing, edgePoints, 0.012, scales, 18);
    for (let vein = 1; vein <= 2; vein += 1) {
      const u = vein / 3;
      const edge = a
        .clone()
        .lerp(b, u)
        .lerp(origin, Math.sin(Math.PI * u) * 0.19);
      const midpoint = origin.clone().lerp(edge, 0.55);
      midpoint.y -= 0.16;
      curveMesh(
        wing,
        [origin.toArray(), midpoint.toArray(), edge.toArray()],
        0.007,
        scales,
        12,
      );
    }
  }
  animateBone(
    wing,
    [1, 0, 0],
    0.34,
    side === 1 ? 0 : Math.PI,
    side === 1 ? -0.28 : 0.28,
  );
  const hip = new THREE.Bone();
  hip.name = side === 1 ? "LegNear" : "LegFar";
  hip.position.set(0.48, -0.12, side * 0.23);
  root.add(hip);
  tapered(
    hip,
    [
      [0, 0, 0],
      [0.16, -0.28, side * 0.17],
      [0.43, -0.35, side * 0.2],
      [0.53, -0.63, side * 0.17],
    ],
    [0.12, 0.1, 0.065, 0.034],
    skin,
  );
  for (let toe = 0; toe < 3; toe += 1)
    tapered(
      hip,
      [
        [0.5, -0.61, side * 0.17],
        [0.42, -0.73, side * (0.12 + toe * 0.055)],
        [0.34, -0.71, side * (0.11 + toe * 0.07)],
      ],
      [0.025, 0.018, 0.001],
      horn,
    );
  animateBone(hip, [0, 0, 1], 0.08, (side * Math.PI) / 4);
}

// Merge static meshes within each joint/material to keep the rig mobile-friendly.
let mergedDrawCalls = 0;
dragon.traverse((joint) => {
  if (!joint.isBone) return;
  const batches = new Map();
  for (const child of [...joint.children]) {
    if (!child.isMesh || child.isSkinnedMesh) continue;
    child.updateMatrix();
    const key = child.material.uuid;
    if (!batches.has(key))
      batches.set(key, { material: child.material, meshes: [] });
    batches.get(key).meshes.push(child);
  }
  for (const { material, meshes } of batches.values()) {
    const geometries = meshes.map((item) =>
      item.geometry.clone().applyMatrix4(item.matrix),
    );
    const merged = mergeGeometries(geometries);
    if (!merged) continue;
    meshes.forEach((item) => {
      joint.remove(item);
      item.geometry.dispose();
    });
    geometries.forEach((geometry) => geometry.dispose());
    joint.add(new THREE.Mesh(merged, material));
    mergedDrawCalls += 1;
  }
});
console.log(`Meshes optimizados: ${mergedDrawCalls + 2}`);

const flight = new THREE.AnimationClip("Flight", period, tracks);
scene.updateMatrixWorld(true);
const exporter = new GLTFExporter();
const result = await exporter.parseAsync(scene, {
  binary: true,
  animations: [flight],
  onlyVisible: true,
});
const target = path.resolve("public/models");
await mkdir(target, { recursive: true });
await writeFile(
  path.join(target, "draconis-original.glb"),
  Buffer.from(result),
);
await writeFile(
  path.join(target, "README.md"),
  "# Dragón serpentino original\n\nGeometría procedural original creada para DRACONIS. No contiene recursos de terceros ni reproduce un modelo oficial de Caraxes. Es una interpretación provisional, sustituible por un GLB autorizado.\n\n- Generador: `scripts/generate-dragon.mjs`.\n- Esqueleto: cuello y cola con skinning, huesos de alas, cabeza y mandíbula.\n- Animación integrada: `Flight`.\n- Anclaje para fuego: `Mouth`.\n\nPara reemplazarlo, usa un GLB autorizado y adapta los nombres de huesos y el anclaje en DragonModelTA.\n",
);
console.log(
  `GLB original generado: ${(result.byteLength / 1024).toFixed(0)} KB`,
);
