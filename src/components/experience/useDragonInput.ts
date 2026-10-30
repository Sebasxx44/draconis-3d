"use client";
import { useCallback, useEffect, useState } from "react";
import type { DragonFrameRef } from "@/components/experience/types";

// ─── UI always has priority over raycasting ────────────────────────────────────
export const isInteractiveTarget = (target: EventTarget | null) =>
  Boolean(document.querySelector('[role="dialog"][data-state="open"]')) ||
  (target instanceof Element &&
    Boolean(
      target.closest(
        'a,button,input,textarea,select,[contenteditable="true"],[role="dialog"],[data-dragon-ui],article,.hero-copy,.featured-copy,.contact-copy',
      ),
    ));

export const useDragonInput = (frameRef: DragonFrameRef, roar: () => void) => {
  const [enabled, setEnabled] = useState(false);
  const [zoom, setZoom] = useState(1);
  const toggle = useCallback(() => {
    const next = !frameRef.current.inspect.enabled;
    frameRef.current.inspect.enabled = next;
    setEnabled(next);
    frameRef.current.invalidate?.();
  }, [frameRef]);
  const zoomBy = useCallback(
    (amount: number) => {
      const next = Math.min(
        1.4,
        Math.max(0.75, frameRef.current.inspect.zoom + amount),
      );
      frameRef.current.inspect.zoom = next;
      setZoom(next);
      frameRef.current.invalidate?.();
    },
    [frameRef],
  );
  const reset = useCallback(() => {
    frameRef.current.inspect.yaw = 0;
    frameRef.current.inspect.pitch = 0;
    frameRef.current.inspect.zoom = 1;
    setZoom(1);
    frameRef.current.invalidate?.();
  }, [frameRef]);
  useEffect(() => {
    const pressed = new Map<
      number,
      { x: number; y: number; startX: number; startY: number }
    >();
    let previousX = 0,
      previousY = 0,
      previousAt = 0,
      pinchDistance = 0;
    const move = (event: PointerEvent) => {
      const now = performance.now(),
        dt = Math.max(now - previousAt, 8);
      const current = frameRef.current;
      current.pointer = {
        ...current.pointer,
        x: event.clientX,
        y: event.clientY,
        speed: Math.min(
          8,
          Math.hypot(event.clientX - previousX, event.clientY - previousY) / dt,
        ),
        lastAt: now,
        blocked: isInteractiveTarget(event.target),
      };
      const point = pressed.get(event.pointerId);
      if (
        point &&
        current.inspect.enabled &&
        current.layout.stage === "study"
      ) {
        if (pressed.size === 1) {
          current.inspect.yaw += (event.clientX - point.x) * 0.008;
          current.inspect.pitch = Math.min(
            0.6,
            Math.max(
              -0.5,
              current.inspect.pitch + (event.clientY - point.y) * 0.005,
            ),
          );
        }
        point.x = event.clientX;
        point.y = event.clientY;
        if (pressed.size === 2) {
          const [a, b] = [...pressed.values()];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (pinchDistance) zoomBy((distance - pinchDistance) * 0.004);
          pinchDistance = distance;
        }
        current.inspect.dragging = true;
      }
      previousX = event.clientX;
      previousY = event.clientY;
      previousAt = now;
      current.invalidate?.();
    };
    const down = (event: PointerEvent) => {
      const current = frameRef.current;
      if (
        !current.animation.interactive ||
        isInteractiveTarget(event.target) ||
        !current.hitTest?.(event.clientX, event.clientY)
      )
        return;
      pressed.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
      });
      if (
        current.inspect.enabled &&
        current.layout.stage === "study" &&
        event.target instanceof HTMLElement
      )
        event.target.setPointerCapture(event.pointerId);
    };
    const up = (event: PointerEvent) => {
      const point = pressed.get(event.pointerId);
      if (
        point &&
        Math.hypot(event.clientX - point.startX, event.clientY - point.startY) <
          7 &&
        !isInteractiveTarget(event.target)
      )
        roar();
      pressed.delete(event.pointerId);
      pinchDistance = 0;
      frameRef.current.inspect.dragging = pressed.size > 0;
    };
    const cancel = () => {
      pressed.clear();
      pinchDistance = 0;
      frameRef.current.inspect.dragging = false;
    };
    const wheel = (event: WheelEvent) => {
      const current = frameRef.current;
      if (
        current.inspect.enabled &&
        current.layout.stage === "study" &&
        !isInteractiveTarget(event.target) &&
        current.hitTest?.(event.clientX, event.clientY)
      ) {
        event.preventDefault();
        zoomBy(-event.deltaY * 0.001);
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointercancel", cancel, { passive: true });
    window.addEventListener("blur", cancel);
    window.addEventListener("wheel", wheel, { passive: false });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("wheel", wheel);
    };
  }, [frameRef, roar, zoomBy]);
  return { enabled, zoom, toggle, zoomBy, reset };
};
