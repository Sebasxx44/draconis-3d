"use client";
import {
  Flame,
  Hand,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react";
import { useDragonExperience } from "@/components/experience/DragonExperienceProviderTA";

// ─── Shared controls; never create a scene ──────────────────────────────────────
export const DragonControlsTA = ({
  compact = false,
  study = false,
}: {
  compact?: boolean;
  study?: boolean;
}) => {
  const { scene, playback, fire, audio, inspect } = useDragonExperience();
  const disabled = !scene.ready || scene.failed;
  const fireLabel = {
    idle: "Escupir fuego",
    preparing: "Preparando…",
    breathing: "Dracarys",
    cooldown: "Recargando…",
  }[fire.phase];
  return (
    <div
      className={`experience-controls ${compact ? "is-compact" : ""}`}
      data-dragon-ui
      aria-label="Controles de Caraxes"
    >
      {!compact && (
        <>
          <button
            type="button"
            onClick={study ? inspect.toggle : playback.toggleInteraction}
            disabled={disabled}
            aria-pressed={study ? inspect.enabled : playback.interactive}
            title={
              study
                ? "Activar rotación táctil y zoom"
                : "Activar respuesta al cursor"
            }
          >
            <Hand size={15} />
            <span>{study ? "Inspeccionar" : "Interactuar"}</span>
          </button>
          <button
            type="button"
            className="experience-fire"
            onClick={fire.breathe}
            disabled={!fire.canFire}
          >
            <Flame size={15} />
            <span>{fireLabel}</span>
          </button>
        </>
      )}
      <button
        type="button"
        onClick={playback.togglePause}
        disabled={disabled}
        aria-label={playback.paused ? "Reanudar animación" : "Pausar animación"}
        title={playback.paused ? "Reanudar animación" : "Pausar animación"}
      >
        {playback.paused ? <Play size={15} /> : <Pause size={15} />}
      </button>
      <button
        type="button"
        onClick={audio.toggle}
        disabled={disabled}
        aria-pressed={audio.enabled}
        aria-label={audio.enabled ? "Desactivar sonido" : "Activar sonido"}
        title={audio.enabled ? "Desactivar sonido" : "Activar sonido"}
      >
        {audio.enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
      </button>
      {study && inspect.enabled && (
        <>
          <button
            type="button"
            onClick={() => inspect.zoomBy(-0.1)}
            aria-label="Alejar dragón"
            disabled={inspect.zoom <= 0.75}
          >
            <Minus size={15} />
          </button>
          <button
            type="button"
            onClick={() => inspect.zoomBy(0.1)}
            aria-label="Acercar dragón"
            disabled={inspect.zoom >= 1.4}
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            onClick={inspect.reset}
            aria-label="Restablecer vista"
          >
            <RotateCcw size={15} />
          </button>
        </>
      )}
    </div>
  );
};
