/** Golden ratio — the modular scale every lockup dimension sits on. */
export const PHI = (1 + Math.sqrt(5)) / 2;

/**
 * Two rungs down that scale, for any small copy of the lockup: small enough to
 * fit a strip of options or a thumbnail beside a card, large enough that a mark
 * stays legible. Passed to BrandPreview's `size`, so the copy is laid out at
 * its real size rather than transform-scaled.
 */
export const THUMBNAIL_SIZE = 1 / PHI ** 2;
