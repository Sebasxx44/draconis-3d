"use client";
import Image from "next/image";
import { useDragonExperience } from "@/components/experience/DragonExperienceProviderTA";
import { DragonControlsTA } from "@/components/experience/DragonControlsTA";

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
        onKeyDown={(event) => {
          if (
            (event.key === "Enter" || event.key === " ") &&
            event.target === event.currentTarget
          ) {
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
                ? "Vista conceptual · WebGL no disponible"
                : "Preparando un único vuelo continuo…"}
            </span>
          </div>
        )}
        {unavailable && stage !== "hero" && (
          <p className="experience-unavailable">
            El visor 3D no está disponible en este dispositivo. Puedes explorar
            los renders de la colección.
          </p>
        )}
        {scene.behavior === "hovering" && scene.stage === stage && (
          <span className="experience-hover-hint">
            Haz clic para despertar su carácter
          </span>
        )}
      </div>
      <div className="experience-slot-footer" data-dragon-ui>
        <p>
          {stage === "study"
            ? inspect.enabled
              ? "Arrastra el dragón · Pellizca o usa + / − para acercar"
              : "El mismo dragón. Activa Inspeccionar para rotarlo."
            : "Mueve el cursor. Haz clic sobre el dragón."}
        </p>
        <DragonControlsTA study={stage === "study"} />
        <span className="experience-asset-note">
          Modelo serpentino original · Interpretación provisional
        </span>
        <span className="sr-only" role="status">
          {scene.stage === stage && fire.phase !== "idle"
            ? `Fuego: ${fire.phase === "preparing" ? "preparando" : fire.phase === "breathing" ? "activo" : "en enfriamiento"}`
            : ""}
        </span>
      </div>
    </div>
  );
};
