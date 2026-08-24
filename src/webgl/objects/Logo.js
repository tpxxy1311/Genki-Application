import { Group, Box3, Vector3, Color } from 'three'
import { CONFIG } from '@/config.js'
import { pointer } from '@/core/Pointer.js'
import { damp } from '@/utils/math.js'
import { prefersReducedMotion } from '@/utils/env.js'
import { loadGLTF } from '@/utils/loaders.js'

export class Logo {
  constructor() {
    // Two nested groups on purpose:
    //   root  -- what we rotate; always sits at the world origin
    //   inner -- holds the model, offset so its centre lands on that origin
    // Without this the exported model (which sits ~78 units off-origin) would
    // orbit the scene centre instead of spinning on its own axis.
    this.root = new Group()
    this.inner = new Group()
    this.root.add(this.inner)

    this.yaw = 0
    this.pitch = 0
    this.elapsed = 0
    this.ready = false

    // Von der Intro-Sequenz getrieben: 0 = eingeklappt und weggedreht,
    // 1 = volle Groesse, face-on. Ein einzelner Wert statt zwei getrennter
    // Tweens -- so koennen Skalierung und Drehung nicht auseinanderlaufen.
    this.reveal = 0
    this.fitScale = 1
  }

  async load() {
    const gltf = await loadGLTF(CONFIG.logo.url)
    const model = gltf.scene

    this.applyMaterial(model)

    // Normalise: recentre on the origin, then scale so the largest dimension
    // matches fitSize. Makes the framing independent of the export's units.
    const box = new Box3().setFromObject(model)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())

    const scale = CONFIG.logo.fitSize / Math.max(size.x, size.y, size.z)
    model.position.sub(center)
    this.fitScale = scale
    // Die tatsaechliche Skalierung setzt update() aus fitScale * reveal --
    // hier nur der Startwert, damit zwischen Laden und erstem Frame nichts
    // in voller Groesse aufblitzt.
    this.inner.scale.setScalar(scale * this.reveal)
    this.inner.rotation.y = CONFIG.logo.baseYaw // cancel the baked-in export rotation
    this.inner.add(model)

    this.ready = true
    return this
  }

  /**
   * Recolour at load time rather than re-exporting the glTF, so the brand
   * colour stays a config value and the asset stays a neutral master.
   *
   * Tinting the material is the right lever here -- tinting the lights would
   * also tint the specular highlights and the environment reflection, which
   * reads as coloured light falling on a grey object rather than as a green
   * object.
   */
  applyMaterial(model) {
    const { tint, metalness, roughness } = CONFIG.logo

    model.traverse((child) => {
      if (!child.isMesh) return
      // A mesh can carry an array of materials; normalise to one shape.
      const materials = Array.isArray(child.material) ? child.material : [child.material]

      materials.forEach((material) => {
        // Color.set() reads hex strings as sRGB and converts to working space.
        if (tint) material.color = new Color(tint)
        if (metalness !== undefined) material.metalness = metalness
        if (roughness !== undefined) material.roughness = roughness
        material.needsUpdate = true
      })
    })
  }

  update(dt) {
    if (!this.ready) return
    this.elapsed += dt

    const { maxAngle, damping, idleSpeed, tiltRatio } = CONFIG.logo
    const reduced = prefersReducedMotion()

    let targetYaw
    if (pointer.hasMoved || reduced) {
      targetYaw = pointer.x * maxAngle
    } else {
      // Nothing has touched the mouse yet -- a slow sway reads as "alive" and
      // hints that the object is interactive. Suppressed under reduced motion.
      targetYaw = Math.sin(this.elapsed * idleSpeed * Math.PI) * maxAngle * 0.4
    }

    const targetPitch = reduced ? 0 : pointer.y * maxAngle * tiltRatio

    this.yaw = damp(this.yaw, targetYaw, damping, dt)
    this.pitch = damp(this.pitch, targetPitch, damping, dt)

    // Der Intro-Versatz kommt oben drauf, statt yaw selbst zu setzen: so
    // folgt das Logo schon waehrend des Eindrehens dem Zeiger.
    this.root.rotation.y = this.yaw + (1 - this.reveal) * CONFIG.intro.logoSpin
    this.root.rotation.x = this.pitch
    this.inner.scale.setScalar(this.fitScale * this.reveal)
  }
}
