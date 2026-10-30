"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { isFireStage } from "@/components/experience/flight-math";
import type { DragonFrameRef, FirePhase } from "@/components/experience/types";

const COOLDOWN = 9000;

export const useDragonFire = (
  frameRef: DragonFrameRef,
  play: (kind: "fire" | "roar") => void,
) => {
  // ─── State and monotonic cooldown ────────────────────────────────────────────
  const [phase, setPhase] = useState<FirePhase>("idle");
  const [startedAt, setStartedAt] = useState(0);
  const nextAllowed = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const fireAllowed = useCallback(() => {
    const current = frameRef.current;
    return (
      !current.animation.paused &&
      current.viewport.visible &&
      isFireStage(current.layout.stage) &&
      current.animation.behavior !== "transitioning" &&
      !document.querySelector('[role="dialog"][data-state="open"]') &&
      !document.activeElement?.matches(
        'input,textarea,select,[contenteditable="true"]',
      )
    );
  }, [frameRef]);
  // ─── Actions ────────────────────────────────────────────────────────────────
  const breathe = useCallback(() => {
    const now = performance.now();
    if (now < nextAllowed.current || !fireAllowed()) return;
    nextAllowed.current = now + COOLDOWN;
    frameRef.current.animation.fireAt = now;
    setStartedAt(now);
    setPhase("preparing");
    play("fire");
    timers.current.forEach(clearTimeout);
    timers.current = [
      setTimeout(() => setPhase("breathing"), 700),
      setTimeout(() => setPhase("cooldown"), 3700),
      setTimeout(() => setPhase("idle"), COOLDOWN),
    ];
    frameRef.current.invalidate?.();
  }, [frameRef, fireAllowed, play]);
  const cancel = useCallback(() => {
    frameRef.current.animation.fireAt = 0;
    setStartedAt(0);
    timers.current.forEach(clearTimeout);
    const remaining = Math.max(0, nextAllowed.current - performance.now());
    setPhase(remaining > 0 ? "cooldown" : "idle");
    timers.current =
      remaining > 0 ? [setTimeout(() => setPhase("idle"), remaining)] : [];
  }, [frameRef]);
  // ─── Sparse automatic events ─────────────────────────────────────────────────
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(
        () => {
          const current = frameRef.current;
          if (
            !current.viewport.reduced &&
            current.layout.stage !== "study" &&
            !current.pointer.blocked &&
            !current.inspect.enabled
          )
            breathe();
          schedule();
        },
        24000 + Math.random() * 21000,
      );
    };
    schedule();
    return () => clearTimeout(timer);
  }, [frameRef, breathe]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return { phase, startedAt, breathe, cancel };
};
