// ─── Imports ──────────────────────────────────────────────────────────────────
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  AnimationMixer,
  Box3,
  Euler,
  Matrix4,
  Quaternion,
  SkinnedMesh,
  Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// ─── Source contract ──────────────────────────────────────────────────────────
// This changes rigging and animation, not the underlying creature sculpture.
const sourcePath = resolve("public/models/draconis-serpentine-v2.glb");
const outputPath = resolve("public/models/draconis-serpentine-reborn.glb");
const source = await readFile(sourcePath);
const jsonLength = source.readUInt32LE(12);
const document = JSON.parse(source.subarray(20, 20 + jsonLength).toString());
const sourceBinary = source.subarray(28 + jsonLength);
const binaryChunks = [sourceBinary];
let binaryLength = sourceBinary.length;
const componentLayout = {
  5120: [1, "readInt8", 127],
  5121: [1, "readUInt8", 255],
  5122: [2, "readInt16LE", 32767],
  5123: [2, "readUInt16LE", 65535],
  5125: [4, "readUInt32LE", 4294967295],
  5126: [4, "readFloatLE", 1],
};
const elementSize = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };

/** @param {number} id @returns {number[][]} */
const readAccessor = (id) => {
  const accessor = document.accessors[id];
  const view = document.bufferViews[accessor.bufferView];
  const [bytes, method, normalization] =
    componentLayout[accessor.componentType];
  const size = elementSize[accessor.type];
  const stride = view.byteStride ?? bytes * size;
  const offset = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  return Array.from({ length: accessor.count }, (_, index) =>
    Array.from(
      { length: size },
      (_, channel) =>
        sourceBinary[method](offset + index * stride + channel * bytes) /
        (accessor.normalized ? normalization : 1),
    ),
  );
};

/**
 * @param {number[][]} rows
 * @param {"SCALAR"|"VEC4"|"MAT4"} type
 * @param {5121|5123|5125|5126} componentType
 * @returns {number}
 */
const appendAccessor = (rows, type, componentType = 5126) => {
  const size = elementSize[type];
  const ArrayType =
    componentType === 5121
      ? Uint8Array
      : componentType === 5123
        ? Uint16Array
        : componentType === 5125
          ? Uint32Array
          : Float32Array;
  const values = new ArrayType(rows.flat());
  const padding = (4 - (binaryLength % 4)) % 4;
  if (padding) {
    binaryChunks.push(Buffer.alloc(padding));
    binaryLength += padding;
  }
  const bufferView = document.bufferViews.length;
  document.bufferViews.push({
    buffer: 0,
    byteOffset: binaryLength,
    byteLength: values.byteLength,
  });
  binaryChunks.push(Buffer.from(values.buffer));
  binaryLength += values.byteLength;
  const accessor = document.accessors.length;
  const bounds = Array.from({ length: size }, (_, index) =>
    rows.map((row) => row[index]),
  );
  document.accessors.push({
    bufferView,
    componentType,
    count: rows.length,
    type,
    ...(type === "SCALAR"
      ? { min: [Math.min(...bounds[0])], max: [Math.max(...bounds[0])] }
      : {}),
  });
  return accessor;
};

/** @returns {Matrix4[]} */
const nodeWorldMatrices = () => {
  const worlds = [];
  /** @param {number} index @param {Matrix4} parent */
  const visit = (index, parent) => {
    const node = document.nodes[index];
    const local = node.matrix
      ? new Matrix4().fromArray(node.matrix)
      : new Matrix4().compose(
          new Vector3(...(node.translation ?? [0, 0, 0])),
          new Quaternion(...(node.rotation ?? [0, 0, 0, 1])),
          new Vector3(...(node.scale ?? [1, 1, 1])),
        );
    worlds[index] = parent.clone().multiply(local);
    for (const child of node.children ?? []) visit(child, worlds[index]);
  };
  for (const index of document.scenes[document.scene ?? 0].nodes)
    visit(index, new Matrix4());
  return worlds;
};

