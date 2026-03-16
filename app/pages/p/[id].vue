<script setup lang="ts">
import type { PreviewConfig, Selection, SelectionLockup } from '~/types';
import { getFontWeights, clampWeight } from '~/utils/fonts';

const route = useRoute();
const toast = useToast();
const id = route.params.id as string;

const { data: config, error } = await useFetch<PreviewConfig>(`/api/previews/${id}`);

if (error.value || !config.value) {
  throw createError({ statusCode: 404, statusMessage: 'Preview not found' });
}

// Local state initialized from config defaults
const logomarkIndex = ref(0);
const fontIndex = ref(0);
const wordmarkFont = ref(config.value.defaultWordmarkFont || config.value.fonts[0] || 'Inter');
const wordmarkFontWeight = ref(config.value.defaultWordmarkWeight ?? 700);
const taglineFont = ref(config.value.defaultTaglineFont || config.value.fonts[0] || 'Inter');
const taglineFontWeight = ref(config.value.defaultTaglineWeight ?? 400);
const primaryColor = ref(config.value.primaryColor);
const accentColor = ref(config.value.accentColor);
const layout = ref(config.value.layout);
const logoScale = ref(config.value.logoScale);
const wordmarkScale = ref(config.value.wordmarkScale);
const taglineScale = ref(config.value.taglineScale);
const logoGap = ref(config.value.logoGap ?? 1);
const taglineGap = ref(config.value.taglineGap ?? 1);
const logoOffsetX = ref(config.value.logoOffsetX ?? 0);
const logoOffsetY = ref(config.value.logoOffsetY ?? 0);
const wordmarkLetterSpacing = ref(config.value.wordmarkLetterSpacing ?? 0);
const taglineLetterSpacing = ref(config.value.taglineLetterSpacing ?? 0);
const bgColor = ref(config.value.backgroundColor);

// Selections
const { data: selections, refresh: refreshSelections } = await useFetch<Selection[]>(`/api/previews/${id}/selections`);

// SSE for real-time selections
let eventSource: EventSource | null = null;
onMounted(() => {
  eventSource = new EventSource(`/api/previews/${id}/selections/stream`);
  eventSource.onmessage = (e) => {
    try {
      const selection = JSON.parse(e.data) as Selection;
      if (selections.value) {
        selections.value = [selection, ...selections.value];
      }
      else {
        selections.value = [selection];
      }
    }
    catch { /* ignore parse errors */ }
  };
});
onUnmounted(() => {
  eventSource?.close();
  eventSource = null;
});

// Name modal
const nameModalOpen = ref(false);
const feedbackModalOpen = ref(false);
const feedbackMessage = ref('');
const clientName = ref('');

const currentLogomark = computed(() => {
  return config.value!.logomarks[logomarkIndex.value];
});

const fontItems = computed(() => config.value!.fonts);

const wordmarkWeightOptions = computed(() =>
  getFontWeights(wordmarkFont.value).map(w => ({ label: String(w), value: w })),
);
const taglineWeightOptions = computed(() =>
  getFontWeights(taglineFont.value).map(w => ({ label: String(w), value: w })),
);

watch(wordmarkFont, (font) => {
  wordmarkFontWeight.value = clampWeight(font, wordmarkFontWeight.value);
});
watch(taglineFont, (font) => {
  taglineFontWeight.value = clampWeight(font, taglineFontWeight.value);
});

const bgStyle = useBgStyle(bgColor);

function isFormElement(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

function setFont(index: number) {
  if (!config.value) return;
  const fonts = config.value.fonts;
  fontIndex.value = index;
  const font = fonts[index];
  wordmarkFont.value = font;
  wordmarkFontWeight.value = clampWeight(font, wordmarkFontWeight.value);
  taglineFont.value = font;
  taglineFontWeight.value = clampWeight(font, taglineFontWeight.value);
}

function cycleFonts(forward = true) {
  if (!config.value || config.value.fonts.length <= 1) return;
  const len = config.value.fonts.length;
  setFont((fontIndex.value + (forward ? 1 : len - 1)) % len);
}

function randomize() {
  if (!config.value) return;
  const fonts = config.value.fonts;
  const marks = config.value.logomarks;
  if (marks.length > 1) {
    logomarkIndex.value = Math.floor(Math.random() * marks.length);
  }
  if (fonts.length > 1) {
    setFont(Math.floor(Math.random() * fonts.length));
  }
}

function onKeydown(e: KeyboardEvent) {
  if (isFormElement(e)) return;
  if (e.code === 'Space' && e.shiftKey) {
    e.preventDefault();
    cycleFonts();
  }
  else if (e.code === 'Space') {
    e.preventDefault();
    if (!config.value || config.value.logomarks.length <= 1) return;
    logomarkIndex.value = (logomarkIndex.value + 1) % config.value.logomarks.length;
  }
  else if (e.code === 'KeyR' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    e.preventDefault();
    randomize();
  }
}

// Swipe gestures: upper half cycles logomarks, lower half cycles fonts
const previewArea = ref<HTMLElement>();
let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 50;

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx)) return;

  const el = previewArea.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const midY = rect.top + rect.height / 2;
  const isUpper = touchStartY < midY;
  const forward = dx < 0; // swipe left = next

  if (isUpper) {
    if (!config.value || config.value.logomarks.length <= 1) return;
    const len = config.value.logomarks.length;
    logomarkIndex.value = (logomarkIndex.value + (forward ? 1 : len - 1)) % len;
  }
  else {
    cycleFonts(forward);
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));

