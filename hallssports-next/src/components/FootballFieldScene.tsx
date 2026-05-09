"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Fog } from "three";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Pitch() {
  return (
    <group>
      {/* grass */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[60, 38]} />
        <meshStandardMaterial color="#0a8a3f" />
      </mesh>
      {/* lines */}
      {[
        { args: [60, 0.15] as [number, number], pos: [0, 0.01, 0] as [number, number, number] },
        { args: [0.15, 38] as [number, number], pos: [0, 0.01, 0] as [number, number, number] },
      ].map((l, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={l.pos}>
          <planeGeometry args={l.args} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* center circle */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
        <ringGeometry args={[4, 4.15, 64]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      {/* penalty boxes */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh rotation-x={-Math.PI / 2} position={[s * 26, 0.012, 0]}>
            <ringGeometry args={[0, 0.4, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position={[s * 24, 0.012, 0]}>
            <planeGeometry args={[0.15, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Stands() {
  const items = [];
  items.push(<Stand key="n" position={[0, 1.5, -22]} size={[64, 3, 3]} />);
  items.push(<Stand key="s" position={[0, 1.5, 22]} size={[64, 3, 3]} />);
  items.push(<Stand key="e" position={[33, 1.5, 0]} size={[3, 3, 48]} />);
  items.push(<Stand key="w" position={[-33, 1.5, 0]} size={[3, 3, 48]} />);
  return <>{items}</>;
}

function Stand({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      {/* glowing top edge */}
      <mesh position={[0, size[1] / 2 + 0.05, 0]}>
        <boxGeometry args={[size[0] + 0.2, 0.1, size[2] + 0.2]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Player({ color, path, speed, offset }: { color: string; path: (t: number) => [number, number]; speed: number; offset: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.elapsedTime * speed + offset) % 1;
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
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.x = Math.sin(t * 0.6) * 18;
    ref.current.position.z = Math.cos(t * 0.4) * 10;
    ref.current.position.y = 0.4 + Math.abs(Math.sin(t * 2)) * 0.6;
    ref.current.rotation.x += 0.08;
    ref.current.rotation.y += 0.05;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.4, 1]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
}

function CameraRig() {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime * 0.08;
    camera.position.x = Math.sin(t) * 32;
    camera.position.z = Math.cos(t) * 32;
    camera.position.y = 22;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene() {
  const players = useMemo(() => {
    const paths: ((t: number) => [number, number])[] = [
      (t) => [Math.sin(t * Math.PI * 2) * 18, Math.cos(t * Math.PI * 2) * 10],
      (t) => [Math.cos(t * Math.PI * 2) * 14, Math.sin(t * Math.PI * 4) * 8],
      (t) => [-15 + t * 30, Math.sin(t * Math.PI * 2) * 6],
      (t) => [15 - t * 30, -Math.sin(t * Math.PI * 2) * 6],
    ];
    return Array.from({ length: 10 }).map((_, i) => ({
      color: i % 2 === 0 ? "#E63946" : "#4361EE",
      path: paths[i % paths.length],
      speed: 0.05 + (i % 3) * 0.02,
      offset: i * 0.1,
    }));
  }, []);

  return (
    <>
      <fog attach="fog" args={["#001a0d", 30, 70]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[20, 30, 10]} intensity={1.2} castShadow />
      <hemisphereLight args={["#88ffaa", "#001a0d", 0.4]} />
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
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 22, 32], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ scene }) => { scene.fog = new Fog("#001a0d", 30, 70); scene.background = new THREE.Color("#020806"); }}
      >
        <Scene />
      </Canvas>
      {/* dark overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background/90 pointer-events-none" />
    </div>
  );
}