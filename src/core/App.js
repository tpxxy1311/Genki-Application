import { Stage } from '@/webgl/Stage.js'
import { Cursor } from '@/ui/Cursor.js'
import { bindHoverables } from '@/ui/Hoverables.js'
import { Loop } from './Loop.js'

/**
 * Composition root. Owns the modules and the single loop; nothing else in the
 * app reaches across to anything else.
 */
export class App {
  constructor() {
    this.loop = new Loop()
    this.stage = new Stage(document.querySelector('#scene'))
    this.cursor = new Cursor(document.querySelector('#cursor')).mount()

    bindHoverables(this.cursor)

    this.loop.add(this.stage)
    this.loop.add(this.cursor)
  }

  async start() {
    this.loop.start() // start rendering immediately, model streams in after
    try {
      await this.stage.load()
    } catch (err) {
      console.error('[app] model failed to load', err)
      document.documentElement.classList.add('is-loaded')
    }
  }
}
