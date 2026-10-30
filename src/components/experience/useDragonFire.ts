"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  DragonFrameRef,
  DragonStage,
  FirePhase,
} from "@/components/experience/types";

const COOLDOWN = 9000;

export const useDragonFire = (frameRef: DragonFrameRef) => {
  // ─── State and monotonic cooldown ────────────────────────────────────────────
  const [phase, setPhase] = useState<FirePhase>("idle");
  const [startedAt, setStartedAt] = useState(0);
  const nextAllowed = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const fireAllowed = useCallback(() => {
    const current = frameRef.current;
    return (
      current.hitTest !== null &&
      current.layout.anchors.length > 0 &&
      !current.animation.paused &&
      !current.viewport.reduced &&
      current.viewport.visible &&
      document.visibilityState === "visible" &&
      (current.layout.stage === "hero" || current.layout.stage === "contact") &&
      current.animation.behavior !== "transitioning" &&
      current.animation.behavior !== "idle" &&
      !current.inspect.dragging &&
      !document.querySelector('[role="dialog"][data-state="open"]') &&
      !document.activeElement?.matches(
        'input,textarea,select,[contenteditable="true"]',
      )
    );
  }, [frameRef]);
  // ─── Silent visual actions ───────────────────────────────────────────────────
  const breathe = useCallback(() => {
    const now = performance.now();
    const animation = frameRef.current.animation;
    if (
      now < nextAllowed.current ||
      !fireAllowed() ||
      (animation.roarAt > 0 && now - animation.roarAt < 1800)
    )
      return false;
    nextAllowed.current = now + COOLDOWN;
    animation.fireAt = now;
    setStartedAt(now);
    setPhase("preparing");
    timers.current.forEach(clearTimeout);
    timers.current = [
      setTimeout(() => setPhase("breathing"), 700),
      setTimeout(() => {
        frameRef.current.animation.fireAt = 0;
        setStartedAt(0);
        setPhase("cooldown");
        frameRef.current.invalidate?.();
      }, 3700),
      setTimeout(() => setPhase("idle"), COOLDOWN),
    ];
    frameRef.current.invalidate?.();
    return true;
  }, [frameRef, fireAllowed]);
  const cancel = useCallback(() => {
    frameRef.current.animation.fireAt = 0;
    setStartedAt(0);
    timers.current.forEach(clearTimeout);
    const remaining = Math.max(0, nextAllowed.current - performance.now());
    setPhase(remaining > 0 ? "cooldown" : "idle");
    timers.current =
      remaining > 0 ? [setTimeout(() => setPhase("idle"), remaining)] : [];
    frameRef.current.invalidate?.();
  }, [frameRef]);
  // ─── First encounter, stable framing, then sparse autonomous repeats ──────────
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let stage: DragonStage | null = null;
    let stableSince = performance.now();
    let previousScroll = frameRef.current.viewport.scroll;
    let pendingEncounter = true;
    let repeatAt = 0;
    const interrupt = () => {
      stableSince = performance.now();
      if (frameRef.current.animation.fireAt > 0) {
        pendingEncounter = true;
        cancel();
      }
    };
    const visibilityChanged = () => {
      if (document.visibilityState !== "visible") interrupt();
      else stableSince = performance.now();
    };
    const focusChanged = () => {
      if (!fireAllowed()) interrupt();
    };
    const update = () => {
      const now = performance.now();
      const current = frameRef.current;
      if (stage !== current.layout.stage) {
        stage = current.layout.stage;
        pendingEncounter = true;
        interrupt();
      }
      if (Math.abs(current.viewport.scroll - previousScroll) > 1) interrupt();
      previousScroll = current.viewport.scroll;
      if (!fireAllowed()) {
        interrupt();
      } else if (
        current.animation.fireAt === 0 &&
        now - stableSince >= (stage === "hero" ? 1500 : 1100) &&
        (pendingEncounter || now >= repeatAt) &&
        breathe()
      ) {
        pendingEncounter = false;
        repeatAt = now + 32000 + Math.random() * 13000;
      }
      timer = setTimeout(update, 250);
    };
    timer = setTimeout(update, 250);
    const scrollEvents = frameRef.current.events.scroll;
    scrollEvents.add(interrupt);
    document.addEventListener("visibilitychange", visibilityChanged);
    document.addEventListener("focusin", focusChanged);
    return () => {
      clearTimeout(timer);
      scrollEvents.delete(interrupt);
      document.removeEventListener("visibilitychange", visibilityChanged);
      document.removeEventListener("focusin", focusChanged);
    };
  }, [frameRef, breathe, cancel, fireAllowed]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return { phase, startedAt, breathe, cancel };
};