// ─── Independent ocular joints, retaining the authored iris and pupil meshes ──
const headIndex = document.nodes.findIndex((node) => node.name === "Head");
if (headIndex < 0) throw new Error("Source asset has no Head joint");
const originalJointCount = document.skins[0].joints.length;
if (
  !document.skins.every(
    (skin) => skin.joints.join() === document.skins[0].joints.join(),
  )
)
  throw new Error("Source skeletons must have a consistent joint order");
const eyeDefinitions = [
  { name: "EyeFar", side: -1, translation: [-0.22, 0.061, -0.147] },
  { name: "EyeNear", side: 1, translation: [-0.22, 0.061, 0.147] },
];
for (const eye of eyeDefinitions) {
  eye.nodeIndex = document.nodes.length;
  document.nodes.push({ name: eye.name, translation: eye.translation });
  document.nodes[headIndex].children.push(eye.nodeIndex);
}
const worlds = nodeWorldMatrices();
const headInverse = worlds[headIndex].clone().invert();
const eyeVertexCounts = { iris: 0, pupil: 0 };
for (const mesh of document.meshes) {
  for (const primitive of mesh.primitives) {
    const name = document.materials[primitive.material].name;
    if (name !== "DragonEyes" && name !== "DragonMouthInterior") continue;
    const positions = readAccessor(primitive.attributes.POSITION);
    const joints = readAccessor(primitive.attributes.JOINTS_0);
    let changed = false;
    positions.forEach((position, index) => {
      const local = new Vector3(...position).applyMatrix4(headInverse);
      const side = local.z < 0 ? -1 : 1;
      const isPupil =
        name === "DragonMouthInterior" &&
        Math.abs(local.x + 0.227) < 0.009 &&
        Math.abs(local.y - 0.063) < 0.025 &&
        Math.abs(local.z - side * 0.159) < 0.006;
      if (name !== "DragonEyes" && !isPupil) return;
      joints[index] = [originalJointCount + (side === -1 ? 0 : 1), 0, 0, 0];
      eyeVertexCounts[isPupil ? "pupil" : "iris"] += 1;
      changed = true;
    });
    if (changed)
      primitive.attributes.JOINTS_0 = appendAccessor(joints, "VEC4", 5121);
  }
}
if (eyeVertexCounts.iris === 0 || eyeVertexCounts.pupil === 0)
  throw new Error("Failed to rebind the existing eye and pupil geometry");
for (const skin of document.skins) {
  const matrices = readAccessor(skin.inverseBindMatrices);
  for (const eye of eyeDefinitions) {
    skin.joints.push(eye.nodeIndex);
    matrices.push(worlds[eye.nodeIndex].clone().invert().toArray());
  }
  skin.inverseBindMatrices = appendAccessor(matrices, "MAT4");
}

// ─── Degenerate faces: remove zero-area triangles without changing sculpture ───
let removedTriangles = 0;
for (const mesh of document.meshes) {
  for (const primitive of mesh.primitives) {
    const positions = readAccessor(primitive.attributes.POSITION).map(
      (position) => new Vector3(...position),
    );
    const indices = readAccessor(primitive.indices).flat();
    const clean = [];
    for (let index = 0; index < indices.length; index += 3) {
      const [a, b, c] = indices.slice(index, index + 3);
      const ab = positions[b].clone().sub(positions[a]);
      const ac = positions[c].clone().sub(positions[a]);
      if (ab.cross(ac).lengthSq() < 1e-15) removedTriangles += 1;
      else clean.push([a], [b], [c]);
    }
    primitive.indices = appendAccessor(
      clean,
      "SCALAR",
      positions.length <= 65535 ? 5123 : 5125,
    );
  }
}

// ─── Flight and glide clips: delayed joints and asymmetric periodic strokes ────
const targetNodes = document.animations
  .find((clip) => clip.name === "Flight")
  .channels.map((channel) => channel.target.node);
