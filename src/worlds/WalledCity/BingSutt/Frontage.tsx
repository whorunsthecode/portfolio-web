import * as THREE from 'three'
import { useMemo } from 'react'
import { BING_SUTT } from './index'

export function Frontage() {
  const length = Math.abs(BING_SUTT.zFar - BING_SUTT.zNear)

  // Calligraphic menu papers plastered on the glass door
  const menuTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256; c.height = 512
    const ctx = c.getContext('2d')!
    // Glass tint with low opacity
    ctx.fillStyle = 'rgba(180, 200, 180, 0.3)'
    ctx.fillRect(0, 0, 256, 512)
    // 7 vertical menu strips, plastered red over carbon paper
    const items = ['餐蛋麵 $8', '叉燒飯 $15', '西多士 $10', '凍檸茶 $6',
                   '鴛鴦 $7', '杏仁霜 $8', '菠蘿油 $5']
    items.forEach((_, i) => {
      ctx.fillStyle = '#ddd0b8'
      ctx.fillRect(20 + i * 30, 50, 26, 220)
    })
    ctx.fillStyle = '#a01818'
    ctx.font = 'bold 16px serif'
    items.forEach((text, i) => {
      ctx.save()
      ctx.translate(33 + i * 30, 70)
      ctx.rotate(Math.PI / 2)
      ctx.fillText(text, 0, 0)
      ctx.restore()
    })
    return new THREE.CanvasTexture(c)
  }, [])

  // Vertical "強記冰室" sign hanging perpendicular over the doorway
  const signTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 96; c.height = 256
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#a01818'
    ctx.fillRect(0, 0, 96, 256)
    ctx.fillStyle = '#f0d860'
    ctx.font = 'bold 56px serif'
    ctx.textAlign = 'center'
    const chars = ['強', '記', '冰', '室']
    chars.forEach((ch, i) => ctx.fillText(ch, 48, 60 + i * 56))
    return new THREE.CanvasTexture(c)
  }, [])

  // "歡迎光臨" red banner inside above the entrance
  const bannerTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 80
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#a01818'
    ctx.fillRect(0, 0, 512, 80)
    ctx.fillStyle = '#f0d860'
    ctx.font = 'bold 56px serif'
    ctx.textAlign = 'center'
    ctx.fillText('歡 迎 光 臨', 256, 60)
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <group>
      {/* Green steel top horizontal frame — kept (above the doorway, doesn't
          block sight lines from the alley) */}
      <mesh position={[BING_SUTT.doorwayX + 0.05, 2.6, BING_SUTT.zMid]}>
        <boxGeometry args={[0.1, 0.15, length + 0.1]} />
        <meshStandardMaterial color={'#2a5a3a'} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Floor sill — short kick rail at the threshold */}
      <mesh position={[BING_SUTT.doorwayX + 0.05, 0.06, BING_SUTT.zMid]}>
        <boxGeometry args={[0.1, 0.12, length]} />
        <meshStandardMaterial color={'#2a5a3a'} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Two slim vertical mullions at the ends of the storefront — frames
          the doorway visually without walling it off. */}
      {[BING_SUTT.zNear, BING_SUTT.zFar].map((z) => (
        <mesh key={z} position={[BING_SUTT.doorwayX + 0.05, 1.34, z]}>
          <boxGeometry args={[0.08, 2.55, 0.08]} />
          <meshStandardMaterial color={'#2a5a3a'} roughness={0.6} metalness={0.3} />
        </mesh>
      ))}

      {/* Sliding glass door — half-open. The FAR half has clear glass with
          a few menu strips so the interior is still visible through it;
          the NEAR half is fully open so the player walks in. */}
      <mesh
        position={[BING_SUTT.doorwayX + 0.04, 1.4, BING_SUTT.zFar + length * 0.25]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[length * 0.5, 2.4]} />
        <meshStandardMaterial map={menuTex} transparent opacity={0.35}
          roughness={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Vertical "強記冰室" sign hanging perpendicular over the doorway.
          Plane size matches the canvas (96:256 ≈ 3:8) so the four stacked
          characters render at their drawn aspect instead of being squished
          into a wide rectangle (which made them unreadable). */}
      <mesh position={[BING_SUTT.doorwayX - 0.5, 1.6, BING_SUTT.zNear - 0.1]}
        rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.36, 0.95]} />
        <meshStandardMaterial map={signTex} side={THREE.DoubleSide}
          emissive={'#a01818'} emissiveIntensity={0.3} />
      </mesh>

      {/* "歡迎光臨" red banner inside, above entrance */}
      <mesh position={[BING_SUTT.doorwayX + 0.3, 2.45, BING_SUTT.zMid]}
        rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[length - 0.4, 0.25]} />
        <meshStandardMaterial map={bannerTex} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
