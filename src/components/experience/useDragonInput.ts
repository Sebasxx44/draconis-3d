"use client";
import { useEffect, useState } from "react";
import type { DragonFrameRef, DragonStage } from "@/components/experience/types";

// ─── UI always has priority over raycasting ────────────────────────────────────
export const isInteractiveTarget = (target: EventTarget | null) =>
  Boolean(document.querySelector('[role="dialog"][data-state="open"]')) ||
  (target instanceof Element &&
    Boolean(
      target.closest(
        'a,button,input,textarea,select,[contenteditable="true"],[role="dialog"],[data-dragon-ui],article,.hero-copy,.featured-copy,.contact-copy',
      ),
    ));

type DragonPress = {
  id: number;
  pointerType: string;
  stage: DragonStage;
  x: number;
  y: number;
  startX: number;
  startY: number;
  dragged: boolean;
};

export const useDragonInput = (frameRef: DragonFrameRef, roar: () => void) => {
  // ─── A gesture temporarily yields autonomous flight to the visitor ────────────
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let pressed: DragonPress | null = null;
    let releaseTimer: ReturnType<typeof setTimeout> | undefined;
    let previousX = 0,
      previousY = 0,
      previousAt = 0;
    const canInteract = () => {
      const current = frameRef.current;
      return (
        current.animation.interactive &&
        !current.animation.paused &&
        !current.viewport.reduced &&
        current.viewport.visible &&
        document.visibilityState === "visible"
      );
    };
    const release = () => {
      clearTimeout(releaseTimer);
      const current = frameRef.current;
      current.inspect.enabled = false;
      current.inspect.dragging = false;
      current.inspect.yaw = 0;
      current.inspect.pitch = 0;
      current.inspect.zoom = 1;
      setEnabled(false);
      current.invalidate?.();
    };
    const cancel = () => {
      pressed = null;
      release();
    };
    // ─── Pointer observation never takes ownership of native scrolling ──────────
    const move = (event: PointerEvent) => {
      const now = performance.now();
      const current = frameRef.current;
      const blocked =
        !canInteract() ||
        event.pointerType === "touch" ||
        isInteractiveTarget(event.target);
      current.pointer = {
        ...current.pointer,
        x: event.clientX,
        y: event.clientY,
        speed: previousAt
          ? Math.min(
              8,
              Math.hypot(event.clientX - previousX, event.clientY - previousY) /
                Math.max(now - previousAt, 8),
            )
          : 0,
        lastAt: now,
        blocked,
      };
      if (pressed?.id === event.pointerId) {
        if (
          !canInteract() ||
          isInteractiveTarget(event.target) ||
          current.layout.stage !== pressed.stage
        ) {
          cancel();
        } else {
          const distance = Math.hypot(
            event.clientX - pressed.startX,
            event.clientY - pressed.startY,
          );
          pressed.dragged ||= distance >= 7;
          if (
            pressed.dragged &&
            pressed.pointerType !== "touch" &&
            current.layout.stage === "study"
          ) {
            clearTimeout(releaseTimer);
            current.inspect.enabled = true;
            current.inspect.dragging = true;
            current.inspect.yaw = Math.min(
              Math.PI,
              Math.max(
                -Math.PI,
                current.inspect.yaw + (event.clientX - pressed.x) * 0.008,
              ),
            );
            current.inspect.pitch = Math.min(
              0.45,
              Math.max(
                -0.4,
                current.inspect.pitch + (event.clientY - pressed.y) * 0.005,
              ),
            );
            setEnabled(true);
          }
          pressed.x = event.clientX;
          pressed.y = event.clientY;
        }
      }
      previousX = event.clientX;
      previousY = event.clientY;
      previousAt = now;
      current.invalidate?.();
    };
    const down = (event: PointerEvent) => {
      if (!event.isPrimary) {
        cancel();
        return;
      }
      const current = frameRef.current;
      if (
        event.button !== 0 ||
        !canInteract() ||
        isInteractiveTarget(event.target) ||
        !current.hitTest?.(event.clientX, event.clientY)
      )
        return;
      clearTimeout(releaseTimer);
      pressed = {
        id: event.pointerId,
        pointerType: event.pointerType,
        stage: current.layout.stage,
        x: event.clientX,
        y: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
        dragged: false,
      };
    };
    const up = (event: PointerEvent) => {
      if (pressed?.id !== event.pointerId) return;
      const current = frameRef.current;
      if (
        !pressed.dragged &&
        Math.hypot(event.clientX - pressed.startX, event.clientY - pressed.startY) <
          7 &&
        canInteract() &&
        current.layout.stage === pressed.stage &&
        !isInteractiveTarget(event.target) &&
        current.hitTest?.(event.clientX, event.clientY)
      )
        roar();
      pressed = null;
      current.inspect.dragging = false;
      if (current.inspect.enabled) releaseTimer = setTimeout(release, 1800);
    };
    const visibilityChanged = () => {
      if (document.visibilityState !== "visible") cancel();
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointercancel", cancel, { passive: true });
    const scrollEvents = frameRef.current.events.scroll;
    scrollEvents.add(cancel);
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      clearTimeout(releaseTimer);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      scrollEvents.delete(cancel);
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, [frameRef, roar]);
  return { enabled };
};
