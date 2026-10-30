"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type DragonSoundKind = "roar" | "fire";

export interface DragonAudio {
  enabled: boolean;
  toggle: () => void;
  play: (kind: DragonSoundKind) => void;
  stop: () => void;
}

interface SoundVoice {
  sources: AudioScheduledSourceNode[];
  nodes: AudioNode[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useDragonAudio = (): DragonAudio => {
  // ─── State and refs ─────────────────────────────────────────────────────────
  const [enabled, setEnabled] = useState(false);
  const enabledRef = useRef(false);
  const context = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const voices = useRef(new Set<SoundVoice>());
  const playbackRequest = useRef(0);

  // ─── Playback controls ──────────────────────────────────────────────────────
  const stop = useCallback(() => {
    playbackRequest.current += 1;
    const audio = context.current;
    if (audio && master.current) {
      master.current.gain.cancelScheduledValues(audio.currentTime);
      master.current.gain.setValueAtTime(0, audio.currentTime);
    }
    voices.current.forEach((voice) => {
      voice.sources.forEach((source) => {
        source.onended = null;
        try {
          source.stop();
        } catch {
          /* A completed source needs only disposal. */
        }
      });
      voice.nodes.forEach((node) => node.disconnect());
    });
    voices.current.clear();
  }, []);

  const toggle = useCallback(() => {
    if (enabledRef.current) {
      enabledRef.current = false;
      setEnabled(false);
      stop();
      return;
    }
    if (
      typeof window === "undefined" ||
      typeof window.AudioContext !== "function"
    )
      return;
    try {
      if (!context.current || context.current.state === "closed") {
        context.current = new AudioContext();
        master.current = context.current.createGain();
        master.current.gain.value = 0;
        master.current.connect(context.current.destination);
      }
      enabledRef.current = true;
      setEnabled(true);
      void context.current.resume().catch(() => {
        enabledRef.current = false;
        setEnabled(false);
        stop();
      });
    } catch {
      enabledRef.current = false;
      setEnabled(false);
      stop();
    }
  }, [stop]);

  const play = useCallback(
    (kind: DragonSoundKind) => {
      const audio = context.current;
      const output = master.current;
      if (!enabledRef.current || !audio || !output || audio.state === "closed")
        return;
      stop();
      const request = playbackRequest.current;
      void audio
        .resume()
        .then(() => {
          if (
            !enabledRef.current ||
            audio.state === "closed" ||
            playbackRequest.current !== request ||
            document.visibilityState !== "visible"
          )
            return;
          const now = audio.currentTime;
          const duration = kind === "fire" ? 2.9 : 1.25;
          const delay = kind === "fire" ? 0.55 : 0;
          const noiseBuffer = audio.createBuffer(
            1,
            Math.ceil(audio.sampleRate * duration),
            audio.sampleRate,
          );
          const samples = noiseBuffer.getChannelData(0);
          let brown = 0;
          for (let index = 0; index < samples.length; index += 1) {
            brown = (brown + (Math.random() * 2 - 1) * 0.025) / 1.025;
            samples[index] = brown * 2.8;
          }
          const noise = audio.createBufferSource();
          noise.buffer = noiseBuffer;
          const filter = audio.createBiquadFilter();
          filter.type = kind === "fire" ? "lowpass" : "bandpass";
          filter.Q.value = kind === "fire" ? 0.4 : 0.8;
          filter.frequency.setValueAtTime(
            kind === "fire" ? 140 : 100,
            now + delay,
          );
          filter.frequency.exponentialRampToValueAtTime(
            kind === "fire" ? 850 : 330,
            now + delay + 0.4,
          );
          filter.frequency.exponentialRampToValueAtTime(90, now + duration);
          const envelope = audio.createGain();
          envelope.gain.setValueAtTime(0, now);
          envelope.gain.setValueAtTime(0, now + delay);
          envelope.gain.linearRampToValueAtTime(
            kind === "fire" ? 0.28 : 0.34,
            now + delay + 0.22,
          );
          envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);
          noise.connect(filter).connect(envelope).connect(output);
          const sources: AudioScheduledSourceNode[] = [noise];
          const nodes: AudioNode[] = [noise, filter, envelope];
          if (kind === "roar") {
            const rumble = audio.createOscillator();
            rumble.type = "triangle";
            rumble.frequency.setValueAtTime(65, now);
            rumble.frequency.exponentialRampToValueAtTime(32, now + duration);
            const rumbleGain = audio.createGain();
            rumbleGain.gain.value = 0.12;
            rumble.connect(rumbleGain).connect(envelope);
            sources.push(rumble);
            nodes.push(rumble, rumbleGain);
          }
          const voice: SoundVoice = { sources, nodes };
          voices.current.add(voice);
          output.gain.setValueAtTime(0.32, now);
          noise.onended = () => {
            voice.nodes.forEach((node) => node.disconnect());
            voices.current.delete(voice);
          };
          sources.forEach((source) => {
            source.start(now);
            source.stop(now + duration);
          });
        })
        .catch(() => stop());
    },
    [stop],
  );

  // ─── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(
    () => () => {
      enabledRef.current = false;
      stop();
      const audio = context.current;
      context.current = null;
      master.current = null;
      if (audio && audio.state !== "closed")
        void audio.close().catch(() => undefined);
    },
    [stop],
  );

  // ─── Public API ─────────────────────────────────────────────────────────────
  return { enabled, toggle, play, stop };
};
