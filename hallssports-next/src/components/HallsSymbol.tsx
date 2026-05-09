"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function WireframeFootball() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.3;
      groupRef.current.rotation.x = clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#00A859"
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

function OrbitingParticles() {
  const particles = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (particles.current) {
      particles.current.rotation.y = clock.elapsedTime * 0.2;
    }
  });

  const particlePositions = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const radius = 1.6;
    return [Math.cos(angle) * radius, Math.sin(i * 0.5) * 0.3, Math.sin(angle) * radius];
  });

  return (
    <group ref={particles}>
      {particlePositions.map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color="#00A859" />
        </mesh>
      ))}
    </group>
  );
}

/*
  Optional hook for future goal celebration:
  Connect to a global CelebrationContext that triggers
  when a goal is scored. On trigger, speed up rotation
  temporarily or flash the material brighter.
*/
export function HallsSymbol() {
  return (
    <div className="w-20 h-20">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }} gl={{ alpha: true }}>
        <WireframeFootball />
        <OrbitingParticles />
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 3]} intensity={0.8} />
      </Canvas>
    </div>
  );
}