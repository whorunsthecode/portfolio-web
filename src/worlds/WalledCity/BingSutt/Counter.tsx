import * as THREE from 'three'
import { useMemo } from 'react'
import { BING_SUTT } from './index'

export function Counter() {
  // Counter sits along the BACK WALL side (x = BING_SUTT.backWallX), at
  // the FAR z end of the shop. Width runs along z, depth into x.
  const counterY = 0.95
  const counterX = BING_SUTT.backWallX - 0.35
  const counterZ = BING_SUTT.zFar + 0.55
  const counterLength = 1.6
  const counterDepth = 0.55

  // Wall menu papers — vertical red strips floor-to-ceiling above counter.
  // Single texture, not individual planes.
  const menuTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 256
    const ctx = c.getContext('2d')!
    // Darker wall behind the strips
    ctx.fillStyle = '#3a3530'
    ctx.fillRect(0, 0, 512, 256)
    const items = ['餐蛋麵 $8', '叉燒飯 $15', '西多士 $10', '凍檸茶 $6',
                   '鴛鴦 $7', '杏仁霜 $8', '菠蘿油 $5', '常餐 $15']
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = '#a01818'
      ctx.fillRect(20 + i * 60, 20, 50, 220)
      ctx.fillStyle = '#f0d860'
      ctx.font = 'bold 18px serif'
      ctx.save()
      ctx.translate(45 + i * 60, 45)
      ctx.rotate(Math.PI / 2)
      ctx.fillText(items[i], 0, 0)
      ctx.restore()
    }
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <group>
      {/* Counter slab (marble) */}
      <mesh position={[counterX, counterY, counterZ]}>
        <boxGeometry args={[counterDepth, 0.05, counterLength]} />
        <meshStandardMaterial color={'#e8e0d0'} roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Counter front panel (marble) */}
      <mesh position={[counterX + counterDepth / 2 - 0.025, counterY / 2, counterZ]}>
        <boxGeometry args={[0.04, counterY, counterLength]} />
        <meshStandardMaterial color={'#d8d0c0'} roughness={0.4} />
      </mesh>
      {/* Metal trim along the front edge */}
      <mesh position={[counterX + counterDepth / 2 - 0.01, counterY - 0.02, counterZ]}>
        <boxGeometry args={[0.02, 0.04, counterLength]} />
        <meshStandardMaterial color={'#a89888'} metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Glass display case (chest-height, multi-tier) */}
      <mesh position={[counterX, counterY + 0.25, counterZ]}>
        <boxGeometry args={[counterDepth - 0.05, 0.5, counterLength - 0.1]} />
        <meshStandardMaterial color={'#d8e8f0'} transparent opacity={0.4}
          roughness={0.1} metalness={0.1} />
      </mesh>

      {/* 9 instanced pastries inside the case (3 蛋撻, 3 菠蘿油, 3 雞尾包) */}
      <instancedMesh
        args={[undefined, undefined, 9]}
        ref={(ref) => {
          if (!ref) return
          const m = new THREE.Matrix4()
          for (let i = 0; i < 9; i++) {
            const row = Math.floor(i / 3)
            const col = i % 3
            m.makeTranslation(
              counterX + 0.05,
              counterY + 0.05 + row * 0.12,
              counterZ - counterLength / 2 + 0.2 + col * 0.5
            )
            ref.setMatrixAt(i, m)
          }
          ref.instanceMatrix.needsUpdate = true
        }}
      >
        <cylinderGeometry args={[0.05, 0.05, 0.04, 10]} />
        <meshStandardMaterial color={'#e8b048'} roughness={0.6} />
      </instancedMesh>

      {/* Warm interior glow inside the case */}
      <pointLight position={[counterX, counterY + 0.25, counterZ]}
        color={'#fff0b0'} intensity={0.5} distance={1} decay={2} />

      {/* Wall menu strips — single textured plane above the counter */}
      <mesh position={[BING_SUTT.backWallX - 0.005, 1.95, counterZ]}
        rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[counterLength, 1.4]} />
        <meshStandardMaterial map={menuTex} roughness={0.85} />
      </mesh>

      {/* Espresso/coffee setup — small dark box on the counter end */}
      <mesh position={[counterX, counterY + 0.1, counterZ + counterLength / 2 - 0.18]}>
        <boxGeometry args={[0.18, 0.2, 0.22]} />
        <meshStandardMaterial color={'#1a1410'} metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}