/** @param {string} name @param {number} phase @param {boolean} glide @returns {number[]} */
const jointRotation = (name, phase, glide) => {
  const side = name.includes("Far") ? -1 : 1;
  const bilateralLag = side === -1 ? 0.045 : 0;
  const stroke = (lag = 0) =>
    Math.sin(phase + lag) + 0.22 * Math.sin(phase * 2 + lag - 0.45);
  let x = 0,
    y = 0,
    z = 0;
  if (name.startsWith("Neck_")) {
    const segment = Number(name.split("_")[1]);
    y =
      (glide ? 0.004 : 0.01) * Math.sin(phase - segment * 0.17) +
      (glide ? 0.001 : 0.003) * Math.sin(phase * 2 - segment * 0.23);
    z = (glide ? 0.0015 : 0.003) * Math.sin(phase - segment * 0.12 + 0.5);
  } else if (name.startsWith("Tail_")) {
    const segment = Number(name.split("_")[1]);
    y =
      (glide ? 0.007 + segment * 0.00025 : 0.014 + segment * 0.0008) *
      Math.sin(phase - segment * 0.23);
    z = (glide ? 0.002 : 0.005) * Math.sin(phase * 2 - segment * 0.31);
  } else if (name.startsWith("Wing")) {
    x =
      side *
      (glide
        ? -0.18 + 0.008 * Math.sin(phase + bilateralLag)
        : -0.12 +
          0.265 * stroke(bilateralLag) +
          0.012 * Math.sin(phase * 3 + bilateralLag));
    z = side * (glide ? 0.005 : 0.012) * Math.sin(phase - 0.2 + bilateralLag);
  } else if (name.startsWith("Elbow")) {
    x =
      side *
      (glide
        ? 0.035 + 0.004 * Math.sin(phase - 0.45)
        : 0.073 * stroke(-0.4 + bilateralLag));
  } else if (name.startsWith("Wrist")) {
    x =
      side *
      (glide
        ? -0.025 + 0.003 * Math.sin(phase - 0.8)
        : 0.06 * stroke(-0.78 + bilateralLag));
    y = (glide ? 0.002 : 0.009) * Math.sin(phase - 0.9 + bilateralLag);
  } else if (name.startsWith("Finger")) {
    const finger = Number(name.split("_")[1]);
    y =
      side *
      (glide
        ? 0.005 + finger * 0.002
        : (0.021 + finger * 0.006) *
          Math.sin(phase - 0.6 - finger * 0.17 + bilateralLag));
    z = side * (glide ? 0.001 : 0.005) * Math.sin(phase * 2 - finger * 0.25);
  } else if (name.startsWith("Leg")) {
    y = side * (glide ? 0.007 : 0.025) * Math.sin(phase - 0.4 + bilateralLag);
    x = (glide ? 0.002 : 0.009) * Math.sin(phase * 2 - 0.3);
  }
  return new Quaternion().setFromEuler(new Euler(x, y, z, "XYZ")).toArray();
};
const clips = [
  { name: "Flight", duration: 6.4, glide: false },
  { name: "Glide", duration: 9.6, glide: true },
];
document.animations = clips.map(({ name, duration, glide }) => {
  const times = Array.from({ length: 97 }, (_, index) => [
    (index / 96) * duration,
  ]);
  const input = appendAccessor(times, "SCALAR");
  const samplers = [],
    channels = [];
  for (const target of targetNodes) {
    const rotation = times.map(([time]) =>
      jointRotation(
        document.nodes[target].name,
        (time / duration) * Math.PI * 2,
        glide,
      ),
    );
    const output = appendAccessor(rotation, "VEC4");
    channels.push({
      sampler: samplers.length,
      target: { node: target, path: "rotation" },
    });
    samplers.push({ input, output, interpolation: "LINEAR" });
  }
  return { name, channels, samplers };
});
document.asset.generator =
  "DRACONIS rig refinement from original serpentine v2";
