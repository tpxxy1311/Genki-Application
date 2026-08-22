import { DirectionalLight, AmbientLight, PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

/**
 * The logo material is metallic with a clearcoat layer, so it needs an
 * environment map to read as a solid object -- punctual lights alone leave
 * metal looking flat and black. RoomEnvironment is a procedural studio box,
 * which means no HDR file to download.
 */
export function setupLights(scene, renderer) {
  const pmrem = new PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  // Held well under 1: a full-strength studio env washes the light base colour
  // out to white against the light page background.
  scene.environmentIntensity = 0.45

  const key = new DirectionalLight(0xffffff, 1.1)
  key.position.set(3, 4, 5)
  scene.add(key)

  const fill = new DirectionalLight(0xffffff, 0.35)
  fill.position.set(-4, -1, -3)
  scene.add(fill)

  scene.add(new AmbientLight(0xffffff, 0.25))

  return () => pmrem.dispose()
}
