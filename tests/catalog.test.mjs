// ─── Imports ──────────────────────────────────────────────────────────────────
import { test } from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createWhatsAppLink } = await import(
  pathToFileURL(join(process.cwd(), "src/lib/whatsapp.ts")).href
);
const { dragons } = await import(
  pathToFileURL(join(process.cwd(), "src/data/dragons.ts")).href
);
const { dragonAsset } = await import(
  pathToFileURL(join(process.cwd(), "src/components/experience/dragon-asset.ts")).href
);

// ─── Contact behavior ─────────────────────────────────────────────────────────
test("El contacto ausente o inválido nunca genera un enlace falso", () => {
  for (const number of [
    "",
    "+573052863149",
    "305 286 3149",
    "1234567",
    "1234567890123456",
    "57x052863149",
  ]) {
    assert.equal(createWhatsAppLink(number, "Hola"), null);
  }
});

test("El mensaje conserva tildes, interrogaciones y el destinatario", () => {
  const message = "Hola, ¿tamaños y acabados para Caraxes? Rojo & bronce.";
  const link = createWhatsAppLink("573052863149", message);
  assert.ok(link);
  const url = new URL(link);
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/573052863149");
  assert.equal(url.searchParams.get("text"), message);
});

// ─── Catalogue integrity ──────────────────────────────────────────────────────
test("Los 23 dragones tienen identidad, imagen y mensaje propios", async () => {
  assert.equal(dragons.length, 23);
  assert.equal(new Set(dragons.map((dragon) => dragon.id)).size, 23);
  assert.equal(new Set(dragons.map((dragon) => dragon.image)).size, 23);
  for (const dragon of dragons) {
    assert.ok(dragon.whatsappMessage.includes(dragon.name));
    assert.ok(["screen", "literary", "historical"].includes(dragon.origin));
    assert.ok(dragon.image);
    await access(join(process.cwd(), "public", dragon.image));
  }
});

test("El GLB activo incluye vuelo, planeo, ojos articulados y anclaje de boca", async () => {
  const buffer = await readFile(
    join(process.cwd(), "public", dragonAsset.url),
  );
  assert.equal(buffer.subarray(0, 4).toString(), "glTF");
  assert.equal(buffer.readUInt32LE(4), 2);
  const jsonLength = buffer.readUInt32LE(12);
  const model = JSON.parse(buffer.subarray(20, 20 + jsonLength).toString());
  assert.ok(model.skins.length > 0);
  assert.equal(model.images.length, 6);
  assert.ok(model.materials.some((material) => material.normalTexture && material.pbrMetallicRoughness.baseColorTexture));
  for (const clip of Object.values(dragonAsset.clips)) {
    assert.ok(model.animations.some((animation) => animation.name === clip && animation.channels.length > 0));
  }
  assert.ok(model.nodes.some((node) => node.name === dragonAsset.bones.mouth));
  for (const name of dragonAsset.bones.eyes) {
    const eyeIndex = model.nodes.findIndex((node) => node.name === name);
    assert.ok(eyeIndex >= 0);
    assert.ok(model.skins.some((skin) => skin.joints.includes(eyeIndex)));
  }
});
