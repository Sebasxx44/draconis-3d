"use client";
import { useCallback, useEffect, useState } from "react";
import type { DragonFrameRef } from "@/components/experience/types";

export const useDragonPlayback = (
  frameRef: DragonFrameRef,
  stopAudio: () => void,
) => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [paused, setPaused] = useState(false);
  const [interactive, setInteractive] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  // ─── Actions ────────────────────────────────────────────────────────────────
  const togglePause = useCallback(() => {
    const next = !frameRef.current.animation.paused;
    frameRef.current.animation.paused = next;
    setPaused(next);
    if (next) stopAudio();
    frameRef.current.invalidate?.();
  }, [frameRef, stopAudio]);
  const toggleInteraction = useCallback(() => {
    const next = !frameRef.current.animation.interactive;
    frameRef.current.animation.interactive = next;
    setInteractive(next);
    frameRef.current.invalidate?.();
  }, [frameRef]);
  // ─── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const motionChanged = () => {
      frameRef.current.viewport.reduced = preference.matches;
      frameRef.current.animation.paused = preference.matches;
      setReduced(preference.matches);
      setPaused(preference.matches);
    };
    const visibilityChanged = () => {
      const active = document.visibilityState === "visible";
      frameRef.current.viewport.visible = active;
      setVisible(active);
      if (!active) stopAudio();
      else frameRef.current.invalidate?.();
    };
    const initialFrame = requestAnimationFrame(() => {
      motionChanged();
      visibilityChanged();
      setMounted(true);
    });
    preference.addEventListener("change", motionChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      cancelAnimationFrame(initialFrame);
      preference.removeEventListener("change", motionChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, [frameRef, stopAudio]);
  return {
    playback: { paused, interactive, togglePause, toggleInteraction },
    viewport: { reduced, visible, mounted },
  };
};
