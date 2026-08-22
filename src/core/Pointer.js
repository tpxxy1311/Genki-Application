/**
 * The one place mouse position is read. Both the WebGL logo and the DOM cursor
 * consume this, which keeps them perfectly in sync and costs a single listener.
 *
 *   x, y  -> normalised -1..1, origin at the centre of the viewport
 *   px, py -> raw client pixels
 */
class Pointer {
  constructor() {
    this.x = 0
    this.y = 0
    this.px = innerWidth / 2
    this.py = innerHeight / 2
    this.hasMoved = false

    addEventListener('pointermove', this.onMove, { passive: true })
    // Reset toward centre when the cursor leaves, so the logo settles instead
    // of freezing at whatever angle the mouse exited on.
    addEventListener('pointerleave', this.onLeave, { passive: true })
  }

  onMove = (e) => {
    this.px = e.clientX
    this.py = e.clientY
    this.x = (e.clientX / innerWidth) * 2 - 1
    this.y = -((e.clientY / innerHeight) * 2 - 1)
    this.hasMoved = true
  }

  onLeave = () => {
    this.x = 0
    this.y = 0
  }
}

export const pointer = new Pointer()
