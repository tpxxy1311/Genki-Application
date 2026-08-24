import { Stage } from '@/webgl/Stage.js'
import { Cursor } from '@/ui/Cursor.js'
import { bindHoverables } from '@/ui/Hoverables.js'
import { Intro } from '@/ui/Intro.js'
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

    this.intro = new Intro(this.stage.logo)

    bindHoverables(this.cursor)

    this.loop.add(this.stage)
    this.loop.add(this.cursor)
  }

  async start() {
    this.loop.start() // start rendering immediately, model streams in after

    // Das Promise geht ungeawaited in die Intro: die haelt nur ihre zweite
    // Phase daran auf, waehrend die erste schon laeuft. Der eigene catch
    // haengt daran, weil ein Fehler sonst als unhandled rejection endet --
    // die Intro selbst wartet mit allSettled und meldet ihn nicht.
    const model = this.stage.load()
    model.catch((err) => console.error('[app] model failed to load', err))

    await this.intro.play(model)
  }
}
