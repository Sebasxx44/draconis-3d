"use client";

import {
  Component,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Flame, Hand, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useDragonController } from "@/hooks/use-dragon-controller";
import type {
  DragonExperienceProps,
  FirePhase,
} from "@/components/dragon-3d/types";
import "@/components/dragon-3d/dragon.css";

// ─── Constants ─────────────────────────────────────────────────────────────────
const DragonSceneTA = dynamic(
  () => import("@/components/dragon-3d/DragonSceneTA"),
  { ssr: false },
);
const fireLabels: Record<FirePhase, string> = {
  idle: "Escupir fuego",
  preparing: "Preparando…",
  breathing: "Dracarys",
  cooldown: "Recargando…",
};

// ─── Error boundary ────────────────────────────────────────────────────────────
interface BoundaryProps {
  children: ReactNode;
  onFailure: () => void;
}
class SceneBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError = () => ({ failed: true });
  componentDidCatch = () => this.props.onFailure();
  render = () => (this.state.failed ? null : this.props.children);
}

// ─── Component ─────────────────────────────────────────────────────────────────
const DragonExperienceTA = ({
  variant = "hero",
  className = "",
}: DragonExperienceProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewport, animation, fire, sound } =
    useDragonController(containerRef);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => setFailed(true), []);
  const unavailable = viewport.webglAvailable === false || failed;
  const canLoad =
    viewport.webglAvailable && (viewport.visible || ready) && !failed;
  const controlDisabled = unavailable || !ready;

  return (
    <div
      ref={containerRef}
      className={`dragon-experience dragon-experience--${variant} ${className}`}
      role="group"
      aria-label={
        variant === "detail"
          ? "Visor interactivo de dragón 3D"
          : "Experiencia Caraxes en 3D"
      }
    >
      <div className="dragon-ambient" aria-hidden="true" />
      {(!ready || unavailable) && (
        <div className="dragon-fallback">
          <Image
            src="/images/caraxes.png"
            alt="Interpretación conceptual de un dragón rojo serpentino"
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            className="dragon-fallback-image"
            priority={variant === "hero"}
          />
          <span className="dragon-fallback-label">
            {unavailable
              ? "Vista conceptual · 3D no disponible en este dispositivo"
              : "Preparando el vuelo…"}
          </span>
        </div>
      )}
      {canLoad && (
        <div className={`dragon-canvas ${ready ? "dragon-canvas--ready" : ""}`}>
          <SceneBoundary onFailure={onFailure}>
            <DragonSceneTA
              variant={variant}
              active={viewport.visible}
              paused={animation.paused}
              reducedMotion={viewport.reducedMotion}
              interactive={animation.interactive}
              fireStartedAt={fire.startedAt}
              onReact={fire.breathe}
              onReady={onReady}
              onFailure={onFailure}
            />
          </SceneBoundary>
        </div>
      )}
      <div className="dragon-scene-caption" aria-hidden="true">
        <span>01 / CARAXES</span>
        <span>ESTUDIO DE VUELO</span>
      </div>
      <div className="dragon-interface">
        <p className="dragon-hint">
          {variant === "detail"
            ? "Arrastra para rotar · Desliza con dos dedos para acercar"
            : "Mueve el cursor para interactuar con Caraxes."}
        </p>
        <div className="dragon-controls" aria-label="Controles del dragón">
          <button
            type="button"
            className={
              animation.interactive
                ? "dragon-control is-active"
                : "dragon-control"
            }
            onClick={animation.toggleInteractive}
            disabled={controlDisabled}
            aria-pressed={animation.interactive}
            title="Interactuar con Caraxes"
          >
            <Hand size={16} />
            <span>Interactuar</span>
          </button>
          <button
            type="button"
            className="dragon-control dragon-fire-button"
            onClick={fire.breathe}
            disabled={
              controlDisabled || animation.paused || fire.phase !== "idle"
            }
            title={fireLabels[fire.phase]}
          >
            <Flame size={16} />
            <span>{fireLabels[fire.phase]}</span>
          </button>
          <span className="dragon-controls-divider" aria-hidden="true" />
          <button
            type="button"
            className="dragon-control dragon-control--icon"
            onClick={animation.togglePaused}
            disabled={controlDisabled}
            aria-label={
              animation.paused ? "Reanudar animación" : "Pausar animación"
            }
            title={animation.paused ? "Reanudar animación" : "Pausar animación"}
          >
            {animation.paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <button
            type="button"
            className="dragon-control dragon-control--icon"
            onClick={sound.toggle}
            disabled={controlDisabled}
            aria-label={sound.enabled ? "Desactivar sonido" : "Activar sonido"}
            aria-pressed={sound.enabled}
            title={sound.enabled ? "Desactivar sonido" : "Activar sonido"}
          >
            {sound.enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
        <span className="dragon-model-note">
          Modelo original provisional · Sin afiliación oficial
        </span>
        <span role="status" className="dragon-sr-only">
          {fire.phase === "preparing"
            ? "Caraxes prepara su aliento de fuego"
            : fire.phase === "breathing"
              ? "Caraxes está escupiendo fuego"
              : fire.phase === "cooldown"
                ? "El fuego se está recargando"
                : ""}
        </span>
      </div>
    </div>
  );
};

export default DragonExperienceTA;
