import { CONFIG } from '@/config.js'
import { pointer } from '@/core/Pointer.js'
import { damp } from '@/utils/math.js'
import { prefersReducedMotion, hasFinePointer } from '@/utils/env.js'

/**
 * Custom cursor. Der Container traegt die Position des Rings, der Punkt
 * darin laeuft mit einer eigenen, traegeren Daempfung hinterher. Wie die
 * beiden Kreise aussehen, entscheidet allein die .cursor--hover-Klasse.
 *
 * Schreibt nur `transform` und `translate` -- der Compositor erledigt beide
 * auf seinem eigenen Thread, waehrend `left`/`top` jeden Frame ein Layout
 * ausloesen wuerden.
 */
export class Cursor {
  constructor(el) {
    this.el = el
    this.dot = el.querySelector('.cursor__dot')

    this.x = pointer.px
    this.y = pointer.py

    // Zweite, unabhaengig gedaempfte Position. Startet auf demselben Punkt,
    // damit der Nachlauf beim ersten Frame nicht aus dem Nichts einschwingt.
    this.dotX = this.x
    this.dotY = this.y

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
    // Kein gedaempfter Scale mehr auf dem Container: der wuerde beide Kreise
    // gleichzeitig groesser ziehen. Hier soll der innere aufgehen, waehrend
    // der aeussere nach innen wegfaellt -- zwei gegenlaeufige Bewegungen, die
    // jeder Kreis fuer sich als CSS-Transition faehrt.
    this.el.classList.toggle('cursor--hover', state === 'hover')
  }

  update(dt) {
    if (!this.enabled) return

    // Reduced motion: snap rather than trail, so the cursor never lags behind
    // the real pointer position.
    const reduced = prefersReducedMotion()
    const lambda = reduced ? 1e3 : CONFIG.cursor.damping
    const dotLambda = reduced ? 1e3 : CONFIG.cursor.dotDamping

    this.x = damp(this.x, pointer.px, lambda, dt)
    this.y = damp(this.y, pointer.py, lambda, dt)
    this.dotX = damp(this.dotX, pointer.px, dotLambda, dt)
    this.dotY = damp(this.dotY, pointer.py, dotLambda, dt)

    this.el.style.transform =
      `translate3d(${this.x}px, ${this.y}px, 0) translate(-50%, -50%)`

    // Bewusst die eigenstaendige `translate`-Eigenschaft statt `transform`:
    // im transform des Punktes stehen schon Zentrierung und Zustands-Scale,
    // die per CSS-Transition laufen -- ein Frame-Schreiben darauf wuerde
    // beides ueberbuegeln. Die Reihenfolge translate -> scale -> transform
    // sorgt ausserdem dafuer, dass der Versatz in echten Pixeln bleibt und
    // nicht vom Zustands-Scale mitskaliert wird.
    this.dot.style.translate =
      `${this.dotX - this.x}px ${this.dotY - this.y}px`
  }
}
