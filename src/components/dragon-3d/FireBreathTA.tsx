"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface FireBreathProps {
  startedAt: number;
  active: boolean;
  economical: boolean;
}

// ─── Shader ────────────────────────────────────────────────────────────────────
const vertexShader = `
  attribute float aHeat;
  attribute float aSpark;
  varying float vHeat;
  varying float vSpark;
  uniform float uPixelRatio;
  void main() {
    vHeat = aHeat;
    vSpark = aSpark;
    vec4 positionView = modelViewMatrix * vec4(position, 1.0);
    float plumeSize = 146.0 + (1.0 - aHeat) * 84.0;
    float sparkSize = 18.0 + aHeat * 10.0;
    gl_PointSize = mix(plumeSize, sparkSize, aSpark) * uPixelRatio / max(1.0, -positionView.z);
    gl_Position = projectionMatrix * positionView;
  }
`;
const fragmentShader = `
  varying float vHeat;
  varying float vSpark;
  uniform float uOpacity;
  uniform float uTime;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float ripple = sin(uv.y * 19.0 + uTime * 11.0 + vHeat * 17.0) * 0.035;
    float radius = length(vec2(uv.x * 0.85 + ripple, uv.y * 1.2));
    float edge = 1.0 - smoothstep(0.05, 0.5, radius);
    float turbulence = 0.76 + 0.24 * sin(uv.x * 15.0 + uv.y * 17.0 - uTime * 8.0 + vHeat * 23.0);
    float tailFade = smoothstep(0.0, 0.23, vHeat);
    float alpha = edge * edge * turbulence * tailFade * uOpacity;
    vec3 color = mix(vec3(0.82, 0.055, 0.003), vec3(1.0, 0.4, 0.025), vHeat);
    color = mix(color, vec3(1.0, 0.92, 0.46), pow(vHeat, 4.0));
    color = mix(color, vec3(1.0, 0.62, 0.16), vSpark);
    gl_FragColor = vec4(color, alpha * mix(0.16, 0.9, vSpark));
  }
`;

// ─── Component ─────────────────────────────────────────────────────────────────
export const FireBreathTA = ({
  startedAt,
  active,
  economical,
}: FireBreathProps) => {
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const count = economical ? 160 : 320;
  const resources = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(count * 3), 3),
    );
    geometry.setAttribute(
      "aHeat",
      new THREE.BufferAttribute(new Float32Array(count), 1),
    );
    geometry.setAttribute(
      "aSpark",
      new THREE.BufferAttribute(
        Float32Array.from({ length: count }, (_, index) =>
          Number(index % 13 === 0),
        ),
        1,
      ),
    );
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uOpacity: { value: 0 },
        uTime: { value: 0 },
        uPixelRatio: { value: economical ? 1 : 1.5 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return { geometry, material };
  }, [count, economical]);

  const resourcesRef = useRef(resources);

  useEffect(() => {
    resourcesRef.current = resources;
    return () => {
      resources.geometry.dispose();
      resources.material.dispose();
    };
  }, [resources]);

  useFrame(() => {
    if (!group.current) return;
    const live = resourcesRef.current;
    const elapsed = (performance.now() - startedAt) / 1000 - 0.45;
    const breathing = active && startedAt > 0 && elapsed > 0 && elapsed < 2.15;
    group.current.visible = breathing;
    if (!breathing) return;
    const envelope =
      Math.min(elapsed * 5, 1) * Math.min((2.15 - elapsed) * 2.7, 1);
    live.material.uniforms.uOpacity.value = envelope * (economical ? 1.6 : 1);
    live.material.uniforms.uTime.value = elapsed;
    if (light.current)
      light.current.intensity = envelope * (4 + Math.sin(elapsed * 33) * 0.8);
    const positions = live.geometry.attributes.position;
    const heat = live.geometry.attributes.aHeat;
    for (let i = 0; i < count; i += 1) {
      const seed = (i * 0.618033989) % 1;
      const radialSeed = (i * 0.754877666) % 1;
      const spark = i % 13 === 0;
      const age = (elapsed * (spark ? 1.65 : 1.3) + seed) % 1;
      const spread = (0.018 + age * 0.25) * Math.sqrt(radialSeed);
      const angle = i * 2.39996 + elapsed * 2.8;
      const drift = Math.sin(age * 12 - elapsed * 7) * age * 0.065;
      const sparkSpread = spark ? 1.8 : 1;
      positions.setXYZ(
        i,
        -age * (spark ? 2.5 : 2.15),
        Math.sin(angle) * spread * sparkSpread + age * 0.13 + drift,
        Math.cos(angle) * spread * sparkSpread,
      );
      heat.setX(i, 1 - age);
    }
    positions.needsUpdate = true;
    heat.needsUpdate = true;
  });

  return (
    <group ref={group} visible={false}>
      <points
        geometry={resources.geometry}
        material={resources.material}
        frustumCulled={false}
      />
      <pointLight
        ref={light}
        color="#ff8833"
        intensity={0}
        distance={5}
        decay={2}
      />
    </group>
  );
};
