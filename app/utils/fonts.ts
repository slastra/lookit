export const curatedFonts = [
  // Sans-serif
  'Inter',
  'DM Sans',
  'Outfit',
  'Space Grotesk',
  'Syne',
  'Montserrat',
  'Raleway',
  'Poppins',
  'Plus Jakarta Sans',
  'Manrope',
  'Urbanist',
  'Figtree',
  'Lexend',
  'Albert Sans',
  'Work Sans',
  'Nunito Sans',
  'Rubik',
  'Lato',
  // Display / Bold
  'Bebas Neue',
  'Archivo Black',
  'Oswald',
  'Anton',
  'Righteous',
  'Unbounded',
  'Abril Fatface',
  'Playfair Display',
  'Cormorant Garamond',
  'Libre Baskerville',
  // Serif
  'DM Serif Display',
  'Lora',
  'Merriweather',
  'Source Serif 4',
  'Crimson Text',
  // Monospace
  'JetBrains Mono',
  'Space Mono',
  'IBM Plex Mono',
  'Fira Code',
] as const;

export type CuratedFont = typeof curatedFonts[number];

/** Available weights for each curated font (from Google Fonts) */
export const fontWeights: Record<CuratedFont, number[]> = {
  'Inter': [100, 200, 300, 400, 500, 600, 700, 800, 900],
  'DM Sans': [100, 200, 300, 400, 500, 600, 700, 800, 900],
  'Outfit': [100, 200, 300, 400, 500, 600, 700, 800, 900],
  'Space Grotesk': [300, 400, 500, 600, 700],
  'Syne': [400, 500, 600, 700, 800],
  'Montserrat': [100, 200, 300, 400, 500, 600, 700, 800, 900],
  'Raleway': [100, 200, 300, 400, 500, 600, 700, 800, 900],
  'Poppins': [100, 200, 300, 400, 500, 600, 700, 800, 900],
  'Plus Jakarta Sans': [200, 300, 400, 500, 600, 700, 800],
  'Manrope': [200, 300, 400, 500, 600, 700, 800],
  'Urbanist': [100, 200, 300, 400, 500, 600, 700, 800, 900],
  'Figtree': [300, 400, 500, 600, 700, 800, 900],
  'Lexend': [100, 200, 300, 400, 500, 600, 700, 800, 900],
  'Albert Sans': [100, 200, 300, 400, 500, 600, 700, 800, 900],
  'Work Sans': [100, 200, 300, 400, 500, 600, 700, 800, 900],
  'Nunito Sans': [200, 300, 400, 500, 600, 700, 800, 900],
  'Rubik': [300, 400, 500, 600, 700, 800, 900],
  'Lato': [100, 300, 400, 700, 900],
  'Bebas Neue': [400],
  'Archivo Black': [400],
  'Oswald': [200, 300, 400, 500, 600, 700],
  'Anton': [400],
  'Righteous': [400],
  'Unbounded': [200, 300, 400, 500, 600, 700, 800, 900],
  'Abril Fatface': [400],
  'Playfair Display': [400, 500, 600, 700, 800, 900],
  'Cormorant Garamond': [300, 400, 500, 600, 700],
  'Libre Baskerville': [400, 700],
  'DM Serif Display': [400],
  'Lora': [400, 500, 600, 700],
  'Merriweather': [300, 400, 700, 900],
  'Source Serif 4': [200, 300, 400, 500, 600, 700, 800, 900],
  'Crimson Text': [400, 600, 700],
  'JetBrains Mono': [100, 200, 300, 400, 500, 600, 700, 800],
  'Space Mono': [400, 700],
  'IBM Plex Mono': [100, 200, 300, 400, 500, 600, 700],
  'Fira Code': [300, 400, 500, 600, 700],
};

/** Get available weights for a font, falling back to full range */
export function getFontWeights(font: string): number[] {
  return fontWeights[font as CuratedFont] ?? [100, 200, 300, 400, 500, 600, 700, 800, 900];
}

/** Clamp a weight to the nearest available weight for a font */
export function clampWeight(font: string, weight: number): number {
  const weights = getFontWeights(font);
  return weights.reduce((prev, curr) =>
    Math.abs(curr - weight) < Math.abs(prev - weight) ? curr : prev,
  );
}
