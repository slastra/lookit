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

const gapStyle = computed(() => {
  const base = props.layout === 'horizontal' ? 2 : 1;
  return `${(props.logoGap ?? 1) * base}rem`;
});

const taglineMargin = computed(() => `${(props.taglineGap ?? 1) * 0.25}rem`);

const wmLetterSpacing = computed(() => `${props.wordmarkLetterSpacing ?? 0}em`);
const tlLetterSpacing = computed(() => `${props.taglineLetterSpacing ?? 0}em`);

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
      :class="layout === 'mark-only' ? 'h-48 w-48' : 'h-24 w-24'"
      :style="{ transform: `scale(${logoScale}) translate(${logoOffsetX ?? 0}rem, ${logoOffsetY ?? 0}rem)`, transformOrigin: 'center' }"
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
        class="h-10 [&>svg]:h-full [&>svg]:w-auto"
        :style="{ transform: `scale(${wordmarkScale})`, transformOrigin: layout === 'stacked' ? 'center' : 'left center', letterSpacing: wmLetterSpacing }"
      />
      <span
        v-else-if="brandName"
        class="text-3xl"
        :style="{ fontFamily: wordmarkFont, fontWeight: wordmarkFontWeight ?? 700, color: primaryColor, transform: `scale(${wordmarkScale})`, transformOrigin: layout === 'stacked' ? 'center' : 'left center', letterSpacing: wmLetterSpacing }"
      >
        {{ brandName }}
      </span>

      <!-- Tagline SVG or text fallback -->
      <div
        v-if="taglineSvg"
        v-dompurify-html="recoloredTagline"
        class="h-5 [&>svg]:h-full [&>svg]:w-auto"
        :style="{ marginTop: taglineMargin, transform: `scale(${taglineScale})`, transformOrigin: layout === 'stacked' ? 'center' : 'left center', letterSpacing: tlLetterSpacing }"
      />
      <span
        v-else-if="taglineText"
        class="text-sm"
        :style="{ marginTop: taglineMargin, fontFamily: taglineFont, fontWeight: taglineFontWeight ?? 400, color: primaryColor, transform: `scale(${taglineScale})`, transformOrigin: layout === 'stacked' ? 'center' : 'left center', letterSpacing: tlLetterSpacing }"
      >
        {{ taglineText }}
      </span>
    </div>
  </div>
</template>
