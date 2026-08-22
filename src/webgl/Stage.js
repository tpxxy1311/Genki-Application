import { Scene } from 'three'
import { createRenderer } from './Renderer.js'
import { createCamera } from './Camera.js'
import { setupLights } from './Lights.js'
import { Logo } from './objects/Logo.js'
import { viewport } from '@/core/Viewport.js'

export class Stage {
  constructor(canvas) {
    this.scene = new Scene()
    this.renderer = createRenderer(canvas)
    this.camera = createCamera()
    this.disposeLights = setupLights(this.scene, this.renderer)

    this.logo = new Logo()
    this.scene.add(this.logo.root)

    viewport.onChange(this.resize)
  }

  async load() {
    await this.logo.load()
    document.documentElement.classList.add('is-loaded')
  }

  resize = ({ width, height, aspect, dpr }) => {
    this.camera.aspect = aspect
    this.camera.updateProjectionMatrix()
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(width, height)
  }

  update(dt) {
    this.logo.update(dt)
    this.renderer.render(this.scene, this.camera)
  }
}
