"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { DragonModelTA } from "@/components/dragon-3d/DragonModelTA";
import type {
  DragonSceneProps,
  DragonVariant,
} from "@/components/dragon-3d/types";

const CAMERA_SETTINGS = { fov: 38, near: 0.1, far: 60 };

// ─── Framing ──────────────────────────────────────────────────────────────────
const CameraFramingTA = ({ variant }: { variant: DragonVariant }) => {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const narrow = size.width < 560;
    const horizontalDistance =
      8.6 / (2 * Math.tan((19 * Math.PI) / 180) * aspect);
    const distance = Math.max(
      horizontalDistance,
      narrow ? 11.2 : variant === "detail" ? 10.8 : 10.1,
    );
    camera.position.set(
      0,
      narrow ? 2.35 : variant === "detail" ? 2.6 : 1.8,
      distance,
    );
    camera.lookAt(0.15, variant === "detail" ? 0.2 : narrow ? 0.72 : 0.65, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, variant, invalidate]);
  return null;
};

// ─── Component ─────────────────────────────────────────────────────────────────
const DragonSceneTA = (props: DragonSceneProps) => {
  const [economical, setEconomical] = useState(
    () => window.innerWidth < 768 || navigator.hardwareConcurrency <= 4,
  );
  const reduceQuality = useCallback(() => setEconomical(true), []);

  return (
    <Canvas
      camera={CAMERA_SETTINGS}
      dpr={economical ? 1 : [1, 1.5]}
      frameloop={props.active && !props.paused ? "always" : "demand"}
      gl={{
        antialias: !economical,
        alpha: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x0c0d0e, 0);
        gl.domElement.addEventListener("webglcontextlost", props.onFailure, {
          once: true,
        });
      }}
      style={{
        touchAction:
          props.variant === "detail" && props.interactive ? "none" : "pan-y",
      }}
      aria-label="Dragón serpentino rojo original en tres dimensiones"
    >
      <CameraFramingTA variant={props.variant} />
      <ambientLight intensity={0.7} color="#ccb5a8" />
      <hemisphereLight color="#f3d8bf" groundColor="#29131d" intensity={1.6} />
      <directionalLight position={[-3, 5, 5]} intensity={3.1} color="#ffe0bc" />
      <directionalLight position={[3, 4, -4]} intensity={5.2} color="#f79f78" />
      <directionalLight
        position={[-1, -2, 5]}
        intensity={0.65}
        color="#aebbd7"
      />
      <Suspense fallback={null}>
        <DragonModelTA {...props} economical={economical} />
        <PerformanceMonitor
          onDecline={reduceQuality}
          onFallback={reduceQuality}
          flipflops={2}
        />
      </Suspense>
      {props.variant === "detail" && (
        <OrbitControls
          enabled={props.interactive}
          enablePan={false}
          enableDamping={!props.reducedMotion}
          minDistance={6}
          maxDistance={14}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI * 0.85}
          target={[0.15, 0.2, 0]}
        />
      )}
    </Canvas>
  );
};

export default DragonSceneTA;
