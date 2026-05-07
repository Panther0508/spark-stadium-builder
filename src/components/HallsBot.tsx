import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

function Bot({ squashTrigger }: { squashTrigger: number }) {
  const group = useRef<THREE.Group>(null);
  const squash = useRef(0);
  const lastTrigger = useRef(squashTrigger);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.position.y = Math.sin(t * 2) * 0.15;
    group.current.rotation.y = Math.sin(t * 0.5) * 0.3;

    if (lastTrigger.current !== squashTrigger) {
      squash.current = 1;
      lastTrigger.current = squashTrigger;
    }
    squash.current = THREE.MathUtils.lerp(squash.current, 0, 0.15);
    const sx = 1 + squash.current * 0.3;
    const sy = 1 - squash.current * 0.3;
    group.current.scale.set(sx, sy, sx);
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* green panels */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]}>
          <torusGeometry args={[1.005, 0.06, 8, 32, Math.PI / 3]} />
          <meshStandardMaterial color="#00A859" emissive="#00A859" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* eyes */}
      <mesh position={[0.4, 0.2, 0.85]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[-0.4, 0.2, 0.85]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0.4, 0.2, 1.0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <mesh position={[-0.4, 0.2, 1.0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      {/* smile */}
      <mesh position={[0, -0.2, 0.9]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.25, 0.04, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
}

export function HallsBot() {
  const [trigger, setTrigger] = useState(0);
  return (
    <div
      className="w-20 h-20 cursor-pointer"
      onClick={() => setTrigger((t) => t + 1)}
      aria-label="HallsBot mascot"
    >
      <Canvas camera={{ position: [0, 0, 3.2], fov: 40 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 3, 4]} intensity={1.2} />
        <Bot squashTrigger={trigger} />
      </Canvas>
    </div>
  );
}
