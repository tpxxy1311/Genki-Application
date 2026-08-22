import { CONFIG } from '@/config.js'
import { pointer } from '@/core/Pointer.js'
import { damp } from '@/utils/math.js'
import { prefersReducedMotion, hasFinePointer } from '@/utils/env.js'

/**
 * Custom cursor. Only ever writes `transform` and `scale`, both of which the
 * compositor handles on its own thread -- writing `left`/`top` would force a
 * layout on every frame.
 */
export class Cursor {
  constructor(el) {
    this.el = el
    this.x = pointer.px
    this.y = pointer.py
    this.scale = 1
    this.targetScale = 1
    this.enabled = false
  }

  mount() {
    // No native cursor to replace on touch, and hiding it there would strand
    // anyone on a tablet with a keyboard.
    if (!hasFinePointer()) return this

    this.enabled = true
    document.documentElement.classList.add('has-custom-cursor')
    return this
  }

  setState(state) {
    if (!this.enabled) return
    this.targetScale = state === 'hover' ? CONFIG.cursor.hoverScale : 1
    this.el.classList.toggle('cursor--hover', state === 'hover')
  }

  update(dt) {
    if (!this.enabled) return

    // Reduced motion: snap rather than trail, so the cursor never lags behind
    // the real pointer position.
    const lambda = prefersReducedMotion() ? 1e3 : CONFIG.cursor.damping

    this.x = damp(this.x, pointer.px, lambda, dt)
    this.y = damp(this.y, pointer.py, lambda, dt)
    this.scale = damp(this.scale, this.targetScale, lambda, dt)

    this.el.style.transform =
      `translate3d(${this.x}px, ${this.y}px, 0) translate(-50%, -50%) scale(${this.scale})`
  }
}
