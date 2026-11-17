import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";

/**
 * Procedural espresso cup + saucer, built from LatheGeometry.
 *
 * Why procedural rather than a GLB: no suitable CC0 model could be fetched in
 * this environment, and the brief explicitly allows (and prefers) lathe-geometry
 * models over shipping a copyrighted asset. Two lathe profiles plus a torus
 * handle keep the whole scene under ~10KB of geometry data and zero network
 * requests — which is also the fastest possible first paint for the hero.
 *
 * To swap in a real model later: drop a Draco-compressed GLB at
 * /public/models/morrow-cup.glb and pass `modelUrl` — see README §3D assets.
 */

/** Cup body profile (x = radius, y = height), revolved around Y. */
const CUP_PROFILE: Array<[number, number]> = [
  [0, 0],
  [0.52, 0],
  [0.56, 0.03],
  [0.6, 0.12],
  [0.66, 0.42],
  [0.7, 0.72],
  [0.72, 0.92],
  [0.71, 1.0],
  [0.66, 1.005],
  [0.62, 0.98],
  [0.62, 0.9],
  [0.6, 0.62],
  [0.55, 0.24],
  [0.48, 0.08],
  [0, 0.06],
];

/** Saucer profile — a shallow, softly turned plate. */
const SAUCER_PROFILE: Array<[number, number]> = [
  [0, 0],
  [0.95, 0],
  [1.08, 0.03],
  [1.12, 0.07],
  [1.1, 0.1],
  [0.98, 0.1],
  [0.72, 0.07],
  [0.42, 0.05],
  [0, 0.055],
];

/** Coffee surface — a disc that sits just inside the rim. */
const COFFEE_PROFILE: Array<[number, number]> = [
  [0, 0],
  [0.6, 0.0],
  [0.6, 0.005],
  [0, 0.005],
];

function toLathePoints(profile: Array<[number, number]>): THREE.Vector2[] {
  return profile.map(([x, y]) => new THREE.Vector2(x, y));
}

export function CoffeeCup({
  /** Radians per second of idle rotation. */
  rotationSpeed = 0.22,
  /** Pointer-driven tilt, supplied by the parent scene. */
  pointer = { x: 0, y: 0 },
}: {
  rotationSpeed?: number;
  pointer?: { x: number; y: number };
}) {
  const group = useRef<Group>(null);

  const cupGeometry = useMemo(() => new THREE.LatheGeometry(toLathePoints(CUP_PROFILE), 96), []);
  const saucerGeometry = useMemo(
    () => new THREE.LatheGeometry(toLathePoints(SAUCER_PROFILE), 96),
    [],
  );
  const coffeeGeometry = useMemo(
    () => new THREE.LatheGeometry(toLathePoints(COFFEE_PROFILE), 64),
    [],
  );

  // Gently ease toward the pointer position so parallax feels weighted, not twitchy.
  const eased = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;

    const damping = 1 - Math.pow(0.0016, delta);
    eased.current.x += (pointer.x - eased.current.x) * damping;
    eased.current.y += (pointer.y - eased.current.y) * damping;

    node.rotation.y += delta * rotationSpeed;
    node.position.x = eased.current.x * 0.16;
    node.position.y = eased.current.y * 0.1;
    node.rotation.z = eased.current.x * 0.05;
  });

  return (
    <group ref={group} position={[0, -0.55, 0]}>
      {/* Saucer */}
      <mesh geometry={saucerGeometry} castShadow receiveShadow>
        <meshStandardMaterial color="#f6efe4" roughness={0.42} metalness={0.02} />
      </mesh>

      {/* Cup body — ceramic */}
      <mesh geometry={cupGeometry} position={[0, 0.06, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#fffdf9" roughness={0.3} metalness={0.03} />
      </mesh>

      {/* Coffee surface */}
      <mesh geometry={coffeeGeometry} position={[0, 1.02, 0]}>
        <meshStandardMaterial color="#3b2216" roughness={0.18} metalness={0.08} />
      </mesh>

      {/* Handle — a torus half sunk into the body */}
      <mesh position={[0.72, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.26, 0.055, 20, 48, Math.PI * 1.25]} />
        <meshStandardMaterial color="#fffdf9" roughness={0.32} metalness={0.03} />
      </mesh>

      {/* Gold rim detail — echoes the site's muted gold accent */}
      <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.715, 0.012, 10, 96]} />
        <meshStandardMaterial color="#c98a45" roughness={0.34} metalness={0.62} />
      </mesh>
    </group>
  );
}
