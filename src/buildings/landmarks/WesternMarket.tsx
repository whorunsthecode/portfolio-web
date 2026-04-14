import { useMemo } from 'react'
import * as THREE from 'three'
import CustomShaderMaterial from 'three-custom-shader-material'
import { useStore } from '../../store'
import { makeTextTexture } from '../../cabin/TextTexture'

/**
 * Western Market — colonial red brick building.
 * Procedural brick texture shader, white stone entablature,
 * arched windows (2 rows × 5), ground-floor arcade (3 arches).
 */

const brickVertex = `
  varying vec2 vBrickUv;
  void main() {
    vBrickUv = uv;
  }
`

const brickFragment = `
  uniform vec3 uBrickColor;
  uniform vec3 uMortarColor;
  uniform float uLitFraction;
  uniform float uSeed;
  varying vec2 vBrickUv;

  float hash(vec2 p) {
    return fract(sin(dot(p + uSeed, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = vBrickUv;

    // Brick pattern
    float rowH = 0.025;
    float brickW = 0.06;
    float row = floor(uv.y / rowH);
    float offset = mod(row, 2.0) * 0.5 * brickW;
    float col = floor((uv.x + offset) / brickW);

    float mortarX = fract((uv.x + offset) / brickW);
    float mortarY = fract(uv.y / rowH);

    // Mortar lines
    float isMortar = 1.0 - step(0.06, mortarX) * step(mortarX, 0.94) *
                           step(0.08, mortarY) * step(mortarY, 0.92);

    // Per-brick color variation
    float brickVar = hash(vec2(col, row)) * 0.08 - 0.04;
    vec3 brick = uBrickColor + brickVar;

    vec3 color = mix(brick, uMortarColor, isMortar * 0.7);

    // Window band areas (two rows of arched windows)
    // Row 1: y 0.35-0.55, Row 2: y 0.60-0.80
    float inWinRow = 0.0;
    for (int r = 0; r < 2; r++) {
      float bandBot = (r == 0) ? 0.35 : 0.60;
      float bandTop = bandBot + 0.18;
      if (uv.y > bandBot && uv.y < bandTop) {
        // 5 windows across
        float winX = fract(uv.x * 5.0);
        float winY = (uv.y - bandBot) / (bandTop - bandBot);
        // Arch shape: semicircle top
        float archTop = 1.0 - 2.0 * pow(winX - 0.5, 2.0) * 3.0;
        if (winX > 0.15 && winX < 0.85 && winY < archTop && winY > 0.1) {
          inWinRow = 1.0;
          // Lit windows at night
          float wHash = hash(vec2(float(r), floor(uv.x * 5.0)));
          float isLit = step(1.0 - uLitFraction, wHash);
          vec3 litColor = mix(vec3(0.15, 0.1, 0.08), vec3(1.0, 0.84, 0.55), isLit);
          color = litColor;
        }
      }
    }

    // Ground floor arcade (bottom 20%)
    if (uv.y < 0.20) {
      float arcadeX = fract(uv.x * 3.0);
      float arcadeY = uv.y / 0.20;
      // Three arched openings
      float archShape = 1.0 - 3.0 * pow(arcadeX - 0.5, 2.0);
      if (arcadeX > 0.12 && arcadeX < 0.88 && arcadeY < archShape * 0.9 && arcadeY > 0.05) {
        color = vec3(0.06, 0.04, 0.03); // dark interior
      }
    }

    csm_DiffuseColor = vec4(color, 1.0);
  }
`

export function WesternMarket() {
  const mode = useStore((s) => s.mode)

  const uniforms = useMemo(() => ({
    uBrickColor: { value: new THREE.Vector3(0.65, 0.28, 0.18) }, // red brick
    uMortarColor: { value: new THREE.Vector3(0.85, 0.82, 0.78) },
    uLitFraction: { value: mode === 'night' ? 0.6 : 0 },
    uSeed: { value: 601 },
  }), [])

  const entablatureTex = useMemo(() => makeTextTexture({
    text: 'WESTERN MARKET · 1906',
    fontSize: 36,
    color: '#3a3028',
    width: 512,
    height: 64,
  }), [])

  return (
    <group>
      {/* Main building body */}
      <mesh position={[0, 11, 0]} castShadow receiveShadow>
        <boxGeometry args={[16, 22, 12]} />
        <CustomShaderMaterial
          baseMaterial={THREE.MeshStandardMaterial}
          vertexShader={brickVertex}
          fragmentShader={brickFragment}
          uniforms={uniforms}
          roughness={0.9}
        />
      </mesh>

      {/* White stone entablature at top */}
      <mesh position={[0, 22.5, 0]}>
        <boxGeometry args={[17, 1.5, 12.5]} />
        <meshStandardMaterial color="#e8e2d8" roughness={0.75} />
      </mesh>

      {/* Entablature text — front face */}
      <mesh position={[0, 22.5, 6.3]}>
        <planeGeometry args={[8, 1]} />
        <meshStandardMaterial map={entablatureTex} transparent roughness={0.75} />
      </mesh>

      {/* Corner pilasters */}
      {[
        [-8.2, 0, -6.2], [8.2, 0, -6.2],
        [-8.2, 0, 6.2], [8.2, 0, 6.2],
      ].map(([x, _, z], i) => (
        <mesh key={i} position={[x, 11, z]} castShadow>
          <boxGeometry args={[0.8, 22, 0.8]} />
          <meshStandardMaterial color="#d4cdc0" roughness={0.8} />
        </mesh>
      ))}

      {/* Cornice detail strip below entablature */}
      <mesh position={[0, 21.6, 0]}>
        <boxGeometry args={[16.5, 0.3, 12.3]} />
        <meshStandardMaterial color="#d8d0c4" roughness={0.8} />
      </mesh>
    </group>
  )
}
