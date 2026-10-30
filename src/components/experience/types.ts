import type { MutableRefObject } from "react";

// ─── Scene contracts ──────────────────────────────────────────────────────────
export type DragonStage =
  | "hero"
  | "catalog"
  | "study"
  | "customization"
  | "process"
  | "gallery"
  | "contact";
export type DragonBehavior =
  | "idle"
  | "flying"
  | "following-cursor"
  | "hovering"
  | "roaring"
  | "breathing-fire"
  | "inspecting"
  | "transitioning";
export type FirePhase = "idle" | "preparing" | "breathing" | "cooldown";
export interface FlightAnchor {
  stage: DragonStage;
  at: number;
  x: number;
  y: number;
  width: number;
  height: number;
  featured: boolean;
}
export interface FlightTarget {
  x: number;
  y: number;
  width: number;
  height: number;
  featured: number;
  yaw: number;
  bank: number;
}
export interface DragonFrame {
  viewport: {
    width: number;
    height: number;
    scroll: number;
    visible: boolean;
    reduced: boolean;
  };
  layout: { anchors: FlightAnchor[]; stage: DragonStage; version: number };
  pointer: {
    x: number;
    y: number;
    speed: number;
    lastAt: number;
    blocked: boolean;
    hovered: boolean;
  };
  inspect: {
    enabled: boolean;
    yaw: number;
    pitch: number;
    zoom: number;
    dragging: boolean;
  };
  animation: {
    paused: boolean;
    interactive: boolean;
    roarAt: number;
    fireAt: number;
    behavior: DragonBehavior;
  };
  hitTest: ((x: number, y: number) => boolean) | null;
  invalidate: (() => void) | null;
}
export type DragonFrameRef = MutableRefObject<DragonFrame>;

// ─── Public API, grouped by responsibility ─────────────────────────────────────
export interface DragonExperience {
  frame: DragonFrameRef;
  scene: {
    ready: boolean;
    failed: boolean;
    stage: DragonStage;
    behavior: DragonBehavior;
    reduced: boolean;
    visible: boolean;
    onReady: () => void;
    onFailure: () => void;
    reportBehavior: (value: DragonBehavior) => void;
  };
  playback: {
    paused: boolean;
    interactive: boolean;
    togglePause: () => void;
    toggleInteraction: () => void;
    roar: () => void;
  };
  fire: {
    phase: FirePhase;
    startedAt: number;
    canFire: boolean;
    breathe: () => void;
    cancel: () => void;
  };
  audio: {
    enabled: boolean;
    toggle: () => void;
    play: (kind: "roar" | "fire") => void;
    stop: () => void;
  };
  inspect: {
    enabled: boolean;
    zoom: number;
    toggle: () => void;
    zoomBy: (amount: number) => void;
    reset: () => void;
  };
}

export const createDragonFrame = (): DragonFrame => ({
  viewport: {
    width: 1440,
    height: 900,
    scroll: 0,
    visible: true,
    reduced: false,
  },
  layout: { anchors: [], stage: "hero", version: 0 },
  pointer: { x: 0, y: 0, speed: 0, lastAt: 0, blocked: false, hovered: false },
  inspect: { enabled: false, yaw: 0, pitch: 0, zoom: 1, dragging: false },
  animation: {
    paused: false,
    interactive: true,
    roarAt: 0,
    fireAt: 0,
    behavior: "idle",
  },
  hitTest: null,
  invalidate: null,
});
