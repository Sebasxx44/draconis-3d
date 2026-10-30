"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
import { useDragonAudio } from "@/components/experience/useDragonAudio";
import { DragonControlsTA } from "@/components/experience/DragonControlsTA";
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
  const audio = useDragonAudio();
  const { stop, play } = audio;
  const { playback, viewport } = useDragonPlayback(frame, audio.stop);
  const stage = useDragonScrollDirector(frame);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [behavior, setBehavior] = useState<DragonBehavior>("idle");
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => {
    setFailed(true);
    stop();
  }, [stop]);
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
    play("roar");
    frame.current.invalidate?.();
  }, [play]);
  const inspect = useDragonInput(frame, roar);
  const fireController = useDragonFire(frame, audio.play);
  const { cancel } = fireController;
  useEffect(() => {
    if (playback.paused || !viewport.visible || !isFireStage(stage)) cancel();
  }, [playback.paused, viewport.visible, stage, cancel]);
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
    fire: {
      ...fireController,
      canFire:
        ready &&
        !failed &&
        !playback.paused &&
        isFireStage(stage) &&
        behavior !== "transitioning" &&
        fireController.phase === "idle",
    },
    audio,
    inspect,
  };
  const ambient = !isFireStage(stage);
  const status = useMemo(
    () =>
      ({
        hero: "En vuelo",
        catalog: "Sobre la colección",
        study: "Estudio de Caraxes",
        customization: "Entre acabados",
        process: "Del modelo a tus manos",
        gallery: "Sobre la galería",
        contact: "Tu próxima leyenda",
      })[stage],
    [stage],
  );
  return (
    <ExperienceContext.Provider value={value}>
      {children}
      {viewport.mounted && !failed && <PersistentCanvas />}
      <aside
        className={`experience-dock ${ambient ? "is-ambient" : ""}`}
        data-dragon-ui
        aria-label="Control de la experiencia persistente"
      >
        <span>
          <i />
          {status}
        </span>
        <DragonControlsTA compact />
        <a href="#caraxes" className="experience-inspect-link">
          Inspeccionar ↗
        </a>
      </aside>
    </ExperienceContext.Provider>
  );
};
