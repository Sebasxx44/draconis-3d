// ─── Types ─────────────────────────────────────────────────────────────────────
export type DragonVariant = "hero" | "detail";
export type FirePhase = "idle" | "preparing" | "breathing" | "cooldown";

export interface DragonExperienceProps {
  variant?: DragonVariant;
  className?: string;
}

export interface DragonController {
  viewport: {
    visible: boolean;
    reducedMotion: boolean;
    webglAvailable: boolean | null;
  };
  animation: {
    paused: boolean;
    interactive: boolean;
    togglePaused: () => void;
    toggleInteractive: () => void;
  };
  fire: {
    phase: FirePhase;
    startedAt: number;
    breathe: () => void;
  };
  sound: {
    enabled: boolean;
    toggle: () => void;
  };
}

export interface DragonSceneProps {
  variant: DragonVariant;
  active: boolean;
  paused: boolean;
  reducedMotion: boolean;
  interactive: boolean;
  fireStartedAt: number;
  onReact: () => void;
  onReady: () => void;
  onFailure: () => void;
}
