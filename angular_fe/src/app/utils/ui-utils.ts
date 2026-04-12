/**
 * @category Utils
 * 
 * @description Finds the first scrollable parent of a given HTML element.
 *
 * A scrollable parent is an element whose content exceeds its visible height
 * and whose CSS `overflow-y` property is set to `auto` or `scroll`.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param {HTMLElement} element - The element for which to find a scrollable parent.
 * @returns {HTMLElement | null} The first scrollable parent, or `null` if none is found.
 *
 * @example
 * const scrollParent = findScrollParent(document.getElementById('myDiv'));
 * if (scrollParent) {
 *   console.log('Scrollable parent found:', scrollParent);
 * }
 */
export function findScrollParent(element: HTMLElement): HTMLElement | null {
  let parent: HTMLElement | null = element.parentElement;
  while (parent) {
    const hasScrollableContent = parent.scrollHeight > parent.clientHeight;
    const overflowY = getComputedStyle(parent).overflowY;
    if (
      hasScrollableContent &&
      (overflowY === 'auto' || overflowY === 'scroll')
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}