document.asset.extras = {
  ...document.asset.extras,
  revision:
    "Same original provisional sculpture; independent eyes and Flight/Glide clips. Not a cinematic or licensed series asset.",
};

// ─── Compact unused source accessors and binary views ──────────────────────────
const usedAccessors = new Set();
for (const mesh of document.meshes)
  for (const primitive of mesh.primitives) {
    usedAccessors.add(primitive.indices);
    Object.values(primitive.attributes).forEach((index) =>
      usedAccessors.add(index),
    );
  }
for (const skin of document.skins) usedAccessors.add(skin.inverseBindMatrices);
for (const clip of document.animations)
  for (const sampler of clip.samplers) {
    usedAccessors.add(sampler.input);
    usedAccessors.add(sampler.output);
  }
const accessorMap = new Map(
  [...usedAccessors].map((oldIndex, newIndex) => [oldIndex, newIndex]),
);
document.accessors = [...usedAccessors].map(
  (index) => document.accessors[index],
);
for (const mesh of document.meshes)
  for (const primitive of mesh.primitives) {
    primitive.indices = accessorMap.get(primitive.indices);
    for (const key of Object.keys(primitive.attributes))
      primitive.attributes[key] = accessorMap.get(primitive.attributes[key]);
  }
for (const skin of document.skins)
  skin.inverseBindMatrices = accessorMap.get(skin.inverseBindMatrices);
for (const clip of document.animations)
  for (const sampler of clip.samplers) {
    sampler.input = accessorMap.get(sampler.input);
    sampler.output = accessorMap.get(sampler.output);
  }
const usedViews = new Set([
  ...document.accessors.map((accessor) => accessor.bufferView),
  ...document.images.map((image) => image.bufferView),
]);
const oldBinary = Buffer.concat(binaryChunks);
const packedChunks = [];
const packedViews = [];
const viewMap = new Map();
let packedLength = 0;
for (const oldIndex of usedViews) {
  const view = document.bufferViews[oldIndex];
  const padding = (4 - (packedLength % 4)) % 4;
  if (padding) {
    packedChunks.push(Buffer.alloc(padding));
    packedLength += padding;
  }
  viewMap.set(oldIndex, packedViews.length);
  packedViews.push({ ...view, byteOffset: packedLength });
  packedChunks.push(
    oldBinary.subarray(
      view.byteOffset ?? 0,
      (view.byteOffset ?? 0) + view.byteLength,
    ),
  );
  packedLength += view.byteLength;
}
for (const accessor of document.accessors)
  accessor.bufferView = viewMap.get(accessor.bufferView);
for (const image of document.images)
  image.bufferView = viewMap.get(image.bufferView);
document.bufferViews = packedViews;
const endPadding = (4 - (packedLength % 4)) % 4;
packedChunks.push(Buffer.alloc(endPadding));
const packedBinary = Buffer.concat(packedChunks);
document.buffers = [{ byteLength: packedBinary.length }];

/** @param {object} jsonDocument @returns {Buffer} */
const toGlb = (jsonDocument) => {
  const json = Buffer.from(JSON.stringify(jsonDocument));
  const paddedJson = Buffer.concat([
    json,
    Buffer.alloc((4 - (json.length % 4)) % 4, 0x20),
  ]);
  const header = Buffer.alloc(20),
    binaryHeader = Buffer.alloc(8);
  header.write("glTF");
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(28 + paddedJson.length + packedBinary.length, 8);
  header.writeUInt32LE(paddedJson.length, 12);
  header.writeUInt32LE(0x4e4f534a, 16);
  binaryHeader.writeUInt32LE(packedBinary.length);
  binaryHeader.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([header, paddedJson, binaryHeader, packedBinary]);
};
const output = toGlb(document);
await writeFile(outputPath, output);

