/**
 * Width/height ratio of an SVG's artwork, read from its viewBox (or its
 * width/height attributes as a fallback). Returns 1 when it can't be
 * determined, so callers can treat the mark as square.
 */
export function svgAspectRatio(svg: string | undefined): number {
  if (!svg) return 1;

  const viewBox = svg.match(/viewBox\s*=\s*["']\s*[-\d.eE+]+[,\s]+[-\d.eE+]+[,\s]+([\d.eE+]+)[,\s]+([\d.eE+]+)/);
  if (viewBox) {
    const w = Number(viewBox[1]);
    const h = Number(viewBox[2]);
    if (w > 0 && h > 0) return w / h;
  }

  const width = svg.match(/\swidth\s*=\s*["']([\d.]+)/);
  const height = svg.match(/\sheight\s*=\s*["']([\d.]+)/);
  if (width && height) {
    const w = Number(width[1]);
    const h = Number(height[1]);
    if (w > 0 && h > 0) return w / h;
  }

  return 1;
}
