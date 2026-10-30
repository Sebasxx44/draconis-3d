"use client";
import { useEffect, useMemo, useRef } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  AnimationMixer,
  Box3,
  Vector2,
  Vector3,
  Quaternion,
  Euler,
  Group,
  MathUtils,
  Raycaster,
  SkinnedMesh,
  Mesh,
  MeshStandardMaterial,
} from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { useDragonExperience } from "@/components/experience/DragonExperienceProviderTA";
import { DragonFireSystemTA } from "@/components/experience/DragonFireSystemTA";
import {
  getFlightTarget,
  dampFactor,
} from "@/components/experience/flight-math";
import type { DragonBehavior } from "@/components/experience/types";

// ─── The only model instance and mixer in the application ──────────────────────
export const DragonWorldTA = ({ economical }: { economical: boolean }) => {
  const gltf = useGLTF("/models/draconis-serpentine-v2.glb");
  const { frame: frameRef, scene, fire, playback } = useDragonExperience();
  const { camera, gl, invalidate } = useThree();
  const { onReady } = scene;
  const root = useRef<Group>(null);
  const timeline = useRef({
    time: 0,
    hitAt: 0,
    scroll: -1,
    version: -1,
    lastBehavior: "idle",
    gazeX: 0,
    gazeY: 0,
    flightSpeed: 1,
    target: getFlightTarget([], 0),
    reportedAt: 0,
    initialized: false,
  });
  const vectors = useMemo(
    () => ({
      position: new Vector3(),
      scale: new Vector3(),
      orientation: new Quaternion(),
      euler: new Euler(),
      pointer: new Vector2(),
      ray: new Raycaster(),
    }),
    [],
  );
  const resource = useMemo(() => {
    const model = clone(gltf.scene);
    const box = new Box3().setFromObject(model);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const head = model.getObjectByName("Head");
    const jaw = model.getObjectByName("Jaw");
    const neck = model.getObjectByName("Neck_10");
    model.traverse((node) => {
      if (node instanceof SkinnedMesh) {
        node.computeBoundingSphere();
        if (node.boundingSphere) node.boundingSphere.radius *= 2.7;
        node.frustumCulled = true;
      }
      if (node instanceof Mesh) {
        node.frustumCulled = true;
        if (node.material instanceof MeshStandardMaterial && node.material.map)
          node.material.map.anisotropy = Math.min(
            4,
            gl.capabilities.getMaxAnisotropy(),
          );
      }
    });
    return {
      model,
      center,
      size,
      mixer: new AnimationMixer(model),
      head,
      jaw,
      neck,
      mouth: model.getObjectByName("Mouth"),
      headRest: head?.quaternion.clone(),
      jawRest: jaw?.quaternion.clone(),
      neckRest: neck?.quaternion.clone(),
    };
  }, [gltf.scene, gl]);
  const resourceRef = useRef(resource);
  // ─── Model lifetime, real-geometry raycasting ─────────────────────────────────
  useEffect(() => {
    resourceRef.current = resource;
    const clip = gltf.animations.find(
      (animation) => animation.name === "Flight",
    );
    if (clip) resource.mixer.clipAction(clip).play();
    gl.domElement.setAttribute("data-model-instance", resource.model.uuid);
    const hit = (x: number, y: number) => {
      vectors.pointer.set(
        (x / frameRef.current.viewport.width) * 2 - 1,
        (-y / frameRef.current.viewport.height) * 2 + 1,
      );
      vectors.ray.setFromCamera(vectors.pointer, camera);
      return vectors.ray.intersectObject(resource.model, true).length > 0;
    };
    const frameState = frameRef.current;
    frameState.hitTest = hit;
    onReady();
    invalidate();
    return () => {
      frameState.hitTest = null;
      resource.mixer.stopAllAction();
      resource.mixer.uncacheRoot(resource.model);
      gl.domElement.removeAttribute("data-model-instance");
    };
  }, [
    resource,
    gltf.animations,
    camera,
    gl,
    frameRef,
    vectors,
    onReady,
    invalidate,
  ]);
  // ─── Flight, rig and behavior state machine ───────────────────────────────────
  useFrame((state, delta) => {
    if (!root.current) return;
    const data = frameRef.current,
      live = resourceRef.current,
      tick = timeline.current;
    const dt = Math.min(delta, 0.05),
      running = !data.animation.paused && data.viewport.visible;
    if (
      tick.scroll !== data.viewport.scroll ||
      tick.version !== data.layout.version
    ) {
      tick.target = getFlightTarget(data.layout.anchors, data.viewport.scroll);
      tick.scroll = data.viewport.scroll;
      tick.version = data.layout.version;
    }
    const target = tick.target;
    const inspecting = data.layout.stage === "study" && data.inspect.enabled;
    const pixel = state.viewport.width / state.size.width;
    const padding = data.viewport.width < 760 ? 0.86 : 0.94;
    const scale =
      Math.min(
        target.width / Math.max(live.size.x, 1),
        target.height / Math.max(live.size.y * 1.5, live.size.z * 0.68, 3),
      ) *
      pixel *
      padding *
      (inspecting ? data.inspect.zoom : 1);
    const now = performance.now();
    const recent =
      !data.animation.paused &&
      now - data.pointer.lastAt < 2800 &&
      !data.pointer.blocked &&
      data.animation.interactive;
    const gazeX = recent ? (data.pointer.x / data.viewport.width - 0.5) * 2 : 0;
    const gazeY = recent
      ? (0.5 - data.pointer.y / data.viewport.height) * 2
      : 0;
    const avoidance = recent && data.pointer.speed > 1.8 ? -0.07 : 0;
    if (running) tick.time += dt;
    const float = data.viewport.reduced
      ? 0
      : Math.sin(tick.time * 0.8) * target.featured * 6;
    vectors.position.set(
      (target.x - state.size.width / 2) * pixel,
      (state.size.height / 2 - target.y - float) * pixel,
      0,
    );
    const blend = data.viewport.reduced ? 1 : dampFactor(4.3, dt);
    if (tick.time < 2 && !data.viewport.reduced)
      vectors.position.setX(
        vectors.position.x + (1 - Math.min(tick.time / 2, 1)) * 1.8,
      );
    if (!tick.initialized) {
      root.current.position.copy(vectors.position);
      root.current.scale.setScalar(scale);
    }
    root.current.position.lerp(vectors.position, blend);
    root.current.scale.lerp(
      vectors.scale.set(scale, scale, scale).multiplyScalar(1 + avoidance),
      blend,
    );
    vectors.euler.set(
      0.22 + (inspecting ? data.inspect.pitch : 0),
      target.yaw + (inspecting ? data.inspect.yaw : gazeX * 0.055),
      target.bank -
        0.035 +
        (data.viewport.reduced ? 0 : Math.sin(tick.time * 0.42) * 0.018),
    );
    vectors.orientation.setFromEuler(vectors.euler);
    if (!tick.initialized) {
      root.current.quaternion.copy(vectors.orientation);
      tick.initialized = true;
    }
    root.current.quaternion.slerp(vectors.orientation, blend);
    if (
      data.animation.paused &&
      (root.current.position.distanceTo(vectors.position) > 0.002 ||
        root.current.scale.distanceTo(vectors.scale) > 0.0002 ||
        root.current.quaternion.angleTo(vectors.orientation) > 0.001)
    )
      invalidate();
    if (running) {
      if (live.head && live.headRest) live.head.quaternion.copy(live.headRest);
      if (live.jaw && live.jawRest) live.jaw.quaternion.copy(live.jawRest);
      if (live.neck && live.neckRest) live.neck.quaternion.copy(live.neckRest);
      tick.flightSpeed = MathUtils.damp(
        tick.flightSpeed,
        inspecting ? 0.3 : data.layout.stage === "contact" ? 0.55 : 1,
        3,
        dt,
      );
      live.mixer.update(dt * tick.flightSpeed);
      tick.gazeX = MathUtils.damp(tick.gazeX, gazeX, 4, dt);
      tick.gazeY = MathUtils.damp(tick.gazeY, gazeY, 4, dt);
      const fireElapsed = now - data.animation.fireAt,
        roarElapsed = now - data.animation.roarAt;
      const firing = data.animation.fireAt > 0 && fireElapsed < 3700;
      const roaring = data.animation.roarAt > 0 && roarElapsed < 1500;
      const opening = firing
        ? Math.min(fireElapsed / 700, 1) *
          Math.min(Math.max(3700 - fireElapsed, 0) / 650, 1)
        : roaring
          ? Math.sin((roarElapsed / 1500) * Math.PI) * 0.7
          : 0;
      if (live.head) {
        live.head.rotation.y += tick.gazeX * -0.22;
        live.head.rotation.z +=
          tick.gazeY * -0.12 +
          (roaring ? Math.sin(roarElapsed * 0.014) * 0.055 : 0) -
          opening * 0.045;
      }
      if (live.neck) live.neck.rotation.z -= opening * 0.065;
      if (live.jaw) live.jaw.rotation.z += opening * 0.38;
      if (now - tick.hitAt > 100) {
        data.pointer.hovered =
          recent && Boolean(data.hitTest?.(data.pointer.x, data.pointer.y));
        tick.hitAt = now;
      }
      const transitioning =
        root.current.position.distanceTo(vectors.position) > 0.16;
      const behavior: DragonBehavior = firing
        ? "breathing-fire"
        : roaring
          ? "roaring"
          : inspecting
            ? "inspecting"
            : transitioning
              ? "transitioning"
              : data.pointer.hovered
                ? "hovering"
                : recent
                  ? "following-cursor"
                  : "flying";
      data.animation.behavior = behavior;
      if (behavior !== tick.lastBehavior) {
        tick.lastBehavior = behavior;
        scene.reportBehavior(behavior);
      }
    } else if (tick.lastBehavior !== "idle") {
      tick.lastBehavior = "idle";
      data.animation.behavior = "idle";
      scene.reportBehavior("idle");
    }
    gl.domElement.setAttribute("data-flight-stage", data.layout.stage);
  });
  return (
    <group ref={root} dispose={null}>
      <group
        position={[-resource.center.x, -resource.center.y, -resource.center.z]}
      >
        <primitive object={resource.model} />
        {resource.mouth &&
          createPortal(
            <DragonFireSystemTA
              startedAt={fire.startedAt}
              active={!playback.paused && scene.visible}
              economical={economical}
            />,
            resource.mouth,
          )}
      </group>
    </group>
  );
};
