import { CONFIG } from '@/config.js'

/**
 * Single source of truth for size / dpr. Everything that needs to react to a
 * resize subscribes here instead of adding its own listener, so the reads all
 * happen once per resize rather than once per module.
 */
class Viewport {
  constructor() {
    this.width = 0
    this.height = 0
    this.aspect = 1
    this.dpr = 1
    this.callbacks = new Set()

    this.measure()
    addEventListener('resize', this.onResize, { passive: true })
  }

  measure() {
    this.width = innerWidth
    this.height = innerHeight
    this.aspect = this.width / this.height
    this.dpr = Math.min(devicePixelRatio || 1, CONFIG.renderer.maxDpr)
  }

  onResize = () => {
    this.measure()
    this.callbacks.forEach((cb) => cb(this))
  }

  onChange(cb) {
    this.callbacks.add(cb)
    return () => this.callbacks.delete(cb)
  }
}

export const viewport = new Viewport()
