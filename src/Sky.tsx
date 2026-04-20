import { useRef } from 'react'
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from './store'

const SkyMaterial = shaderMaterial(
  { uMode: 0 },
  /* vertex */
  `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
  `,
  /* fragment */
  `
  uniform float uMode;
  varying vec3 vWorldPosition;

  vec3 dayColors[5];
  vec3 nightColors[4];

  vec3 sampleDayGradient(float t) {
    dayColors[0] = vec3(0.353, 0.282, 0.455); // #5a4874
    dayColors[1] = vec3(0.722, 0.439, 0.345); // #b87058
    dayColors[2] = vec3(0.910, 0.596, 0.345); // #e89858
    dayColors[3] = vec3(0.957, 0.722, 0.408); // #f4b868
    dayColors[4] = vec3(0.957, 0.722, 0.376); // #f4b860 — dustier golden horizon

    float scaled = t * 4.0;
    int idx = int(floor(scaled));
    float frac = fract(scaled);
    if (idx >= 4) return dayColors[4];
    if (idx == 0) return mix(dayColors[0], dayColors[1], frac);
    if (idx == 1) return mix(dayColors[1], dayColors[2], frac);
    if (idx == 2) return mix(dayColors[2], dayColors[3], frac);
    return mix(dayColors[3], dayColors[4], frac);
  }

  vec3 sampleNightGradient(float t) {
    nightColors[0] = vec3(0.031, 0.024, 0.110); // #08061c
    nightColors[1] = vec3(0.102, 0.078, 0.208); // #1a1435
    nightColors[2] = vec3(0.157, 0.094, 0.251); // #281840
    nightColors[3] = vec3(0.227, 0.165, 0.333); // #3a2a55

    float scaled = t * 3.0;
    int idx = int(floor(scaled));
    float frac = fract(scaled);
    if (idx >= 3) return nightColors[3];
    if (idx == 0) return mix(nightColors[0], nightColors[1], frac);
    if (idx == 1) return mix(nightColors[1], nightColors[2], frac);
    return mix(nightColors[2], nightColors[3], frac);
  }

  void main() {
    vec3 dir = normalize(vWorldPosition);
    // t = 0 at horizon, 1 at zenith
    float t = clamp(dir.y * 1.2 + 0.1, 0.0, 1.0);

    vec3 dayColor = sampleDayGradient(t);
    vec3 nightColor = sampleNightGradient(t);
    vec3 sky = mix(dayColor, nightColor, uMode);

    // Sun disc (day) / Moon disc (night)
    vec3 sunDir = normalize(vec3(-0.3, 0.25, -0.8));
    float sunAngle = acos(clamp(dot(dir, sunDir), -1.0, 1.0));

    // Sun: warm glow
    float sunDisc = smoothstep(0.06, 0.02, sunAngle);
    float sunGlow = smoothstep(0.35, 0.05, sunAngle) * 0.3;
    vec3 sunColor = vec3(1.0, 0.85, 0.55);

    // Moon: cool white, smaller
    vec3 moonDir = normalize(vec3(0.2, 0.35, -0.7));
    float moonAngle = acos(clamp(dot(dir, moonDir), -1.0, 1.0));
    float moonDisc = smoothstep(0.04, 0.015, moonAngle);
    float moonGlow = smoothstep(0.2, 0.03, moonAngle) * 0.15;
    vec3 moonColor = vec3(0.75, 0.8, 0.95);

    // Blend celestial bodies by mode
    sky += (sunDisc + sunGlow) * sunColor * (1.0 - uMode);
    sky += (moonDisc + moonGlow) * moonColor * uMode;

    gl_FragColor = vec4(sky, 1.0);
  }
  `
)

extend({ SkyMaterial })

// Add type declaration for JSX
declare module '@react-three/fiber' {
  interface ThreeElements {
    skyMaterial: any
  }
}

export function Sky() {
  const matRef = useRef<THREE.ShaderMaterial & { uMode: number }>(null)
  const mode = useStore((s) => s.mode)
  const target = mode === 'night' ? 1 : 0

  useFrame((_, delta) => {
    if (!matRef.current) return
    const current = matRef.current.uMode
    const speed = 1.25 // ~800ms transition
    if (Math.abs(current - target) > 0.001) {
      matRef.current.uMode += (target - current) * Math.min(speed * delta * 5, 1)
    }
  })

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[100, 32, 32]} />
      <skyMaterial ref={matRef} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  )
}