const currentLockup = computed<SelectionLockup>(() => ({
  logomarkIndex: logomarkIndex.value,
  wordmarkFont: wordmarkFont.value,
  wordmarkFontWeight: wordmarkFontWeight.value,
  taglineFont: taglineFont.value,
  taglineFontWeight: taglineFontWeight.value,
  primaryColor: primaryColor.value,
  accentColor: accentColor.value,
  layout: layout.value,
  logoScale: logoScale.value,
  wordmarkScale: wordmarkScale.value,
  taglineScale: taglineScale.value,
  backgroundColor: bgColor.value,
  logoGap: logoGap.value,
  taglineGap: taglineGap.value,
  wordmarkLetterSpacing: wordmarkLetterSpacing.value,
  taglineLetterSpacing: taglineLetterSpacing.value,
  logoOffsetX: logoOffsetX.value,
  logoOffsetY: logoOffsetY.value,
}));

function startSave() {
  const cached = localStorage.getItem('lookit-client-name');
  if (cached) {
    clientName.value = cached;
    feedbackModalOpen.value = true;
  }
  else {
    nameModalOpen.value = true;
  }
}

function onNameSubmit(name: string) {
  clientName.value = name;
  feedbackModalOpen.value = true;
}

async function submitSelection() {
  try {
    await $fetch(`/api/previews/${id}/selections`, {
      method: 'POST',
      body: {
        name: clientName.value,
        lockup: currentLockup.value,
        message: feedbackMessage.value.trim() || undefined,
      },
    });
    toast.add({ title: 'Selection saved!', color: 'success' });
    feedbackModalOpen.value = false;
    feedbackMessage.value = '';
  }
  catch {
    toast.add({ title: 'Failed to save selection', color: 'error' });
  }
}

