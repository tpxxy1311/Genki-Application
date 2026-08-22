import { PerspectiveCamera } from 'three'
import { CONFIG } from '@/config.js'
import { viewport } from '@/core/Viewport.js'

export function createCamera() {
  const { fov, near, far, distance } = CONFIG.camera
  const camera = new PerspectiveCamera(fov, viewport.aspect, near, far)
  camera.position.set(0, 0, distance)
  camera.lookAt(0, 0, 0)
  return camera
}
