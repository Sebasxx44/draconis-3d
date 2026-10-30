// ─── Imports ──────────────────────────────────────────────────────────────────
import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { getFlightTarget, dampFactor, isFireStage } = await import(
  pathToFileURL(join(process.cwd(), "src/components/experience/flight-math.ts"))
    .href
);

// ─── Representative hero → gutter → study → contact route ─────────────────────
const anchors = [
  {
    stage: "hero",
    at: 0,
    x: 990,
    y: 360,
    width: 620,
    height: 420,
    featured: true,
  },
  {
    stage: "catalog",
    at: 700,
    x: 1300,
    y: 235,
    width: 145,
    height: 110,
    featured: false,
  },
  {
    stage: "catalog",
    at: 1600,
    x: 1280,
    y: 410,
    width: 130,
    height: 100,
    featured: false,
  },
  {
    stage: "study",
    at: 2200,
    x: 420,
    y: 400,
    width: 540,
    height: 390,
    featured: true,
  },
  {
    stage: "gallery",
    at: 3500,
    x: 1300,
    y: 260,
    width: 145,
    height: 110,
    featured: false,
  },
  {
    stage: "contact",
    at: 4400,
    x: 1020,
    y: 400,
    width: 560,
    height: 390,
    featured: true,
  },
];

const assertNear = (actual, expected, tolerance = 0.0001) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} debe estar próximo a ${expected}`,
  );

// ─── User-visible route guarantees ────────────────────────────────────────────
test("El dragón llega al espacio asignado en cada sección y mantiene los extremos", () => {
  for (const anchor of anchors) {
    const target = getFlightTarget(anchors, anchor.at);
    for (const property of ["x", "y", "width", "height"])
      assertNear(target[property], anchor[property]);
  }
  const start = getFlightTarget(anchors, 0);
  const end = getFlightTarget(anchors, anchors.at(-1).at);
  const beforeStart = getFlightTarget(anchors, -500);
  const afterEnd = getFlightTarget(anchors, 9000);
  for (const property of Object.keys(start)) {
    assertNear(beforeStart[property], start[property]);
    assertNear(afterEnd[property], end[property]);
  }
});

test("Cruzar una sección en cualquier sentido no introduce saltos de posición ni escala", () => {
  for (const anchor of anchors.slice(1, -1)) {
    const before = getFlightTarget(anchors, anchor.at - 0.001);
    const after = getFlightTarget(anchors, anchor.at + 0.001);
    for (const property of [
      "x",
      "y",
      "width",
      "height",
      "featured",
      "yaw",
      "bank",
    ]) {
      assertNear(before[property], after[property], 0.001);
    }
  }
});

test("Volver hacia arriba reproduce exactamente la ruta y no deforma sus anclas", () => {
  const initial = structuredClone(anchors);
  const offsets = [
    0, 120, 690, 700, 920, 1600, 2000, 2200, 3100, 3500, 4100, 4400,
  ];
  const downward = offsets.map((offset) => getFlightTarget(anchors, offset));
  const upward = offsets
    .toReversed()
    .map((offset) => getFlightTarget(anchors, offset))
    .reverse();
  assert.deepEqual(upward, downward);
  assert.deepEqual(anchors, initial);
  for (const target of downward) {
    assert.ok(target.width > 0 && target.height > 0);
    assert.ok(Object.values(target).every(Number.isFinite));
    assert.ok(target.featured >= 0 && target.featured <= 1);
  }
});

test("El suavizado converge igual a 30, 60 y 120 fps", () => {
  const simulate = (fps) => {
    let position = 0;
    for (let frame = 0; frame < fps; frame += 1)
      position += (100 - position) * dampFactor(4.3, 1 / fps);
    return position;
  };
  assertNear(simulate(30), simulate(60), 0.00001);
  assertNear(simulate(60), simulate(120), 0.00001);
});

test("Las superficies de catálogo, proceso y galería no permiten fuego", () => {
  for (const stage of ["catalog", "customization", "process", "gallery"])
    assert.equal(isFireStage(stage), false);
  for (const stage of ["hero", "study", "contact"])
    assert.equal(isFireStage(stage), true);
});
