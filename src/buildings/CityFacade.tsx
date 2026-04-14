import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import CustomShaderMaterial from 'three-custom-shader-material'
import { cityFacadeVertex, cityFacadeFragment } from './cityFacadeShader'
import { useStore } from '../store'

export interface CityFacadeProps {
  baseColor: [number, number, number]
  windowDensityX?: number
  windowDensityY?: number
  bandSpacing?: number
  bracingType?: 0 | 1 | 2 | 3  // 0=none, 1=X per tier, 2=full X, 3=diagonal
  bracingColor?: [number, number, number]
  bracingWidth?: number
  tiers?: number
  windowTint?: [number, number, number]
  panelAlternate?: boolean
  seed?: number
  nightLitFraction?: number
  roughness?: number
  metalness?: number
}

export function useCityFacadeMaterial(props: CityFacadeProps) {
  const {
    baseColor,
    windowDensityX = 6,
    windowDensityY = 10,
    bandSpacing = 0,
    bracingType = 0,
    bracingColor = [0.8, 0.8, 0.8],
    bracingWidth = 0.025,
    tiers = 4,
    windowTint = [0.35, 0.4, 0.5],
    panelAlternate = false,
    seed = 1,
    nightLitFraction = 0.65,
    roughness = 0.8,
    metalness = 0.1,
  } = props

  const matRef = useRef<any>(null)
  const mode = useStore((s) => s.mode)
  const targetLit = mode === 'night' ? nightLitFraction : 0
  const currentLit = useRef(mode === 'night' ? nightLitFraction : 0)

  useFrame((_, delta) => {
    if (!matRef.current) return
    const diff = targetLit - currentLit.current
    if (Math.abs(diff) > 0.001) {
      currentLit.current += diff * Math.min(12 * delta, 1)
      matRef.current.uniforms.uLitFraction.value = currentLit.current
    }
  })

  const uniforms = useMemo(() => ({
    uBaseColor: { value: new THREE.Vector3(...baseColor) },
    uWindowDensityX: { value: windowDensityX },
    uWindowDensityY: { value: windowDensityY },
    uBandSpacing: { value: bandSpacing },
    uLitFraction: { value: mode === 'night' ? nightLitFraction : 0 },
    uSeed: { value: seed },
    uBracingType: { value: bracingType },
    uBracingColor: { value: new THREE.Vector3(...bracingColor) },
    uBracingWidth: { value: bracingWidth },
    uTiers: { value: tiers },
    uWindowTint: { value: new THREE.Vector3(...windowTint) },
    uPanelAlternate: { value: panelAlternate ? 1 : 0 },
  }), [])

  return { matRef, uniforms, roughness, metalness }
}

export function CityFacadeMaterial({ matProps }: {
  matProps: ReturnType<typeof useCityFacadeMaterial>
}) {
  return (
    <CustomShaderMaterial
      ref={matProps.matRef}
      baseMaterial={THREE.MeshStandardMaterial}
      vertexShader={cityFacadeVertex}
      fragmentShader={cityFacadeFragment}
      uniforms={matProps.uniforms}
      roughness={matProps.roughness}
      metalness={matProps.metalness}
    />
  )
}
