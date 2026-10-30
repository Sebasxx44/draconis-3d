import { CatmullRomCurve3, Vector3, MathUtils } from "three";
import type { FlightAnchor, FlightTarget } from "@/components/experience/types";

// ─── Continuous bidirectional route ───────────────────────────────────────────
export const getFlightTarget = (
  anchors: FlightAnchor[],
  scroll: number,
): FlightTarget => {
  if (!anchors.length)
    return {
      x: 1000,
      y: 380,
      width: 560,
      height: 400,
      featured: 1,
      yaw: -0.16,
      bank: -0.04,
    };
  let segment = anchors.findIndex(
    (anchor, index) =>
      index < anchors.length - 1 && scroll < anchors[index + 1].at,
  );
  if (segment < 0) segment = anchors.length - 1;
  const start = anchors[segment];
  const end = anchors[Math.min(segment + 1, anchors.length - 1)];
  const fraction = MathUtils.clamp(
    (scroll - start.at) / Math.max(end.at - start.at, 1),
    0,
    1,
  );
  const t = fraction * fraction * (3 - 2 * fraction);
  const previous = anchors[Math.max(segment - 1, 0)];
  const after = anchors[Math.min(segment + 2, anchors.length - 1)];
  const curve = new CatmullRomCurve3(
    [previous, start, end, after].map(
      (anchor) => new Vector3(anchor.x, anchor.y, 0),
    ),
    false,
    "catmullrom",
    0.35,
  );
  const point = curve.getPoint((1 + t) / 3);
  return {
    x: point.x,
    y: point.y,
    width: MathUtils.lerp(start.width, end.width, t),
    height: MathUtils.lerp(start.height, end.height, t),
    featured: MathUtils.lerp(Number(start.featured), Number(end.featured), t),
    yaw: MathUtils.lerp(
      start.stage === "study" ? -0.12 : -0.28,
      end.stage === "study" ? -0.12 : -0.28,
      t,
    ),
    bank: Math.sin(t * Math.PI) * (end.x > start.x ? -0.13 : 0.13),
  };
};

export const isFireStage = (stage: string) =>
  stage === "hero" || stage === "study" || stage === "contact";
export const dampFactor = (speed: number, delta: number) =>
  1 - Math.exp(-speed * Math.min(delta, 0.05));
