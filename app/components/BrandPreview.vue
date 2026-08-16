<script setup lang="ts">
const props = defineProps<{
  logomarkSvg?: string;
  wordmarkSvg?: string;
  taglineSvg?: string;
  primaryColor: string;
  accentColor: string;
  wordmarkFont: string;
  wordmarkFontWeight?: number;
  taglineFont: string;
  taglineFontWeight?: number;
  layout: 'horizontal' | 'stacked' | 'mark-only';
  logoScale: number;
  wordmarkScale: number;
  taglineScale: number;
  brandName?: string;
  taglineText?: string;
  logoGap?: number;
  taglineGap?: number;
  wordmarkLetterSpacing?: number;
  taglineLetterSpacing?: number;
  logoOffsetX?: number;
  logoOffsetY?: number;
}>();

/**
 * Every dimension in the lockup is a rung of one golden-ratio modular scale
 * rooted at 1rem, so each is exactly PHI from its neighbours and the pieces
 * hold their proportions at any slider setting.
 *
 *   rung(-1)  0.618rem   tagline gap
 *   rung(0)   1.000rem   logo gap, horizontal
 *   rung(1)   1.618rem   tagline · logo gap, stacked
 *   rung(2)   2.618rem   wordmark · logo, horizontal
 *   rung(4)   6.854rem   logo, stacked
 *   rung(5)  11.090rem   logo, mark-only
 */
const PHI = (1 + Math.sqrt(5)) / 2;
const rung = (n: number) => PHI ** n;

const WORDMARK_REM = rung(2);
const TAGLINE_REM = rung(1);

const LOGO_REM = {
  // Beside the wordmark the mark reads as a peer, so it shares its rung.
  horizontal: rung(2),
  // Above it, the mark carries the lockup and takes two rungs of lead.
  stacked: rung(4),
  'mark-only': rung(5),
} as const;

const GAP_REM = {
  // The horizontal mark is two rungs smaller than the stacked one, so the gap
  // beside it closes up to match.
  horizontal: rung(0),
  stacked: rung(1),
  'mark-only': rung(0),
} as const;

const TAGLINE_GAP_REM = rung(-1);

/**
 * Not a rung — a font metric. Text renders roughly three quarters of its
 * font-size as visible letterform, so a text wordmark needs this much of the
 * rung as its font-size to read at the same weight as an SVG one.
 */
const CAP_RATIO = 0.75;

const logoSizeRem = computed(() => LOGO_REM[props.layout] * props.logoScale);

/**
 * Which dimension governs depends on the axis the lockup runs along. Beside the
 * wordmark, height is the scarce one — the mark has to sit inside the text's
 * band — so height is capped and width follows the artwork. Stacked, the
 * wordmark underneath sets the width, so width is capped and height follows.
 * Either way the box ends up the artwork's own shape, leaving no dead space to
 * throw the centering off.
 */
const logoBox = computed(() => {
  const size = logoSizeRem.value;
  const aspect = svgAspectRatio(props.logomarkSvg);

  let width: number;
  let height: number;
  if (props.layout === 'horizontal') {
    [width, height] = [size * aspect, size];
  }
  else if (props.layout === 'stacked') {
    [width, height] = [size, size / aspect];
  }
  else {
    // Mark-only stands alone, so neither axis leads — fit it in the square.
    [width, height] = aspect >= 1 ? [size, size / aspect] : [size * aspect, size];
  }

  return {
    width: `${width}rem`,
    height: `${height}rem`,
    transform: `translate(${props.logoOffsetX ?? 0}rem, ${props.logoOffsetY ?? 0}rem)`,
  };
});

/**
 * Keyed to the layout rather than to the mark, so a short wide mark doesn't end
 * up with a gap taller than the artwork it's meant to sit against.
 */
const gapStyle = computed(() =>
  `${GAP_REM[props.layout] * (props.logoGap ?? 1)}rem`,
);

const taglineMargin = computed(() =>
  `${TAGLINE_GAP_REM * (props.taglineGap ?? 1)}rem`,
);

const wordmarkSvgStyle = computed(() => ({
  height: `${WORDMARK_REM * props.wordmarkScale}rem`,
  letterSpacing: `${props.wordmarkLetterSpacing ?? 0}em`,
}));

const wordmarkTextStyle = computed(() => ({
  fontSize: `${WORDMARK_REM * CAP_RATIO * props.wordmarkScale}rem`,
  lineHeight: 1,
  fontFamily: props.wordmarkFont,
  fontWeight: props.wordmarkFontWeight ?? 700,
  color: props.primaryColor,
  letterSpacing: `${props.wordmarkLetterSpacing ?? 0}em`,
}));

const taglineSvgStyle = computed(() => ({
  height: `${TAGLINE_REM * props.taglineScale}rem`,
  marginTop: taglineMargin.value,
  letterSpacing: `${props.taglineLetterSpacing ?? 0}em`,
}));

const taglineTextStyle = computed(() => ({
  fontSize: `${TAGLINE_REM * CAP_RATIO * props.taglineScale}rem`,
  lineHeight: 1,
  marginTop: taglineMargin.value,
  fontFamily: props.taglineFont,
  fontWeight: props.taglineFontWeight ?? 400,
  color: props.primaryColor,
  letterSpacing: `${props.taglineLetterSpacing ?? 0}em`,
}));

const recoloredLogomark = computed(() => {
  if (!props.logomarkSvg) return '';
  return recolorSvg(props.logomarkSvg, props.primaryColor, props.accentColor);
});

const recoloredWordmark = computed(() => {
  if (!props.wordmarkSvg) return '';
  return recolorSvg(props.wordmarkSvg, props.primaryColor, props.accentColor);
});

const recoloredTagline = computed(() => {
  if (!props.taglineSvg) return '';
  return recolorSvg(props.taglineSvg, props.primaryColor, props.accentColor);
});

const hasWordmarkContent = computed(() => !!props.wordmarkSvg || !!props.brandName);
const hasTaglineContent = computed(() => !!props.taglineSvg || !!props.taglineText);
</script>

<template>
  <div
    class="flex items-center justify-center"
    :class="{
      'flex-row': layout === 'horizontal',
      'flex-col': layout === 'stacked',
    }"
    :style="{ gap: gapStyle }"
  >
    <!-- Logomark -->
    <div
      v-if="recoloredLogomark"
      v-dompurify-html="recoloredLogomark"
      class="shrink-0 [&>svg]:h-full [&>svg]:w-full"
      :style="logoBox"
    />

    <!-- Wordmark + Tagline text block -->
    <div
      v-if="layout !== 'mark-only' && (hasWordmarkContent || hasTaglineContent)"
      class="flex flex-col whitespace-nowrap"
      :class="layout === 'stacked' ? 'items-center text-center' : 'items-start'"
    >
      <!-- Wordmark SVG or text fallback -->
      <div
        v-if="wordmarkSvg"
        v-dompurify-html="recoloredWordmark"
        class="[&>svg]:h-full [&>svg]:w-auto"
        :style="wordmarkSvgStyle"
      />
      <span
        v-else-if="brandName"
        :style="wordmarkTextStyle"
      >
        {{ brandName }}
      </span>

      <!-- Tagline SVG or text fallback -->
      <div
        v-if="taglineSvg"
        v-dompurify-html="recoloredTagline"
        class="[&>svg]:h-full [&>svg]:w-auto"
        :style="taglineSvgStyle"
      />
      <span
        v-else-if="taglineText"
        :style="taglineTextStyle"
      >
        {{ taglineText }}
      </span>
    </div>
  </div>
</template>
