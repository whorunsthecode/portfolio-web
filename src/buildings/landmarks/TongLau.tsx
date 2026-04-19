import { useMemo } from 'react'
import * as THREE from 'three'
import CustomShaderMaterial from 'three-custom-shader-material'
import { useStore } from '../../store'
import { InfoTag } from '../../scene/components/InfoTag'

/**
 * Tong lau — old HK walk-up tenements.
 * Lower, narrower than Central tenements. More color variety.
 * Balconies with iron railings, tiled facades.
 */

const tongLauVertex = `
  varying vec2 vUv;
  void main() { vUv = uv; }
`

const tongLauFragment = `
  uniform vec3 uColor;
  uniform float uSeed;
  uniform float uLitFraction;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p + uSeed, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;
    float floors = 4.0;
    float cols = 4.0;

    float floorIdx = floor(uv.y * floors);
    float floorFrac = fract(uv.y * floors);
    float colIdx = floor(uv.x * cols);
    float colFrac = fract(uv.x * cols);

    // Tile pattern on wall
    float tileX = fract(uv.x * 20.0);
    float tileY = fract(uv.y * 30.0);
    float tileLine = step(0.95, tileX) + step(0.95, tileY);
    vec3 wall = uColor - tileLine * 0.05;

    // Windows with balcony rail below
    float winL = step(0.2, colFrac) * (1.0 - step(0.8, colFrac));
    float winB = step(0.3, floorFrac) * (1.0 - step(0.8, floorFrac));
    float isWindow = winL * winB;

    // Balcony rail — thin line below window
    float railLine = step(0.25, floorFrac) * (1.0 - step(0.32, floorFrac)) * winL;

    float wHash = hash(vec2(colIdx, floorIdx));
    float isLit = step(1.0 - uLitFraction, wHash);
    vec3 litColor = mix(vec3(1.0, 0.84, 0.55), vec3(0.7, 0.86, 1.0), step(0.8, hash(vec2(colIdx + 5.0, floorIdx))));
    vec3 dimWin = uColor * 0.3;
    vec3 winColor = mix(dimWin, litColor, isLit);

    vec3 color = mix(wall, winColor, isWindow);
    color = mix(color, vec3(0.25, 0.22, 0.20), railLine); // iron railing

    // Ground floor shop
    float shopBand = 1.0 - smoothstep(0.0, 0.15, uv.y);
    color = mix(color, uColor * 0.3, shopBand * 0.7);

    csm_DiffuseColor = vec4(color, 1.0);
  }
`

const TONG_LAU_COLORS: [number, number, number][] = [
  [0.75, 0.60, 0.50],  // terracotta
  [0.55, 0.68, 0.62],  // jade green
  [0.72, 0.68, 0.55],  // mustard
  [0.60, 0.55, 0.65],  // lavender grey
  [0.78, 0.72, 0.60],  // cream
]

function TongLauBuilding({ x, z, seed, color }: {
  x: number; z: number; seed: number; color: [number, number, number]
}) {
  const mode = useStore((s) => s.mode)
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Vector3(...color) },
    uSeed: { value: seed * 0.1 },
    uLitFraction: { value: mode === 'night' ? 0.6 : 0 },
  }), [])

  const height = 12 + (seed % 3) * 2

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, height, 5]} />
        <CustomShaderMaterial
          baseMaterial={THREE.MeshStandardMaterial}
          vertexShader={tongLauVertex}
          fragmentShader={tongLauFragment}
          uniforms={uniforms}
          roughness={0.85}
        />
      </mesh>
      {/* Roof */}
      <mesh position={[0, height + 0.05, 0]}>
        <boxGeometry args={[6.3, 0.1, 5.3]} />
        <meshStandardMaterial color="#6a6a6a" roughness={0.9} />
      </mesh>
    </group>
  )
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function TongLau() {
  const r = seededRandom(800)
  const buildings = useMemo(() => {
    const rr = seededRandom(800)
    return Array.from({ length: 8 }, (_, i) => ({
      x: (i % 2 === 0 ? -1 : 1) * (7 + rr() * 2),
      z: -i * 4 + rr() * 2,
      seed: 800 + i,
      color: TONG_LAU_COLORS[Math.floor(rr() * TONG_LAU_COLORS.length)],
    }))
  }, [])

  return (
    <group>
      {buildings.map((b, i) => (
        <TongLauBuilding key={i} x={b.x} z={b.z} seed={b.seed} color={b.color} />
      ))}
      <InfoTag
        label="Tong lau · pre-war walk-up"
        offset={[buildings[0].x, 10, buildings[0].z]}
      />
    </group>
  )
}
