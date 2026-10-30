"use client";
import Image from "next/image";
import { useDragonExperience } from "@/components/experience/DragonExperienceProviderTA";

export const DragonSlotTA = ({
  stage,
}: {
  stage: "hero" | "study" | "contact";
}) => {
  const { scene, inspect, fire, playback } = useDragonExperience();
  const unavailable = scene.failed;
  return (
    <div className={`experience-slot-wrap experience-slot-wrap--${stage}`}>
      <div
        className={`experience-slot ${stage === "study" && inspect.enabled ? "is-inspecting" : ""}`}
        data-dragon-slot={stage}
        role="group"
        aria-label={
          stage === "study"
            ? "Estudio del mismo dragón 3D"
            : "Espacio de vuelo de Caraxes"
        }
        tabIndex={scene.ready ? 0 : undefined}
        aria-describedby={`dragon-keyboard-${stage}`}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget || event.repeat) return;
          if (event.key === " ") {
            event.preventDefault();
            playback.togglePause();
          } else if (event.key === "Enter") {
            event.preventDefault();
            playback.roar();
          }
        }}
      >
        {(!scene.ready || unavailable) && stage === "hero" && (
          <div className="experience-fallback">
            <Image
              src="/images/caraxes-v2.png"
              alt="Interpretación conceptual de Caraxes; vista alternativa al modelo interactivo"
              fill
              priority
              sizes="(max-width:760px) 95vw, 50vw"
            />
            <span>
              {unavailable
                ? "Vista conceptual · Experiencia 3D no disponible"
                : "Preparando un único vuelo continuo…"}
            </span>
          </div>
        )}
        {unavailable && stage !== "hero" && (
          <p className="experience-unavailable">
            La experiencia 3D no está disponible. Puedes explorar los renders
            de la colección.
          </p>
        )}
      </div>
      <div className="experience-slot-footer" data-dragon-ui>
        <span className="experience-asset-note">
          Modelo serpentino original · Interpretación provisional
        </span>
        <span className="sr-only" id={`dragon-keyboard-${stage}`}>
          Caraxes responde al cursor y al contacto. Espacio pausa o reanuda el
          vuelo. Intro activa su reacción. Se respeta la reducción de movimiento
          del dispositivo.
        </span>
        <span className="sr-only" role="status">
          {playback.paused ? "Vuelo en pausa" : scene.stage === stage && fire.phase !== "idle"
            ? `Fuego: ${fire.phase === "preparing" ? "preparando" : fire.phase === "breathing" ? "activo" : "en enfriamiento"}`
            : ""}
        </span>
      </div>
    </div>
  );
};
