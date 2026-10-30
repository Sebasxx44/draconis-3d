"use client";
import { useEffect, useState } from "react";
import type {
  DragonFrameRef,
  DragonStage,
  FlightAnchor,
} from "@/components/experience/types";

// ─── Section definitions ──────────────────────────────────────────────────────
const sections: readonly { id: string; stage: DragonStage }[] = [
  { id: "inicio", stage: "hero" },
  { id: "dragones", stage: "catalog" },
  { id: "caraxes", stage: "study" },
  { id: "personalizacion", stage: "customization" },
  { id: "proceso", stage: "process" },
  { id: "galeria", stage: "gallery" },
  { id: "contacto", stage: "contact" },
];

// ─── One scroll listener, cached layout, native scrolling ──────────────────────
export const useDragonScrollDirector = (frameRef: DragonFrameRef) => {
  const [stage, setStage] = useState<DragonStage>("hero");
  useEffect(() => {
    let scheduled = 0;
    let previous = "hero";
    let measures: { top: number; bottom: number; stage: DragonStage }[] = [];
    const update = () => {
      scheduled = 0;
      const scroll = window.scrollY;
      frameRef.current.viewport.scroll = scroll;
      const focal = scroll + innerHeight * 0.46;
      const current =
        measures.find((item) => focal >= item.top && focal < item.bottom)
          ?.stage ?? (focal < (measures[0]?.top ?? 0) ? "hero" : "contact");
      frameRef.current.layout.stage = current;
      if (current !== previous) {
        previous = current;
        setStage(current);
      }
      frameRef.current.invalidate?.();
    };
    const schedule = () => {
      if (!scheduled) scheduled = requestAnimationFrame(update);
    };
    const scrolled = () => {
      frameRef.current.events.scroll.forEach((listener) => listener());
      schedule();
    };
    const measure = () => {
      const width = document.documentElement.clientWidth;
      const height = innerHeight;
      frameRef.current.viewport.width = width;
      frameRef.current.viewport.height = height;
      const gutter = Math.max(0, (width - 1320) / 2);
      const mobile = width < 760;
      const ambientX = width - gutter - (mobile ? 20 : 70);
      const ambientWidth = mobile ? 88 : 145;
      const anchors: FlightAnchor[] = [];
      measures = [];
      sections.forEach(({ id, stage: sectionStage }) => {
        const element = document.getElementById(id);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const bottom = top + rect.height;
        measures.push({ top, bottom, stage: sectionStage });
        const slot = element.querySelector<HTMLElement>("[data-dragon-slot]");
        if (slot) {
          const box = slot.getBoundingClientRect();
          const center = box.top + window.scrollY + box.height / 2;
          const at =
            sectionStage === "hero"
              ? Math.max(0, center - height * 0.5)
              : Math.max(0, center - height * 0.47);
          const y =
            sectionStage === "hero" && at === 0
              ? center
              : height * (sectionStage === "hero" ? 0.5 : 0.47);
          if (sectionStage === "hero" && at > 0)
            anchors.push({
              stage: sectionStage,
              at: 0,
              x: box.left + box.width / 2,
              y: center,
              width: box.width * 0.96,
              height: box.height * 0.91,
              featured: true,
            });
          if (sectionStage !== "hero")
            anchors.push({
              stage: sectionStage,
              at: Math.max(0, center - height * 0.72),
              x: box.left + box.width / 2,
              y: Math.min(center, height * 0.72),
              width: box.width * 0.96,
              height: box.height * 0.91,
              featured: true,
            });
          anchors.push({
            stage: sectionStage,
            at,
            x: box.left + box.width / 2,
            y,
            width: box.width * 0.96,
            height: box.height * 0.91,
            featured: true,
          });
          if (sectionStage !== "hero")
            anchors.push({
              stage: sectionStage,
              at: Math.max(at + 1, center - height * 0.18),
              x: box.left + box.width / 2,
              y: height * 0.18,
              width: box.width * 0.96,
              height: box.height * 0.91,
              featured: true,
            });
          if (sectionStage === "hero")
            anchors.push({
              stage: sectionStage,
              at: at + Math.min(140, height * 0.18),
              x: box.left + box.width / 2,
              y: y - Math.min(140, height * 0.18),
              width: box.width * 0.86,
              height: box.height * 0.85,
              featured: true,
            });
        } else {
          const at = Math.max(0, top - height * 0.18);
          anchors.push({
            stage: sectionStage,
            at,
            x: ambientX,
            y: height * 0.27,
            width: ambientWidth,
            height: ambientWidth * 0.75,
            featured: false,
          });
          anchors.push({
            stage: sectionStage,
            at: Math.max(at + 1, bottom - height * 0.72),
            x: ambientX - 14,
            y: height * 0.47,
            width: ambientWidth * 0.88,
            height: ambientWidth * 0.7,
            featured: false,
          });
        }
      });
      anchors.sort((a, b) => a.at - b.at);
      frameRef.current.layout.anchors = anchors;
      frameRef.current.layout.version += 1;
      update();
    };
    const observer = new ResizeObserver(measure);
    sections.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    window.addEventListener("scroll", scrolled, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    measure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(scheduled);
      window.removeEventListener("scroll", scrolled);
      window.removeEventListener("resize", measure);
    };
  }, [frameRef]);
  return stage;
};
