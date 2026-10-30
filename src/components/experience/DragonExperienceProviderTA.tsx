"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import {
  createDragonFrame,
  type DragonBehavior,
  type DragonExperience,
} from "@/components/experience/types";
import { useDragonScrollDirector } from "@/components/experience/useDragonScrollDirector";
import { useDragonPlayback } from "@/components/experience/useDragonPlayback";
import { useDragonInput } from "@/components/experience/useDragonInput";
import { useDragonFire } from "@/components/experience/useDragonFire";
import { isFireStage } from "@/components/experience/flight-math";
import "@/components/experience/experience.css";

// ─── Single persistent scene ──────────────────────────────────────────────────
const PersistentCanvas = dynamic(
  () => import("@/components/experience/PersistentDragonCanvasTA"),
  { ssr: false },
);
const ExperienceContext = createContext<DragonExperience | null>(null);
export const useDragonExperience = (): DragonExperience => {
  const value = useContext(ExperienceContext);
  if (!value) throw new Error("DragonExperienceProviderTA is required");
  return value;
};

export const DragonExperienceProviderTA = ({
  children,
}: {
  children: ReactNode;
}) => {
  // ─── Scene and responsibility-specific controllers ───────────────────────────
  const frame = useRef(createDragonFrame());
  const { playback, viewport } = useDragonPlayback(frame);
  const stage = useDragonScrollDirector(frame);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [behavior, setBehavior] = useState<DragonBehavior>("idle");
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => setFailed(true), []);
  const reportBehavior = useCallback(
    (next: DragonBehavior) =>
      setBehavior((current) => (current === next ? current : next)),
    [],
  );
  const roar = useCallback(() => {
    if (
      frame.current.animation.paused ||
      !frame.current.animation.interactive ||
      performance.now() - frame.current.animation.roarAt < 1800
    )
      return;
    frame.current.animation.roarAt = performance.now();
    frame.current.invalidate?.();
  }, []);
  const inspect = useDragonInput(frame, roar);
  const fireController = useDragonFire(frame);
  const { cancel } = fireController;
  useEffect(() => {
    if (failed || playback.paused || !viewport.visible || !isFireStage(stage)) cancel();
  }, [failed, playback.paused, viewport.visible, stage, cancel]);
  // ─── Context ────────────────────────────────────────────────────────────────
  const value: DragonExperience = {
    frame,
    scene: {
      ready,
      failed,
      stage,
      behavior,
      reduced: viewport.reduced,
      visible: viewport.visible,
      onReady,
      onFailure,
      reportBehavior,
    },
    playback: { ...playback, roar },
    fire: fireController,
    inspect,
  };
  return (
    <ExperienceContext.Provider value={value}>
      {children}
      {viewport.mounted && !failed && <PersistentCanvas />}
    </ExperienceContext.Provider>
  );
};