function applySelection(sel: Selection) {
  logomarkIndex.value = sel.lockup.logomarkIndex;
  wordmarkFont.value = sel.lockup.wordmarkFont;
  wordmarkFontWeight.value = sel.lockup.wordmarkFontWeight ?? 700;
  taglineFont.value = sel.lockup.taglineFont;
  taglineFontWeight.value = sel.lockup.taglineFontWeight ?? 400;
  primaryColor.value = sel.lockup.primaryColor;
  accentColor.value = sel.lockup.accentColor;
  layout.value = sel.lockup.layout;
  logoScale.value = sel.lockup.logoScale;
  wordmarkScale.value = sel.lockup.wordmarkScale;
  taglineScale.value = sel.lockup.taglineScale;
  bgColor.value = sel.lockup.backgroundColor;
  logoGap.value = sel.lockup.logoGap ?? 1;
  taglineGap.value = sel.lockup.taglineGap ?? 1;
  wordmarkLetterSpacing.value = sel.lockup.wordmarkLetterSpacing ?? 0;
  taglineLetterSpacing.value = sel.lockup.taglineLetterSpacing ?? 0;
  logoOffsetX.value = sel.lockup.logoOffsetX ?? 0;
  logoOffsetY.value = sel.lockup.logoOffsetY ?? 0;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

useHead({
  title: config.value.brandName ? `${config.value.brandName} — Lookit` : 'Lookit Preview',
});
</script>

<template>
  <div
    v-if="config"
    class="flex min-h-screen flex-col"
  >
    <!-- Controls bar -->
    <div class="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
      <div class="mx-auto max-w-6xl px-4 py-3">
        <div class="flex items-center justify-between gap-1.5 md:gap-3">
          <!-- Left: menus -->
          <div class="flex items-center gap-1 md:gap-2">
            <div class="mr-0.5 flex items-center justify-center rounded-lg bg-primary p-1.5 md:mr-2">
              <UIcon
                name="i-lucide-scan-eye"
                class="size-5 text-(--ui-bg)"
              />
            </div>
            <UPopover v-if="config.logomarks.length > 1">
              <UButton
                icon="i-lucide-shapes"
                variant="ghost"
                color="neutral"
              >
                <span class="hidden md:inline">Logo</span>
              </UButton>
              <template #content>
                <div class="flex gap-2 p-3">
                  <button
                    v-for="(mark, i) in config.logomarks"
                    :key="i"
                    class="flex h-12 w-12 items-center justify-center rounded-lg border-2 p-1.5 transition-colors"
                    :style="{ backgroundColor: bgColor }"
                    :class="logomarkIndex === i ? 'border-primary' : 'border-zinc-200 hover:border-zinc-400 dark:border-zinc-700'"
                    :title="mark.label"
                    @click="logomarkIndex = i"
                  >
                    <div
                      v-dompurify-html="recolorSvg(mark.svg, primaryColor, accentColor)"
                      class="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                    />
                  </button>
                </div>
              </template>
            </UPopover>

            <UPopover v-if="config.fonts.length > 1">
              <UButton
                icon="i-lucide-type"
                variant="ghost"
                color="neutral"
              >
                <span class="hidden md:inline">Fonts</span>
              </UButton>
              <template #content>
                <div class="space-y-4 p-3">
                  <div class="flex gap-2">
                    <UFormField label="Wordmark" class="flex-1">
                      <USelect
                        v-model="wordmarkFont"
                        :items="fontItems"
                      />
                    </UFormField>
                    <UFormField label="Weight" class="w-20">
                      <USelect
                        v-model="wordmarkFontWeight"
                        :items="wordmarkWeightOptions"
                      />
                    </UFormField>
                  </div>
                  <UFormField label="Wordmark Letter Spacing">
                    <USlider
                      v-model="wordmarkLetterSpacing"
                      :min="-0.05"
                      :max="0.3"
                      :step="0.01"
                      class="w-48"
                    />
                  </UFormField>
                  <div class="flex gap-2">
                    <UFormField label="Tagline" class="flex-1">
                      <USelect
                        v-model="taglineFont"
                        :items="fontItems"
                      />
                    </UFormField>
                    <UFormField label="Weight" class="w-20">
                      <USelect
                        v-model="taglineFontWeight"
                        :items="taglineWeightOptions"
                      />
                    </UFormField>
                  </div>
                  <UFormField label="Tagline Letter Spacing">
                    <USlider
                      v-model="taglineLetterSpacing"
                      :min="-0.05"
                      :max="0.3"
                      :step="0.01"
                      class="w-48"
                    />
                  </UFormField>
                  <UButton
                    label="Reset"
                    icon="i-lucide-rotate-ccw"
                    variant="outline"
                    color="neutral"
                    size="sm"
                    block
                    @click="wordmarkFont = config!.defaultWordmarkFont || config!.fonts[0] || 'Inter'; wordmarkFontWeight = config!.defaultWordmarkWeight ?? 700; taglineFont = config!.defaultTaglineFont || config!.fonts[0] || 'Inter'; taglineFontWeight = config!.defaultTaglineWeight ?? 400; wordmarkLetterSpacing = 0; taglineLetterSpacing = 0"
                  />
                </div>
              </template>
            </UPopover>

            <UPopover>
              <UButton
                icon="i-lucide-maximize-2"
                variant="ghost"
                color="neutral"
              >
                <span class="hidden md:inline">Proportions</span>
              </UButton>
              <template #content>
                <div class="w-48 space-y-4 p-3">
                  <UFormField label="Logo Scale">
                    <USlider
                      v-model="logoScale"
                      :min="0.5"
                      :max="3"
                      :step="0.1"
                    />
                  </UFormField>
                  <UFormField label="Wordmark Scale">
                    <USlider
                      v-model="wordmarkScale"
                      :min="0.5"
                      :max="3"
                      :step="0.1"
                    />
                  </UFormField>
                  <UFormField label="Tagline Scale">
                    <USlider
                      v-model="taglineScale"
                      :min="0.5"
                      :max="3"
                      :step="0.1"
                    />
                  </UFormField>
                  <UFormField label="Logo Gap">
                    <USlider
                      v-model="logoGap"
                      :min="0.25"
                      :max="3"
                      :step="0.25"
                    />
                  </UFormField>
                  <UFormField label="Tagline Gap">
                    <USlider
                      v-model="taglineGap"
                      :min="0.25"
                      :max="3"
                      :step="0.25"
                    />
                  </UFormField>
                  <UFormField label="Logo Offset X">
                    <USlider
                      v-model="logoOffsetX"
                      :min="-3"
                      :max="3"
                      :step="0.125"
                    />
                  </UFormField>
                  <UFormField label="Logo Offset Y">
                    <USlider
                      v-model="logoOffsetY"
                      :min="-3"
                      :max="3"
                      :step="0.125"
                    />
                  </UFormField>
                  <UButton
                    label="Reset"
                    icon="i-lucide-rotate-ccw"
                    variant="outline"
                    color="neutral"
                    size="sm"
                    block
                    @click="logoScale = 1; wordmarkScale = 1; taglineScale = 1; logoGap = 1; taglineGap = 1; logoOffsetX = 0; logoOffsetY = 0"
                  />
                </div>
              </template>
            </UPopover>
          </div>

          <!-- Center: layout toggles -->
          <div class="hidden items-center justify-center gap-3 md:flex">
            <div class="flex gap-1">
              <UButton
                size="xs"
                :variant="layout === 'horizontal' ? 'solid' : 'outline'"
                color="neutral"
                icon="i-lucide-columns-2"
                title="Horizontal"
                @click="layout = 'horizontal'"
              />
              <UButton
                size="xs"
                :variant="layout === 'stacked' ? 'solid' : 'outline'"
                color="neutral"
                icon="i-lucide-rows-2"
                title="Stacked"
                @click="layout = 'stacked'"
              />
              <UButton
                size="xs"
                :variant="layout === 'mark-only' ? 'solid' : 'outline'"
                color="neutral"
                icon="i-lucide-diamond"
                title="Mark Only"
                @click="layout = 'mark-only'"
              />
            </div>
          </div>

          <!-- Right: swatches + save -->
          <div class="flex items-center justify-end gap-1.5 md:gap-3">
            <ColorPalette
              v-model="primaryColor"
              label="Primary"
              hide-label-mobile
            />
            <ColorPalette
              v-model="accentColor"
              label="Accent"
              hide-label-mobile
            />
            <ColorPalette
              v-model="bgColor"
              label="Background"
              hide-label-mobile
            />
            <UButton
              icon="i-lucide-save"
              @click="startSave"
            >
              <span class="hidden md:inline">Save Selection</span>
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview area -->
    <div
      ref="previewArea"
      class="flex flex-1 items-center justify-center transition-colors duration-300"
      :style="bgStyle"
      @touchstart.passive="onTouchStart"
      @touchend="onTouchEnd"
    >
      <BrandPreview
        :logomark-svg="currentLogomark?.svg"
        :wordmark-svg="config.wordmark"
        :tagline-svg="config.tagline"
        :primary-color="primaryColor"
        :accent-color="accentColor"
        :wordmark-font="wordmarkFont"
        :wordmark-font-weight="wordmarkFontWeight"
        :tagline-font="taglineFont"
        :tagline-font-weight="taglineFontWeight"
        :layout="layout"
        :logo-scale="logoScale"
        :wordmark-scale="wordmarkScale"
        :tagline-scale="taglineScale"
        :brand-name="config.brandName"
        :tagline-text="config.taglineText"
        :logo-gap="logoGap"
        :tagline-gap="taglineGap"
        :wordmark-letter-spacing="wordmarkLetterSpacing"
        :tagline-letter-spacing="taglineLetterSpacing"
        :logo-offset-x="logoOffsetX"
        :logo-offset-y="logoOffsetY"
      />
    </div>

    <!-- Selection Feed -->
    <div
      v-if="selections?.length"
      class="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div class="mx-auto max-w-3xl px-4 py-8">
        <SelectionFeed
          :selections="selections"
          :config="config"
          @select="applySelection"
        />
      </div>
    </div>

    <!-- Preload fonts -->
    <div class="sr-only" aria-hidden="true">
      <span
        v-for="font in config.fonts"
        :key="font"
        :style="{ fontFamily: font }"
      >.</span>
    </div>

    <!-- Footer -->
    <div class="border-t border-zinc-200 bg-white py-4 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
      Powered by <NuxtLink
        to="/"
        class="underline hover:text-zinc-600"
      >
        Lookit
      </NuxtLink>
    </div>

    <!-- Name Modal -->
    <NameModal
      v-model:open="nameModalOpen"
      @submit="onNameSubmit"
    />

    <!-- Feedback Modal -->
    <UModal
      v-model:open="feedbackModalOpen"
    >
      <template #header>
        <h3 class="text-lg font-semibold">
          Save Your Selection
        </h3>
      </template>

      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="submitSelection"
        >
          <UFormField label="Feedback (optional)">
            <UTextarea
              v-model="feedbackMessage"
              placeholder="Any notes about this combination..."
              :rows="3"
            />
          </UFormField>
          <UButton
            type="submit"
            label="Save"
            block
          />
        </form>
      </template>
    </UModal>
  </div>
</template>
