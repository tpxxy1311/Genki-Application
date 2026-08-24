import gsap from 'gsap'
import { CONFIG } from '@/config.js'
import { prefersReducedMotion } from '@/utils/env.js'

/**
 * Einmalige Eroeffnungs-Sequenz.
 *
 * Zwei Phasen statt einer durchlaufenden Timeline:
 *
 *   enter  -- Verlauf und Headline. Laeuft sofort, unabhaengig vom Netz.
 *   reveal -- 3D-Element, Overlay, Cursor. Wartet auf das geladene Modell.
 *
 * Der Schnitt liegt genau dort, weil das glTF das einzige Stueck ist, dessen
 * Ankunft nicht vorhersehbar ist. Alles davor kann sofort spielen; alles
 * danach haengt am Modell, damit das Logo nicht ohne Geometrie eingeblendet
 * wird -- und damit die Buttons nicht vor dem Hauptmotiv stehen.
 */
export class Intro {
  constructor(logo) {
    this.logo = logo

    this.el = {
      loader: document.querySelector('.loader-overlay'),
      backdrop: document.querySelector('.backdrop'),
      lines: gsap.utils.toArray('.headline__line'),
      stage: document.querySelector('.stage'),
      // Ein Selektor statt drei Listen: querySelectorAll liefert
      // Dokumentreihenfolge, und genau die soll der Stagger auch haben --
      // Brand, Intro-Text, dann die Buttons von links nach rechts.
      overlay: gsap.utils.toArray('.overlay__brand, .overlay__intro, .button'),
      cursor: document.querySelector('.cursor'),
    }
  }

  /**
   * @param {Promise} modelReady erfuellt, sobald das glTF in der Szene haengt
   */
  async play(modelReady) {
    this.prepare()

    if (prefersReducedMotion()) return this.skip()

    const enter = this.enter()
    const reveal = this.reveal()

    // allSettled statt all: ein fehlgeschlagener Download darf die Seite nicht
    // im Halbzustand stehen lassen. Der Timeout deckt den anderen Fall ab --
    // eine Verbindung, die weder liefert noch abbricht.
    await Promise.allSettled([enter, withTimeout(modelReady, CONFIG.intro.loadTimeout)])
    await reveal.play()
  }

  /**
   * Startwerte inline schreiben und erst dann die Preload-Klasse abnehmen.
   * Andersherum gaebe es ein Frame, in dem weder das CSS noch GSAP die
   * Elemente versteckt.
   */
  prepare() {
    const { loader, backdrop, lines, stage, overlay, cursor } = this.el
    const { backdropScale, headlineScale, overlayShift } = CONFIG.intro

    // Die Abdeckung steht schon sichtbar im Markup und deckt alles ab, was
    // hier gleich auf 0 gesetzt wird. Sie ist deshalb das einzige Element,
    // das nicht ueber .is-preload laeuft -- der Startwert steht trotzdem
    // hier, damit die Sequenz ihre Ausgangslage vollstaendig selbst setzt.
    gsap.set(loader, { autoAlpha: 1 })

    gsap.set(backdrop, {
      opacity: 0,
      scale: backdropScale,
      transformOrigin: '50% 35%', // dort sitzt der helle Kreis des Verlaufs
      willChange: 'opacity, transform',
    })
    gsap.set(lines, { opacity: 0, scale: headlineScale })
    gsap.set(stage, { opacity: 0 })
    gsap.set(overlay, { opacity: 0, y: overlayShift })
    // Nur opacity: Cursor.update schreibt jeden Frame einen kompletten
    // transform-String und wuerde alles ueberbuegeln, was GSAP dort setzt.

    document.documentElement.classList.remove('is-preload')
  }

  /** Phase 1: Abdeckung weg, Verlauf, dann Headline. Laeuft ab Aufruf. */
  enter() {
    const { loader, backdrop, lines } = this.el
    const c = CONFIG.intro

    return gsap
      .timeline()
      // autoAlpha statt opacity: bei 0 setzt GSAP zusaetzlich
      // visibility: hidden. Ein bildschirmfuellendes Element mit opacity 0
      // wuerde sonst weiter bei jedem WebGL-Frame mitkomponiert.
      .to(loader, { autoAlpha: 0, duration: c.loader, ease: 'power2.inOut' })
      .to(backdrop, {
        opacity: 1,
        scale: 1,
        duration: c.backdrop,
        ease: 'power2.out',
        // Die Compositing-Ebene wird nur fuer diesen einen Tween gebraucht.
        // Bliebe sie stehen, muesste sie hinter jedem WebGL-Frame neu
        // zusammengesetzt werden.
        onComplete: () => gsap.set(backdrop, { clearProps: 'transform,willChange' }),
      },
      // Der Verlauf laeuft schon an, waehrend die Abdeckung noch ausblendet --
      // sonst gibt sie nur eine graue Flaeche frei und die Bewegung setzt
      // erst danach ein.
      `-=${c.loaderOverlap}`)
      .to(
        lines,
        {
          opacity: 1,
          scale: 1,
          duration: c.headline,
          ease: 'power3.out',
          stagger: c.headlineStagger,
          // Gleicher Grund wie beim Verlauf: ein stehengebliebener transform
          // haelt die Zeilen als eigene Ebene hinter der Szene.
          clearProps: 'transform',
        },
        // Ueberlappend: die Zeilen setzen ein, waehrend der Verlauf noch
        // ausrollt -- sonst steht die Sequenz kurz still.
        `-=${c.backdrop * 0.66}`,
      )
  }

  /** Phase 2: 3D-Element, Overlay, Cursor. Wartet auf play(). */
  reveal() {
    const { stage, overlay, cursor } = this.el
    const c = CONFIG.intro

    return gsap
      .timeline({ paused: true })
      .to(stage, { opacity: 1, duration: c.stageFade, ease: 'power1.out' }, 0)
      // Ein einziger Wert am Logo: Logo.update leitet daraus Skalierung und
      // Yaw-Versatz ab. back.out laesst beides einmal leicht ueberschwingen,
      // das Logo faellt also in seine Ruhelage statt sie anzukriechen.
      .to(this.logo, { reveal: 1, duration: c.logo, ease: 'back.out(1.2)' }, 0)
      .to(
        overlay,
        {
          opacity: 1,
          y: 0,
          duration: c.overlay,
          ease: 'power3.out',
          stagger: c.overlayStagger,
          clearProps: 'transform', // danach gehoert der Platz wieder dem Layout
        },
        `-=${c.logo * 0.6}`,
      )
  }

  /**
   * Reduced motion: derselbe Endzustand, ohne Bewegung. Kein Sonderfall im
   * Rest der App -- alles laeuft ueber dieselben Endwerte.
   */
  skip() {
    const { loader, backdrop, lines, stage, overlay, cursor } = this.el

    gsap.set(loader, { autoAlpha: 0 })
    gsap.set([backdrop, ...lines, stage, ...overlay, cursor], {
      opacity: 1,
      clearProps: 'transform,willChange',
    })
    this.logo.reveal = 1
  }
}

/**
 * Erfuellt, sobald das Promise fertig ist -- spaetestens aber nach `seconds`.
 * Das Ergebnis interessiert nicht, nur der Zeitpunkt.
 */
function withTimeout(promise, seconds) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(resolve, seconds * 1000)),
  ])
}
