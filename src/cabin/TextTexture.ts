import * as THREE from 'three'

interface TextTexOpts {
  text: string
  fontSize?: number
  color?: string
  fontFamily?: string
  width?: number
  height?: number
  background?: string
}

export function makeTextTexture({
  text,
  fontSize = 48,
  color = '#1a1a1a',
  fontFamily = 'Georgia, "Times New Roman", serif',
  width = 512,
  height = 128,
  background = 'transparent',
}: TextTexOpts): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  if (background !== 'transparent') {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, width, height)
  } else {
    ctx.clearRect(0, 0, width, height)
  }

  ctx.fillStyle = color
  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, width / 2, height / 2)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}
