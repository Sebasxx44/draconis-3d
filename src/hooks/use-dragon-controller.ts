"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { DragonController, FirePhase } from "@/components/dragon-3d/types";

// ─── Constants ─────────────────────────────────────────────────────────────────
const FIRE_COOLDOWN = 6500;

// ─── Composable ────────────────────────────────────────────────────────────────
export const useDragonController = (
  container: RefObject<HTMLDivElement | null>,
): DragonController => {
  // ─── Refs and state ──────────────────────────────────────────────────────────
  const context = useRef<AudioContext | null>(null);
  const masterGain = useRef<GainNode | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const latestFire = useRef(-FIRE_COOLDOWN);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);
  const [paused, setPaused] = useState(false);
  const [interactive, setInteractive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [phase, setPhase] = useState<FirePhase>("idle");
  const [startedAt, setStartedAt] = useState(0);

  // ─── Actions ────────────────────────────────────────────────────────────────
  const playBreath = useCallback(() => {
    const audio = context.current;
    const master = masterGain.current;
    if (!audio || !master || !soundEnabled) return;
    void audio.resume();
    const duration = 1.8;
    const buffer = audio.createBuffer(
      1,
      audio.sampleRate * duration,
      audio.sampleRate,
    );
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i += 1) {
      samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length);
    }
    const source = audio.createBufferSource();
    source.buffer = buffer;
    const filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(160, audio.currentTime);
    filter.frequency.exponentialRampToValueAtTime(900, audio.currentTime + 0.6);
    filter.frequency.exponentialRampToValueAtTime(
      90,
      audio.currentTime + duration,
    );
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0, audio.currentTime);
    gain.gain.linearRampToValueAtTime(0.24, audio.currentTime + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
    source.connect(filter).connect(gain).connect(master);
    source.start();
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }, [soundEnabled]);

  const breathe = useCallback(() => {
    const now = performance.now();
    if (paused || !visible || now - latestFire.current < FIRE_COOLDOWN) return;
    latestFire.current = now;
    setStartedAt(now);
    setPhase("preparing");
    playBreath();
    timers.current.forEach(clearTimeout);
    timers.current = [
      setTimeout(() => setPhase("breathing"), 450),
      setTimeout(() => setPhase("cooldown"), 2500),
      setTimeout(() => setPhase("idle"), FIRE_COOLDOWN),
    ];
  }, [paused, visible, playBreath]);

  const togglePaused = useCallback(() => {
    setPaused(!paused);
    if (masterGain.current)
      masterGain.current.gain.value = !paused ? 0 : Number(soundEnabled);
    latestFire.current = -FIRE_COOLDOWN;
    setStartedAt(0);
    setPhase("idle");
    timers.current.forEach(clearTimeout);
  }, [paused, soundEnabled]);

  const toggleSound = useCallback(() => {
    if (!context.current) {
      context.current = new AudioContext();
      masterGain.current = context.current.createGain();
      masterGain.current.connect(context.current.destination);
    }
    if (masterGain.current)
      masterGain.current.gain.value = Number(!soundEnabled);
    void context.current.resume();
    setSoundEnabled(!soundEnabled);
  }, [soundEnabled]);

  // ─── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      setReducedMotion(media.matches);
      setPaused(media.matches);
    };
    updateMotion();
    media.addEventListener("change", updateMotion);
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    const capabilityFrame = requestAnimationFrame(() =>
      setWebglAvailable(Boolean(gl)),
    );
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    const element = container.current;
    let inView = false;
    const updateVisibility = () =>
      setVisible(inView && document.visibilityState === "visible");
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        updateVisibility();
      },
      { rootMargin: "100px" },
    );
    if (element) observer.observe(element);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      cancelAnimationFrame(capabilityFrame);
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
      observer.disconnect();
      timers.current.forEach(clearTimeout);
      void context.current?.close();
    };
  }, [container]);

  useEffect(() => {
    if (!visible || paused || reducedMotion) return;
    const timer = setInterval(breathe, 26000);
    return () => clearInterval(timer);
  }, [visible, paused, reducedMotion, breathe]);

  // ─── Public API ─────────────────────────────────────────────────────────────
  return {
    viewport: { visible, reducedMotion, webglAvailable },
    animation: {
      paused,
      interactive,
      togglePaused,
      toggleInteractive: () => setInteractive((value) => !value),
    },
    fire: { phase, startedAt, breathe },
    sound: { enabled: soundEnabled, toggle: toggleSound },
  };
};
