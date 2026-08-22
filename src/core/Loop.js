/**
 * One requestAnimationFrame for the whole app. Modules register an update(dt)
 * and get called in insertion order. Running a second RAF elsewhere would
 * double the per-frame cost and let the two drift out of step.
 */
export class Loop {
  constructor() {
    this.updatables = new Set()
    this.last = 0
    this.raf = null
    this.running = false

    document.addEventListener('visibilitychange', this.onVisibility)
  }

  add(updatable) {
    this.updatables.add(updatable)
    return () => this.updatables.delete(updatable)
  }

  start() {
    if (this.running) return
    this.running = true
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.tick)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  tick = (now) => {
    this.raf = requestAnimationFrame(this.tick)

    // Clamp: a backgrounded tab or a stalled main thread can hand us a huge
    // delta, which would make every damped value teleport on the next frame.
    const dt = Math.min((now - this.last) / 1000, 1 / 30)
    this.last = now

    this.updatables.forEach((u) => u.update(dt))
  }

  onVisibility = () => {
    if (document.hidden) this.stop()
    else this.start()
  }
}
