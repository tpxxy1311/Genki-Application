export const clamp = (v, min, max) => Math.min(Math.max(v, min), max)

export const lerp = (a, b, t) => a + (b - a) * t

/**
 * Framerate-independent damping.
 *
 * The naive `a += (b - a) * 0.1` moves at a different speed on a 60Hz and a
 * 144Hz display. Decaying the remaining distance exponentially over real time
 * gives identical motion on any refresh rate.
 */
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt))

export const mapRange = (v, inMin, inMax, outMin, outMax) =>
  outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin)
