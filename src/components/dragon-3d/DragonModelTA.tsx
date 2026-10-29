"use client";

import { useEffect, useMemo, useRef } from "react";
import { createPortal, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { createDragonRelief } from "@/components/dragon-3d/dragon-materials";
import { FireBreathTA } from "@/components/dragon-3d/FireBreathTA";
import type { DragonSceneProps } from "@/components/dragon-3d/types";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface DragonModelProps extends Omit<DragonSceneProps, "onFailure"> {
  economical: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export const DragonModelTA = ({
  variant,
  active,
  paused,
  reducedMotion,
  interactive,
  fireStartedAt,
  onReact,
  onReady,
  economical,
}: DragonModelProps) => {
  const gltf = useGLTF("/models/draconis-original.glb");
  const group = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const pointer = useRef(new THREE.Vector2());
  const speed = useRef(0);
  const resources = useMemo(() => {
    const model = clone(gltf.scene);
    const relief = createDragonRelief();
    const materials = new Map<string, THREE.MeshStandardMaterial>();
    model.traverse((node) => {
      if (
        !(node instanceof THREE.Mesh) ||
        !(node.material instanceof THREE.MeshStandardMaterial)
      )
        return;
      const original = node.material;
      let material = materials.get(original.uuid);
      if (!material) {
        material = original.clone();
        if (
          ["DragonSkin", "DragonScales", "DragonBelly"].includes(material.name)
        ) {
          material.bumpMap = relief;
          material.bumpScale = 0.018;
          material.roughnessMap = relief;
        }
        materials.set(original.uuid, material);
      }
      node.material = material;
    });
    const mixer = new THREE.AnimationMixer(model);
    return {
      model,
      mixer,
      relief,
      materials,
      head: model.getObjectByName("Head"),
      jaw: model.getObjectByName("Jaw"),
      mouth: model.getObjectByName("Mouth"),
    };
  }, [gltf.scene]);

  const resourcesRef = useRef(resources);

  // ─── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    resourcesRef.current = resources;
    const clip = gltf.animations.find(
      (animation) => animation.name === "Flight",
    );
    if (clip) resources.mixer.clipAction(clip).play();
    onReady();
    return () => {
      resources.mixer.stopAllAction();
      resources.mixer.uncacheRoot(resources.model);
      resources.relief.dispose();
      resources.materials.forEach((material) => material.dispose());
    };
  }, [gltf.animations, resources, onReady]);

  // ─── Animation ──────────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    if (!group.current || !active || paused) return;
    const live = resourcesRef.current;
    const dt = Math.min(delta, 0.05);
    elapsed.current += dt;
    const time = elapsed.current;
    live.mixer.update(dt * (reducedMotion ? 0.35 : 1));
    const movement =
      pointer.current.distanceTo(state.pointer) / Math.max(dt, 0.001);
    speed.current = THREE.MathUtils.lerp(
      speed.current,
      Math.min(movement, 10),
      0.1,
    );
    pointer.current.copy(state.pointer);
    const targetX = interactive && !reducedMotion ? state.pointer.x : 0;
    const targetY = interactive && !reducedMotion ? state.pointer.y : 0;
    const entry = reducedMotion ? 1 : Math.min(time / 2.5, 1);
    const approach =
      interactive && !reducedMotion ? (speed.current > 3 ? -0.3 : 0.12) : 0;
    const floating = reducedMotion ? 0 : Math.sin(time * 0.72) * 0.105;
    const scrollOffset =
      variant === "hero" && !reducedMotion
        ? Math.min(window.scrollY / window.innerHeight, 1) * -0.22
        : 0;
    group.current.position.x = THREE.MathUtils.damp(
      group.current.position.x,
      0.2 + targetX * 0.1 + (1 - entry) * 1.1,
      3,
      dt,
    );
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      floating + scrollOffset + (1 - entry) * 0.55,
      3,
      dt,
    );
    group.current.position.z = THREE.MathUtils.damp(
      group.current.position.z,
      approach + targetY * 0.08,
      3,
      dt,
    );
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      -0.16 + targetX * 0.1,
      3,
      dt,
    );
    group.current.rotation.z = THREE.MathUtils.damp(
      group.current.rotation.z,
      -0.1 + Math.sin(time * 0.4) * (reducedMotion ? 0 : 0.025),
      3,
      dt,
    );
    if (live.head) {
      live.head.rotation.y = THREE.MathUtils.damp(
        live.head.rotation.y,
        targetX * -0.2,
        4,
        dt,
      );
      live.head.rotation.z = THREE.MathUtils.damp(
        live.head.rotation.z,
        targetY * -0.12,
        4,
        dt,
      );
    }
    if (live.jaw) {
      const fireElapsed = performance.now() - fireStartedAt;
      const opening =
        fireStartedAt > 0 && fireElapsed < 2700
          ? Math.min(fireElapsed / 450, 1) *
            Math.min((2700 - fireElapsed) / 350, 1) *
            0.34
          : 0;
      live.jaw.rotation.z = THREE.MathUtils.damp(
        live.jaw.rotation.z,
        Math.max(0, opening),
        8,
        dt,
      );
    }
  });

  return (
    <group
      ref={group}
      rotation={[0, -0.16, -0.1]}
      position={[0.2, 0, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onReact();
      }}
      dispose={null}
    >
      <primitive object={resources.model} />
      {resources.mouth &&
        createPortal(
          <FireBreathTA
            startedAt={fireStartedAt}
            active={active && !paused}
            economical={economical}
          />,
          resources.mouth,
        )}
    </group>
  );
};