// ─── CPU skinning audit: both clips, blended poses, ocular extrema and seams ────
const geometryDocument = structuredClone(document);
geometryDocument.materials = geometryDocument.materials.map((material) => ({
  name: material.name,
  pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1] },
}));
geometryDocument.images = [];
geometryDocument.textures = [];
const geometryBytes = toGlb(geometryDocument);
const gltf = await new GLTFLoader().parseAsync(
  geometryBytes.buffer.slice(
    geometryBytes.byteOffset,
    geometryBytes.byteOffset + geometryBytes.byteLength,
  ),
  "",
);
const model = gltf.scene;
const meshes = [];
model.traverse((item) => {
  if (item instanceof SkinnedMesh) meshes.push(item);
});
const restBounds = new Box3().setFromObject(model);
const mixer = new AnimationMixer(model);
const actions = gltf.animations.map((clip) => mixer.clipAction(clip).play());
const animatedBounds = new Box3();
let checkedVertices = 0,
  checkedPoses = 0;
for (const blend of [0, 0.35, 0.7, 1]) {
  actions[0].setEffectiveWeight(1 - blend);
  actions[1].setEffectiveWeight(blend);
  for (let sample = 0; sample <= 24; sample += 1) {
    mixer.setTime((sample / 24) * 9.6);
    for (const eye of eyeDefinitions)
      model
        .getObjectByName(eye.name)
        .rotation.set(0.18 * Math.sin(sample), 0.18 * Math.cos(sample), 0);
    model.updateMatrixWorld(true);
    for (const mesh of meshes) {
      const positions = mesh.geometry.attributes.position;
      for (let index = 0; index < positions.count; index += 1) {
        const point = new Vector3().fromBufferAttribute(positions, index);
        mesh.applyBoneTransform(index, point);
        if (!point.toArray().every(Number.isFinite))
          throw new Error("Invalid skinned pose");
        animatedBounds.expandByPoint(point);
        checkedVertices += 1;
      }
    }
    checkedPoses += 1;
  }
}
const seamErrors = gltf.animations.map((clip) => ({
  name: clip.name,
  maxQuaternionDifference: Math.max(
    ...clip.tracks.map((track) => {
      const values = track.values,
        last = values.length - 4;
      return new Quaternion(...values.slice(0, 4))
        .normalize()
        .angleTo(new Quaternion(...values.slice(last)).normalize());
    }),
  ),
}));
if (seamErrors.some((seam) => seam.maxQuaternionDifference > 0.001))
  throw new Error("Animation loop seam is not closed");
const stats = {
  name: "Original serpentine · refined ocular and flight rig",
  source: "draconis-serpentine-v2.glb",
  status:
    "Same original provisional sculpture, not a cinematic production asset or licensed replica.",
  bytes: output.length,
  vertices: meshes.reduce(
    (sum, mesh) => sum + mesh.geometry.attributes.position.count,
    0,
  ),
  triangles: document.meshes.reduce(
    (sum, mesh) =>
      sum +
      mesh.primitives.reduce(
        (count, primitive) =>
          count + document.accessors[primitive.indices].count / 3,
        0,
      ),
    0,
  ),
  removedDegenerateTriangles: removedTriangles,
  meshes: document.meshes.length,
  joints: document.skins[0].joints.length,
  textures: document.images.length,
  eyeBones: eyeDefinitions.map((eye) => eye.name),
  eyeVertexCounts,
  clips: clips.map(({ name, duration }) => ({
    name,
    duration,
    channels: targetNodes.length,
  })),
  bounds: { min: restBounds.min.toArray(), max: restBounds.max.toArray() },
  validation: {
    checkedPoses,
    checkedVertices,
    finite: true,
    loopSeams: seamErrors,
    animatedBounds: {
      min: animatedBounds.min.toArray(),
      max: animatedBounds.max.toArray(),
    },
  },
};
await writeFile(
  resolve("public/models/serpentine-reborn-provenance.json"),
  JSON.stringify(stats, null, 2) + "\n",
);
console.log(JSON.stringify(stats, null, 2));
