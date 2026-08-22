/**
 * Delegated hover binding: one pair of listeners on the document instead of
 * two per button, and it keeps working for anything added to the DOM later.
 *
 * Opt an element in with `data-cursor="hover"` (links and buttons are included
 * automatically).
 */
const SELECTOR = 'a, button, [data-cursor]'

export function bindHoverables(cursor) {
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest?.(SELECTOR)) cursor.setState('hover')
  })

  document.addEventListener('pointerout', (e) => {
    // relatedTarget is where the pointer went; ignore moves inside the element.
    const left = e.target.closest?.(SELECTOR)
    if (left && !left.contains(e.relatedTarget)) cursor.setState('default')
  })
}
