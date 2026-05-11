"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Fog } from "three";
import { useMemo, useRef, useState, useEffect, Suspense, useCallback } from "react";
import * as THREE from "three";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

// Default theme fallback for when ThemeProvider is not available
const DEFAULT_THEME = "dark";

function Pitch() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <group>
      {/* grass */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[60, 38]} />
        <meshStandardMaterial color={isDark ? "#0a8a3f" : "#a3d9a5"} />
      </mesh>
      {/* lines */}
      {[
        { args: [60, 0.15] as [number, number], pos: [0, 0.01, 0] as [number, number, number] },
        { args: [0.15, 38] as [number, number], pos: [0, 0.01, 0] as [number, number, number] },
      ].map((l, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={l.pos}>
          <planeGeometry args={l.args} />
          <meshBasicMaterial color={isDark ? "#ffffff" : "#444444"} />
        </mesh>
      ))}
      {/* center circle */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
        <ringGeometry args={[4, 4.15, 64]} />
        <meshBasicMaterial color={isDark ? "#ffffff" : "#444444"} side={THREE.DoubleSide} />
      </mesh>
      {/* penalty boxes */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh rotation-x={-Math.PI / 2} position={[s * 26, 0.012, 0]}>
            <ringGeometry args={[0, 0.4, 16]} />
            <meshBasicMaterial color={isDark ? "#ffffff" : "#444444"} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position={[s * 24, 0.012, 0]}>
            <planeGeometry args={[0.15, 16]} />
            <meshBasicMaterial color={isDark ? "#ffffff" : "#444444"} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Stands() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const items = [];
  items.push(<Stand key="n" position={[0, 1.5, -22]} size={[64, 3, 3]} color={isDark ? "#0a0a0a" : "#e0e0e0"} />);
  items.push(<Stand key="s" position={[0, 1.5, 22]} size={[64, 3, 3]} color={isDark ? "#0a0a0a" : "#e0e0e0"} />);
  items.push(<Stand key="e" position={[33, 1.5, 0]} size={[3, 3, 48]} color={isDark ? "#0a0a0a" : "#e0e0e0"} />);
  items.push(<Stand key="w" position={[-33, 1.5, 0]} size={[3, 3, 48]} color={isDark ? "#0a0a0a" : "#e0e0e0"} />);
  return <>{items}</>;
}

function Stand({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* glowing top edge */}
      <mesh position={[0, size[1] / 2 + 0.05, 0]}>
        <boxGeometry args={[size[0] + 0.2, 0.1, size[2] + 0.2]} />
        <meshStandardMaterial color={isDark ? "#00ff88" : "#00A859"} emissive={isDark ? "#00ff88" : "#00A859"} emissiveIntensity={isDark ? 2 : 1} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Player({ color, path, speed, offset }: { color: string; path: (t: number) => [number, number]; speed: number; offset: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() * speed + offset) % 1;
    const [x, z] = path(t);
    const next = path((t + 0.01) % 1);
    ref.current.position.x = x;
    ref.current.position.z = z;
    ref.current.rotation.y = Math.atan2(next[0] - x, next[1] - z);
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#f1c27d" />
      </mesh>
    </group>
  );
}

function Ball() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.x = Math.sin(t * 0.6) * 18;
    ref.current.position.z = Math.cos(t * 0.4) * 10;
    ref.current.position.y = 0.4 + Math.abs(Math.sin(t * 2)) * 0.6;
    ref.current.rotation.x += 0.08;
    ref.current.rotation.y += 0.05;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.4, 1]} />
      <meshStandardMaterial color={isDark ? "#ffffff" : "#222222"} />
    </mesh>
  );
}

function CameraRig() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime() * 0.08;
    camera.position.x = Math.sin(t) * 32;
    camera.position.z = Math.cos(t) * 32;
    camera.position.y = 22;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const players = useMemo(() => {
    const paths: ((t: number) => [number, number])[] = [
      (t) => [Math.sin(t * Math.PI * 2) * 18, Math.cos(t * Math.PI * 2) * 10],
      (t) => [Math.cos(t * Math.PI * 2) * 14, Math.sin(t * Math.PI * 4) * 8],
      (t) => [-15 + t * 30, Math.sin(t * Math.PI * 2) * 6],
      (t) => [15 - t * 30, -Math.sin(t * Math.PI * 2) * 6],
    ];
    return Array.from({ length: 10 }).map((_, i) => ({
      color: i % 2 === 0 ? (isDark ? "#E63946" : "#D62828") : (isDark ? "#4361EE" : "#00308F"),
      path: paths[i % paths.length],
      speed: 0.05 + (i % 3) * 0.02,
      offset: i * 0.1,
    }));
  }, [isDark]);

  return (
    <>
      <fog attach="fog" args={[isDark ? "#001a0d" : "#f0f0f0", 30, 70]} />
      <ambientLight intensity={isDark ? 0.5 : 0.8} />
      <directionalLight position={[20, 30, 10]} intensity={isDark ? 1.2 : 1.5} castShadow />
      <hemisphereLight args={[isDark ? "#88ffaa" : "#ffffff", isDark ? "#001a0d" : "#e0e0e0", 0.4]} />
      <Pitch />
      <Stands />
      <Ball />
      {players.map((p, i) => (
        <Player key={i} {...p} />
      ))}
      <CameraRig />
    </>
  );
}

export function FootballFieldScene() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    if (webglError) return;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };

    document.addEventListener("webglcontextlost", handleContextLost);

    return () => {
      document.removeEventListener("webglcontextlost", handleContextLost);
    };
  }, [webglError]);

  if (webglError) {
    return (
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-background via-background/80 to-background/60" />
    );
  }

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 22, 32], fov: 50 }}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          <Scene />
          <SceneUpdate />
        </Suspense>
      </Canvas>
      {/* dark overlay for legibility */}
      <div className={cn(
        "absolute inset-0 pointer-events-none",
        isDark
          ? "bg-gradient-to-b from-background/40 via-background/60 to-background/90"
          : "bg-gradient-to-b from-white/10 via-white/30 to-white/60"
      )} />
    </div>
  );
}

function SceneUpdate() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new Fog(isDark ? "#001a0d" : "#f0f0f0", 30, 70);
    scene.background = new THREE.Color(isDark ? "#020806" : "#ffffff");
  }, [isDark, scene]);

  return null;
}
