import { Text } from '@react-three/drei'

const POLE_GREEN = '#2a4838'
const POLE_CREAM = '#f0e6c8'
const SIGN_GREEN = '#1a3828'
const SIGN_TEXT = '#f4ead4'

/**
 * Iconic HK tram pole-mounted stop sign — tall green pole with a circular
 * double-sided dark green sign showing tram silhouette, stop name in
 * English + Chinese, and route number. Positioned at one end of the
 * refuge island.
 */
export function StopPole() {
  return (
    <group position={[0, 0.2, -3.5]}>
      {/* === POLE BASE === */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.16, 10]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.7} />
      </mesh>

      {/* === MAIN POLE — green steel === */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 2.8, 10]} />
        <meshStandardMaterial color={POLE_GREEN} roughness={0.7} />
      </mesh>

      {/* Cream painted band 2/3 up (vintage identifier) */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.15, 10]} />
        <meshStandardMaterial color={POLE_CREAM} roughness={0.8} />
      </mesh>

      {/* === CIRCULAR STOP SIGN (double-sided) === */}
      <group position={[0, 3.2, 0]}>
        {/* Cream outer plate */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 24]} />
          <meshStandardMaterial color={POLE_CREAM} roughness={0.7} />
        </mesh>

        {/* Front face — dark green */}
        <mesh position={[0, 0, 0.025]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.01, 24]} />
          <meshStandardMaterial color={SIGN_GREEN} roughness={0.6} />
        </mesh>

        {/* Tiny tram silhouette on front */}
        <group position={[0, 0.12, 0.032]}>
          <mesh position={[0, -0.008, 0]}>
            <boxGeometry args={[0.2, 0.03, 0.005]} />
            <meshStandardMaterial color={SIGN_TEXT} />
          </mesh>
          <mesh position={[0, 0.025, 0]}>
            <boxGeometry args={[0.18, 0.028, 0.005]} />
            <meshStandardMaterial color={SIGN_TEXT} />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <boxGeometry args={[0.005, 0.04, 0.005]} />
            <meshStandardMaterial color={SIGN_TEXT} />
          </mesh>
        </group>

        {/* Front text */}
        <Text
          position={[0, 0.02, 0.035]}
          fontSize={0.055}
          color={SIGN_TEXT}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          TERMINUS
        </Text>
        <Text
          position={[0, -0.05, 0.035]}
          fontSize={0.045}
          color={SIGN_TEXT}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          終點站
        </Text>
        <Text
          position={[0, -0.15, 0.035]}
          fontSize={0.04}
          color={SIGN_TEXT}
          anchorX="center"
          anchorY="middle"
        >
          88
        </Text>

        {/* Back face — dark green */}
        <mesh position={[0, 0, -0.025]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.01, 24]} />
          <meshStandardMaterial color={SIGN_GREEN} roughness={0.6} />
        </mesh>

        {/* Back text (mirrored for readability from other side) */}
        <Text
          position={[0, 0.02, -0.035]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.055}
          color={SIGN_TEXT}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          TERMINUS
        </Text>
        <Text
          position={[0, -0.05, -0.035]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.045}
          color={SIGN_TEXT}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          終點站
        </Text>
      </group>

      {/* Small banner/flag below sign */}
      <mesh position={[0, 2.85, 0]}>
        <boxGeometry args={[0.04, 0.2, 0.015]} />
        <meshStandardMaterial color={POLE_CREAM} />
      </mesh>
    </group>
  )
}
