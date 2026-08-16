export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface UseSwipeOptions {
  /** Minimum travel, in px, before a drag counts as a swipe. */
  threshold?: number;
  /** A swipe is a flick — drags slower than this are someone else's gesture. */
  maxDuration?: number;
}

/**
 * Anything that owns its own drag. A horizontal pull on a slider is a value
 * change, not a swipe, so gestures starting on these are left alone.
 */
const INTERACTIVE = [
  'button',
  'a',
  'input',
  'textarea',
  'select',
  'label',
  '[role="slider"]',
  '[role="dialog"]',
  '[role="menu"]',
  '[role="listbox"]',
  '[contenteditable="true"]',
  '[data-no-swipe]',
].join(',');

/**
 * Viewport-wide swipe detection on top of pointer events, so touch and pen are
 * handled by the same path.
 *
 * Scrolling is left to the browser rather than fought: when it claims a gesture
 * for a pan it fires `pointercancel`, which drops the swipe. So a vertical drag
 * scrolls wherever the page can scroll, and only reaches `onSwipe` in regions
 * that opt out via `touch-action`.
 */
export function useSwipe(
  onSwipe: (direction: SwipeDirection) => void,
  options: UseSwipeOptions = {},
) {
  const threshold = options.threshold ?? 45;
  const maxDuration = options.maxDuration ?? 1000;
  /** How far one axis must beat the other before a diagonal drag is claimed. */
  const DOMINANCE = 1.3;

  let start: { id: number; x: number; y: number; time: number } | null = null;

  function onPointerDown(e: PointerEvent) {
    // A second finger down means pinch or zoom — not a swipe.
    if (start) {
      start = null;
      return;
    }
    // Mouse drags are usually text selection, and desktop has the shortcuts.
    if (e.pointerType === 'mouse') return;
    if ((e.target as Element | null)?.closest?.(INTERACTIVE)) return;

    start = { id: e.pointerId, x: e.clientX, y: e.clientY, time: e.timeStamp };
  }

  function onPointerUp(e: PointerEvent) {
    const from = start;
    start = null;
    if (!from || e.pointerId !== from.id) return;
    if (e.timeStamp - from.time > maxDuration) return;

    const dx = e.clientX - from.x;
    const dy = e.clientY - from.y;
    const alongX = Math.abs(dx);
    const alongY = Math.abs(dy);

    if (alongX >= threshold && alongX > alongY * DOMINANCE) {
      onSwipe(dx < 0 ? 'left' : 'right');
    }
    else if (alongY >= threshold && alongY > alongX * DOMINANCE) {
      onSwipe(dy < 0 ? 'up' : 'down');
    }
  }

  function onPointerCancel() {
    start = null;
  }

  onMounted(() => {
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerCancel, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerCancel);
  });
}
