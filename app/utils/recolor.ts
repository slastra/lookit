export function recolorSvg(svg: string, primary: string, accent: string): string {
  return svg
    .replaceAll('#000000', primary)
    .replaceAll('#0000FF', accent)
    .replaceAll('#0000ff', accent);
}
