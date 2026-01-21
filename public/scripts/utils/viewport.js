

export function isElementNearViewportBottom(
  element,
  offset = 200
) {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  return rect.top <= window.innerHeight + offset;
}
