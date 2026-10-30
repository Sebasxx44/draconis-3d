"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DragonFireSystemProps {
  startedAt: number;
  active: boolean;
  economical: boolean;
}

interface ParticleBatch {
  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
}

// ─── GPU particle simulation ──────────────────────────────────────────────────
// Seeds never change after allocation. All particle motion and lifetime work runs
// in the vertex shader; a frame updates only time, viewport and light intensity.
const vertexShader = `
  attribute vec4 aSeed;
  uniform float uTime;
  uniform float uViewportHeight;
  uniform float uMode;
  varying float vAge;
  varying float vAlive;
  varying float vSeed;
  varying float vMode;

  void main() {
    float time = uTime - 0.7;
    float spark = step(0.5, uMode) * (1.0 - step(1.5, uMode));
    float smoke = step(1.5, uMode);
    float lifetime = mix(0.5, 0.8, aSeed.z);
    float delay = aSeed.x * lifetime;
    float cycle = floor(max(time - delay, 0.0) / lifetime);
    float finalCycle = floor(max(2.2 - delay, 0.0) / lifetime);
    float born = delay + min(cycle, finalCycle) * lifetime;
    float elapsed = time - born;
    float age = clamp(elapsed / lifetime, 0.0, 1.0);
    vAge = age;
    vAlive = step(0.0, elapsed) * (1.0 - step(lifetime, elapsed));
    vSeed = aSeed.w;
    vMode = uMode;

    float phase = aSeed.y * 6.2831853;
    float radius = sqrt(aSeed.w) * (0.016 + pow(age, 0.8) * 0.29);
    float turbulence = sin(age * 16.0 - time * 7.0 + phase) * age * 0.08;
    float curl = cos(age * 10.0 + time * 3.8 + phase * 2.0) * age * 0.05;
    float extension = mix(3.2, 3.8, spark);
    vec3 p = vec3(
      -age * extension,
      cos(phase + age * 2.4) * radius + turbulence + age * age * 0.14,
      sin(phase + age * 2.4) * radius + curl
    );
    p.y += spark * (aSeed.z - 0.35) * age * 0.8;
    p.z += spark * (aSeed.w - 0.5) * age * 0.65;
    p.x -= smoke * (0.35 + age * 0.3);
    p.y += smoke * age * age * 0.48;
    p.z += smoke * sin(phase + age * 3.0) * age * 0.22;

    float plumeSize = mix(0.4, 0.75, age) * mix(0.85, 1.15, aSeed.z);
    float pointSize = mix(plumeSize, mix(0.065, 0.13, aSeed.w), spark);
    pointSize = mix(pointSize, mix(0.8, 1.35, age), smoke);
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    float modelScale = length(modelViewMatrix[0].xyz);
    float pixelsPerWorldUnit = uViewportHeight * 0.5 * projectionMatrix[1][1]
                            / max(0.1, -mvPosition.z);
    gl_PointSize = clamp(pointSize * modelScale * pixelsPerWorldUnit, 1.0, 128.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uDensity;
  varying float vAge;
  varying float vAlive;
  varying float vSeed;
  varying float vMode;

  void main() {
    if (vAlive < 0.5) discard;
    vec2 uv = gl_PointCoord - 0.5;
    float spark = step(0.5, vMode) * (1.0 - step(1.5, vMode));
    float smoke = step(1.5, vMode);
    float noise = sin(uv.x * 18.0 + uv.y * 12.0 + uTime * 9.0 + vSeed * 21.0)
                * cos(uv.y * 17.0 - uTime * 7.0 + vAge * 12.0);
    float radius = length(vec2(uv.x * 0.9, uv.y * 1.12));
    float edge = 1.0 - smoothstep(0.06, 0.49, radius + noise * 0.11);
    float life = smoothstep(0.0, 0.08, vAge) * (1.0 - smoothstep(0.67, 1.0, vAge));
    float alpha = edge * edge * life;
    float heat = 1.0 - vAge;
    vec3 flame = mix(vec3(0.62, 0.035, 0.003), vec3(1.0, 0.32, 0.018), heat);
    flame = mix(flame, vec3(1.0, 0.9, 0.5), pow(heat, 3.5));
    vec3 color = mix(flame, vec3(1.0, 0.61, 0.12), spark);
    color = mix(color, vec3(0.22, 0.20, 0.18) + noise * 0.025, smoke);
    float density = mix(0.14, 0.85, spark);
    density = mix(density, 0.1 * smoothstep(0.0, 0.35, vAge), smoke);
    gl_FragColor = vec4(color, min(0.95, alpha * density * uDensity));
  }
`;

