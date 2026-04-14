import { useMemo } from 'react'
import * as THREE from 'three'
import { makeTextTexture } from './TextTexture'

const BRASS = '#d4b880'
const LEATHER = '#4a2818'
const CREAM = '#f0e6d0'
const DARK_GREEN = '#1a3a24'
const RED = '#c0392b'

/* ── Brass overhead rail — full cabin length ───────────── */
function OverheadRail() {
  return (
    <mesh position={[0, 2.35, -3]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.018, 0.018, 10, 12]} />
      <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.25} />
    </mesh>
  )
}

/* ── Hanging leather straps — NOT near windshield ──────── */
function HangingStraps() {
  // Skip z=-7 and z=-9 (too close to windshield, block the view)
  const zPositions = [-1, -3, -5]
  return (
    <>
      {zPositions.map((z) => (
        <group key={z} position={[0, 2.35, z]}>
          {/* Leather strip */}
          <mesh position={[0, -0.12, 0]}>
            <boxGeometry args={[0.025, 0.22, 0.008]} />
            <meshStandardMaterial color={LEATHER} roughness={0.9} />
          </mesh>
          {/* Torus loop */}
          <mesh position={[0, -0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.045, 0.008, 8, 16]} />
            <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </>
  )
}

/* ── Route poster on left wall ─────────────────────────── */
function RoutePoster() {
  const tex = useMemo(() => makeTextTexture({
    text: 'HONG KONG TRAMWAYS · Since 1904',
    fontSize: 32,
    color: DARK_GREEN,
    width: 768,
    height: 128,
  }), [])

  return (
    <group position={[-1.07, 1.6, -4]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[1.6, 0.35]} />
        <meshStandardMaterial color={CREAM} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[1.5, 0.25]} />
        <meshStandardMaterial map={tex} transparent roughness={0.8} />
      </mesh>
    </group>
  )
}

/* ── Tram number plate "88" ────────────────────────────── */
function NumberPlate() {
  const tex = useMemo(() => makeTextTexture({
    text: '88',
    fontSize: 72,
    color: DARK_GREEN,
    width: 128,
    height: 128,
  }), [])

  return (
    <group position={[-0.75, 1.0, -9.96]}>
      <mesh>
        <planeGeometry args={[0.28, 0.18]} />
        <meshStandardMaterial color={CREAM} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[0.2, 0.16]} />
        <meshStandardMaterial map={tex} transparent />
      </mesh>
    </group>
  )
}

/* ── Red emergency hammer square ───────────────────────── */
function EmergencyHammer() {
  return (
    <group position={[0.75, 1.0, -9.96]}>
      <mesh>
        <planeGeometry args={[0.18, 0.18]} />
        <meshStandardMaterial color={RED} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[0.08, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[0.02, 0.08]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

export function CabinDetails() {
  return (
    <group>
      <OverheadRail />
      <HangingStraps />
      <RoutePoster />
      <NumberPlate />
      <EmergencyHammer />
    </group>
  )
}
