// Every tunable value lives here so feel can be adjusted without hunting
// through modules. Angles are radians, damping values are per-second lambdas.
export const CONFIG = {
  renderer: {
    maxDpr: 2, // capping DPR is the single biggest perf win on retina
  },

  camera: {
    fov: 35,
    near: 0.1,
    far: 100,
    distance: 6,
  },

  logo: {
    url: '/models/model.gltf',
    fitSize: 2.0, // largest bounding-box dimension, in world units

    // The export has a 45deg Y-rotation baked into its node matrix, so the
    // model's own "front" is not facing the camera at rotation 0. This cancels
    // it out, making yaw 0 the face-on resting pose.
    baseYaw: -Math.PI / 4,

    // Brand colour, applied to the model's material on load. The glTF ships a
    // neutral clay grey, so this is where the green comes from -- set to null
    // to keep whatever the export was authored with.
    //
    // PLACEHOLDER: swap for the real Genki hex.
    tint: '#00A651',

    // Metalness tints the specular highlight with the base colour and scales
    // the diffuse term by (1 - metalness). The export ships 0.25, which mutes
    // a saturated brand colour; 0 keeps the green clean and the highlights white.
    metalness: 0,
    roughness: 0.35,
    maxAngle: 0.62, // ~35deg of yaw at the far left / far right of the screen
    damping: 4.5, // higher = snappier follow
    idleSpeed: 0.12, // slow drift (rad/s) before the pointer is ever moved
    tiltRatio: 0.25, // how much of maxAngle the vertical axis gets, 0 = yaw only
  },

  cursor: {
    damping: 22,
    hoverScale: 2.8,
  },
}