// ─── Resource factory ─────────────────────────────────────────────────────────
const makeBatch = (count: number, mode: 0 | 1 | 2): ParticleBatch => {
  const geometry = new THREE.BufferGeometry();
  const seeds = new Float32Array(count * 4);
  for (let index = 0; index < count; index += 1) {
    seeds[index * 4] = (index * 0.618033989 + 0.17) % 1;
    seeds[index * 4 + 1] = (index * 0.754877666 + 0.31) % 1;
    seeds[index * 4 + 2] = (index * 0.569840291 + 0.47) % 1;
    seeds[index * 4 + 3] = (index * 0.438579021 + 0.71) % 1;
  }
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(count * 3), 3),
  );
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uViewportHeight: { value: 900 },
      uDensity: {
        value: mode === 0 ? 380 / count : mode === 2 ? 42 / count : 1,
      },
      uMode: { value: mode },
    },
    transparent: true,
    depthWrite: false,
    blending: mode === 2 ? THREE.NormalBlending : THREE.AdditiveBlending,
    toneMapped: false,
  });
  return { geometry, material };
};

const skipRaycast = () => undefined;

// ─── Component ────────────────────────────────────────────────────────────────
export const DragonFireSystemTA = ({
  startedAt,
  active,
  economical,
}: DragonFireSystemProps) => {
  const group = useRef<THREE.Group>(null);
  const throat = useRef<THREE.PointLight>(null);
  const flameLight = useRef<THREE.PointLight>(null);
  const resources = useMemo(
    () => ({
      flame: makeBatch(economical ? 180 : 380, 0),
      sparks: makeBatch(economical ? 24 : 48, 1),
      smoke: makeBatch(economical ? 20 : 42, 2),
    }),
    [economical],
  );

  // ─── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(
    () => () => {
      Object.values(resources).forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
    },
    [resources],
  );

  // ─── Animation ──────────────────────────────────────────────────────────────
  useFrame(({ gl, size }) => {
    if (!group.current) return;
    const time = (performance.now() - startedAt) / 1000;
    const visible = active && startedAt > 0 && time >= 0 && time < 3.7;
    group.current.visible = visible;
    if (!visible) return;
    const preparation = Math.min(time / 0.7, 1);
    const release = Math.min(Math.max((3.7 - time) / 0.8, 0), 1);
    const emission = Math.min(Math.max((time - 0.7) / 0.18, 0), 1) * release;
    if (throat.current) throat.current.intensity = preparation * release * 0.8;
    if (flameLight.current)
      flameLight.current.intensity =
        emission * (4.5 + Math.sin(time * 29) * 0.7);
    const drawingHeight = size.height * gl.getPixelRatio();
    Object.values(resources).forEach(({ material }) => {
      material.uniforms.uTime.value = time;
      material.uniforms.uViewportHeight.value = drawingHeight;
    });
  });

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <group ref={group} visible={false} dispose={null}>
      <points
        geometry={resources.smoke.geometry}
        material={resources.smoke.material}
        frustumCulled={false}
        raycast={skipRaycast}
      />
      <points
        geometry={resources.flame.geometry}
        material={resources.flame.material}
        frustumCulled={false}
        raycast={skipRaycast}
      />
      <points
        geometry={resources.sparks.geometry}
        material={resources.sparks.material}
        frustumCulled={false}
        raycast={skipRaycast}
      />
      <pointLight
        ref={throat}
        position={[0.1, 0, 0]}
        color="#ff5d1c"
        intensity={0}
        distance={1.2}
        decay={2}
      />
      <pointLight
        ref={flameLight}
        position={[-0.45, 0, 0]}
        color="#ff9b44"
        intensity={0}
        distance={4.5}
        decay={2}
      />
    </group>
  );
};
