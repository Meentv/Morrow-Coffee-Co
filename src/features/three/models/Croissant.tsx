import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

/**
 * Procedural croissant — a ring of tapered, rolled segments.
 *
 * Same rationale as the cup: original geometry, no licence questions, no
 * download. Built from a sphere scaled into a "roll", instanced around an arc
 * with variation in size and twist so it reads as laminated pastry rather than
 * a bagel.
 */
export function Croissant({
  rotationSpeed = 0.2,
  pointer = { x: 0, y: 0 },
}: {
  rotationSpeed?: number;
  pointer?: { x: number; y: number };
}) {
  const group = useRef<Group>(null);
  const eased = useRef({ x: 0, y: 0 });

  const segments = useMemo(() => {
    const count = 9;
    return Array.from({ length: count }, (_, index) => {
      const t = index / (count - 1);
      const angle = Math.PI * 0.16 + t * Math.PI * 1.06;
      // Taper at both tips, fullest in the middle.
      const bulge = Math.sin(Math.PI * t) ** 0.55;
      const radius = 1.02;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        angle,
        scale: 0.3 + bulge * 0.26,
        twist: (t - 0.5) * 0.5,
      };
    });
  }, []);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;

    const damping = 1 - Math.pow(0.0016, delta);
    eased.current.x += (pointer.x - eased.current.x) * damping;
    eased.current.y += (pointer.y - eased.current.y) * damping;

    node.rotation.y += delta * rotationSpeed;
    node.position.x = eased.current.x * 0.14;
    node.position.y = eased.current.y * 0.09;
    node.rotation.z = eased.current.x * 0.04;
  });

  return (
    <group ref={group} position={[0, -0.15, 0]} rotation={[0.12, 0, 0]}>
      {segments.map((segment, index) => (
        <mesh
          key={index}
          position={[segment.x, Math.sin(index) * 0.02, segment.z]}
          rotation={[0, -segment.angle, segment.twist]}
          scale={[segment.scale * 1.5, segment.scale * 0.86, segment.scale * 1.15]}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? "#d9a35f" : "#c98a45"}
            roughness={0.62}
            metalness={0.04}
          />
        </mesh>
      ))}

      {/* Under-tray disc for a soft contact shadow bed */}
      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.85, 64]} />
        <meshStandardMaterial color="#f3ebdf" roughness={0.9} />
      </mesh>
    </group>
  );
}
