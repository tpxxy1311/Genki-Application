import { WebGLRenderer, ACESFilmicToneMapping } from 'three'
import { viewport } from '@/core/Viewport.js'

export function createRenderer(canvas) {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true, // let the page background show through
    powerPreference: 'high-performance',
  })

  renderer.setPixelRatio(viewport.dpr)
  renderer.setSize(viewport.width, viewport.height)
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.85

  return renderer
}
