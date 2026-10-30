"use client";
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useDragonExperience } from "@/components/experience/DragonExperienceProviderTA";
import { DragonWorldTA } from "@/components/experience/DragonWorldTA";

// ─── Failure is contained; product content stays usable ────────────────────────
class ExperienceBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError = () => ({ failed: true });
  componentDidCatch = () => this.props.onFailure();
  render = () => (this.state.failed ? null : this.props.children);
}

// ─── Locally generated studio environment, no external HDR dependency ──────────
const StudioEnvironmentTA = () => {
  const get = useThree((state) => state.get);
  useEffect(() => {
    const { gl, scene } = get();
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = generator.fromScene(room, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.4;
    room.dispose();
    generator.dispose();
    return () => {
      scene.environment = null;
      target.dispose();
    };
  }, [get]);
  return null;
};

const CanvasLifecycleTA = () => {
  const get = useThree((state) => state.get);
  const {
    frame: frameRef,
    scene: { onFailure },
  } = useDragonExperience();
  useEffect(() => {
    const { gl, invalidate } = get();
    const current = frameRef.current;
    current.invalidate = invalidate;
    gl.domElement.addEventListener("webglcontextlost", onFailure);
    return () => {
      gl.domElement.removeEventListener("webglcontextlost", onFailure);
      current.invalidate = null;
    };
  }, [get, frameRef, onFailure]);
  return null;
};

const PersistentDragonCanvasTA = () => {
  const { scene, playback } = useDragonExperience();
  const [economical, setEconomical] = useState(
    () => innerWidth < 760 || navigator.hardwareConcurrency <= 4,
  );
  const degrade = useCallback(() => setEconomical(true), []);
  return (
    <div
      className="persistent-dragon-canvas"
      data-stage={scene.stage}
      data-behavior={scene.behavior}
      data-quality={economical ? "economy" : "full"}
      aria-hidden="true"
    >
      <ExperienceBoundary onFailure={scene.onFailure}>
        <Canvas
          camera={{ position: [0, 0, 25], fov: 38, near: 0.1, far: 150 }}
          dpr={economical ? 1 : [1, 1.5]}
          frameloop={
            !scene.visible ? "never" : playback.paused ? "demand" : "always"
          }
          gl={{
            alpha: true,
            antialias: !economical,
            powerPreference: "high-performance",
          }}
          fallback={<span>WebGL no disponible</span>}
          onCreated={({ gl }) => {
            gl.setClearColor(0x0c0d0e, 0);
          }}
        >
          <CanvasLifecycleTA />
          <StudioEnvironmentTA />
          <ambientLight color="#cbb7b0" intensity={0.75} />
          <hemisphereLight args={["#dfdce1", "#361b1b", 1.1]} />
          <directionalLight
            position={[-6, 7, 10]}
            intensity={3.5}
            color="#ffe3bd"
          />
          <directionalLight
            position={[4, 5, -6]}
            intensity={4.5}
            color="#cf9b83"
          />
          <directionalLight
            position={[0, -4, 7]}
            intensity={0.6}
            color="#7d92aa"
          />
          <Suspense fallback={null}>
            <DragonWorldTA economical={economical} />
            <PerformanceMonitor
              flipflops={2}
              onDecline={degrade}
              onFallback={degrade}
            />
          </Suspense>
        </Canvas>
      </ExperienceBoundary>
    </div>
  );
};
export default PersistentDragonCanvasTA;
