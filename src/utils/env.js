// Capability checks, resolved once and shared. Both are live queries: the user
// can flip reduced-motion mid-session, and a laptop can gain a mouse.
const reducedMotionQuery = matchMedia('(prefers-reduced-motion: reduce)')
const finePointerQuery = matchMedia('(hover: hover) and (pointer: fine)')

export const prefersReducedMotion = () => reducedMotionQuery.matches
export const hasFinePointer = () => finePointerQuery.matches

export const onReducedMotionChange = (cb) =>
  reducedMotionQuery.addEventListener('change', (e) => cb(e.matches))
export const onFinePointerChange = (cb) =>
  finePointerQuery.addEventListener('change', (e) => cb(e.matches))
