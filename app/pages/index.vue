<script setup lang="ts">
import type { PreviewConfig } from '~/types';
import { curatedFonts, getFontWeights, clampWeight } from '~/utils/fonts';

const logomarks = ref<{ label: string; svg: string | null }[]>([
  { label: 'Option A', svg: null },
]);
const wordmark = ref<string | null>(null);
const taglineSvg = ref<string | null>(null);
const brandName = ref('');
const taglineText = ref('');
const selectedFonts = ref<string[]>(['Inter']);
const wordmarkFont = ref('Inter');
const wordmarkFontWeight = ref(700);
const taglineFont = ref('Inter');
const taglineFontWeight = ref(400);
const primaryColor = ref('#18181b');
const accentColor = ref('#3b82f6');
const layout = ref<'horizontal' | 'stacked' | 'mark-only'>('stacked');
const logoScale = ref(1);
const wordmarkScale = ref(1);
const taglineScale = ref(1);
const logoGap = ref(1);
const taglineGap = ref(1);
const logoOffsetX = ref(0);
const logoOffsetY = ref(0);
const wordmarkLetterSpacing = ref(0);
const taglineLetterSpacing = ref(0);
const bgColor = ref('#ffffff');

const fontOptions = curatedFonts.map(f => ({ label: f, value: f }));

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

// Logomark rename modal
const renameModalOpen = ref(false);
const renameIndex = ref(0);
const renameLabel = ref('');

function openRename(index: number) {
  renameIndex.value = index;
  renameLabel.value = logomarks.value[index]!.label;
  renameModalOpen.value = true;
}

function submitRename() {
  const trimmed = renameLabel.value.trim();
  if (!trimmed) return;
  logomarks.value[renameIndex.value]!.label = trimmed;
  renameModalOpen.value = false;
}
const fontList = computed(() => curatedFonts as readonly string[]);

function addLogomark() {
  const letter = String.fromCharCode(65 + logomarks.value.length);
  logomarks.value.push({ label: `Option ${letter}`, svg: null });
}

const bulkUploadRef = ref<HTMLInputElement | null>(null);

function onBulkUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (!files?.length) return;

  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        const letter = String.fromCharCode(65 + logomarks.value.length);
        logomarks.value.push({ label: `Option ${letter}`, svg: text });
      }
    };
    reader.readAsText(file);
  });

  input.value = '';
}

function removeLogomark(index: number) {
  logomarks.value.splice(index, 1);
}

const previewIndex = ref(0);

const previewLogomark = computed(() => {
  const selected = logomarks.value[previewIndex.value];
  if (selected?.svg) return selected.svg;
  const first = logomarks.value.find(l => l.svg);
  return first?.svg || undefined;
});

const bgStyle = useBgStyle(bgColor);

const config = computed<PreviewConfig>(() => ({
  logomarks: logomarks.value
    .filter((l): l is { label: string; svg: string } => l.svg !== null),
  wordmark: wordmark.value || undefined,
  tagline: taglineSvg.value || undefined,
  fonts: selectedFonts.value,
  primaryColor: primaryColor.value,
  accentColor: accentColor.value,
  layout: layout.value,
  logoScale: logoScale.value,
  wordmarkScale: wordmarkScale.value,
  taglineScale: taglineScale.value,
  backgroundColor: bgColor.value,
  brandName: brandName.value || undefined,
  taglineText: taglineText.value || undefined,
  defaultWordmarkFont: wordmarkFont.value,
  defaultTaglineFont: taglineFont.value,
  defaultWordmarkWeight: wordmarkFontWeight.value,
  defaultTaglineWeight: taglineFontWeight.value,
  logoGap: logoGap.value,
  taglineGap: taglineGap.value,
  wordmarkLetterSpacing: wordmarkLetterSpacing.value,
  taglineLetterSpacing: taglineLetterSpacing.value,
  logoOffsetX: logoOffsetX.value,
  logoOffsetY: logoOffsetY.value,
}));
</script>

<template>
  <UDashboardGroup>
    <!-- Left panel: scrollable controls -->
    <UDashboardPanel
      id="editor"
      :default-size="25"
      :min-size="20"
      :max-size="35"
      resizable
    >
      <UDashboardNavbar>
        <template #leading>
          <div class="flex items-center gap-2">
            <div class="flex items-center justify-center rounded-lg bg-primary p-1.5">
              <UIcon
                name="i-lucide-scan-eye"
                class="size-5 text-(--ui-bg)"
              />
            </div>
            <span class="text-lg font-bold">Lookit</span>
          </div>
        </template>
      </UDashboardNavbar>

      <div class="flex-1 overflow-y-auto p-4">
        <!-- Logomarks -->
        <UCollapsible default-open class="group">
          <UButton
            variant="ghost"
            block
            class="justify-start"
            color="neutral"
            icon="i-lucide-shapes"
            label="Logomarks"
            trailing-icon="i-lucide-chevron-down"
            :ui="{ trailingIcon: 'transition-transform group-data-[state=open]:rotate-180' }"
          />
          <template #content>
            <div class="space-y-4 px-2 pt-3 pb-6">
              <UCard
                v-for="(mark, i) in logomarks"
                :key="i"
                variant="subtle"
              >
                <template #header>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">{{ mark.label }}</span>
                    <UDropdownMenu
                      :items="[
                        { label: 'Rename', icon: 'i-lucide-pencil', onSelect: () => openRename(i) },
                        { label: 'Remove', icon: 'i-lucide-trash-2', color: 'error' as const, disabled: logomarks.length <= 1, onSelect: () => removeLogomark(i) },
                      ]"
                    >
                      <UButton
                        icon="i-lucide-ellipsis-vertical"
                        size="xs"
                        variant="ghost"
                        color="neutral"
                      />
                    </UDropdownMenu>
                  </div>
                </template>
                <SvgUploadSlot
                  :model-value="mark.svg"
                  @update:model-value="mark.svg = $event"
                />
              </UCard>
              <UButton
                icon="i-lucide-plus"
                label="Add Empty"
                variant="outline"
                color="neutral"
                size="sm"
                block
                @click="addLogomark"
              />
              <UButton
                icon="i-lucide-upload"
                label="Upload SVGs"
                variant="outline"
                color="neutral"
                size="sm"
                block
                @click="bulkUploadRef?.click()"
              />
              <input
                ref="bulkUploadRef"
                type="file"
                accept=".svg,image/svg+xml"
                multiple
                class="hidden"
                @change="onBulkUpload"
              />
            </div>
          </template>
        </UCollapsible>

        <USeparator />

        <!-- Wordmark & Tagline -->
        <UCollapsible class="group">
          <UButton
            variant="ghost"
            block
            class="justify-start"
            color="neutral"
            icon="i-lucide-type"
            label="Wordmark & Tagline"
            trailing-icon="i-lucide-chevron-down"
            :ui="{ trailingIcon: 'transition-transform group-data-[state=open]:rotate-180' }"
          />
          <template #content>
            <div class="space-y-4 px-2 pt-3 pb-6">
              <SvgUploadSlot
                v-model="wordmark"
                label="Wordmark SVG"
              />
              <SvgUploadSlot
                v-model="taglineSvg"
                label="Tagline SVG"
              />
            </div>
          </template>
        </UCollapsible>

        <USeparator />

        <!-- Brand Text -->
        <UCollapsible class="group">
          <UButton
            variant="ghost"
            block
            class="justify-start"
            color="neutral"
            icon="i-lucide-text-cursor"
            label="Brand Text"
            trailing-icon="i-lucide-chevron-down"
            :ui="{ trailingIcon: 'transition-transform group-data-[state=open]:rotate-180' }"
          />
          <template #content>
            <div class="space-y-3 px-2 pt-3 pb-6">
              <UFormField label="Brand Name">
                <UInput
                  v-model="brandName"
                  placeholder="Brand Name"
                />
              </UFormField>
              <UFormField label="Tagline">
                <UInput
                  v-model="taglineText"
                  placeholder="Your tagline here"
                />
              </UFormField>
            </div>
          </template>
        </UCollapsible>

        <USeparator />

        <!-- Fonts -->
        <UCollapsible class="group">
          <UButton
            variant="ghost"
            block
            class="justify-start"
            color="neutral"
            icon="i-lucide-a-large-small"
            label="Fonts"
            trailing-icon="i-lucide-chevron-down"
            :ui="{ trailingIcon: 'transition-transform group-data-[state=open]:rotate-180' }"
          />
          <template #content>
            <div class="space-y-4 px-2 pt-3 pb-6">
              <UFormField label="Available Fonts">
                <USelectMenu
                  v-model="selectedFonts"
                  :items="fontOptions"
                  multiple
                  placeholder="Select fonts"
                >
                  <template #item-label="{ item }">
                    <span :style="{ fontFamily: item.label }">{{ item.label }}</span>
                  </template>
                </USelectMenu>
              </UFormField>
              <div class="flex gap-2">
                <UFormField label="Default Wordmark Font" class="flex-1">
                  <USelect
                    v-model="wordmarkFont"
                    :items="fontList"
                  />
                </UFormField>
                <UFormField label="Weight" class="w-24">
                  <USelect
                    v-model="wordmarkFontWeight"
                    :items="wordmarkWeightOptions"
                  />
                </UFormField>
              </div>
              <UFormField label="Wordmark Letter Spacing">
                <USlider
                  v-model="wordmarkLetterSpacing"
                  color="neutral"
                  :min="-0.05"
                  :max="0.3"
                  :step="0.01"
                />
              </UFormField>
              <div class="flex gap-2">
                <UFormField label="Default Tagline Font" class="flex-1">
                  <USelect
                    v-model="taglineFont"
                    :items="fontList"
                  />
                </UFormField>
                <UFormField label="Weight" class="w-24">
                  <USelect
                    v-model="taglineFontWeight"
                    :items="taglineWeightOptions"
                  />
                </UFormField>
              </div>
              <UFormField label="Tagline Letter Spacing">
                <USlider
                  v-model="taglineLetterSpacing"
                  color="neutral"
                  :min="-0.05"
                  :max="0.3"
                  :step="0.01"
                />
              </UFormField>
              <UButton
                label="Reset"
                icon="i-lucide-rotate-ccw"
                variant="outline"
                color="neutral"
                size="sm"
                block
                @click="wordmarkFont = 'Inter'; wordmarkFontWeight = 700; taglineFont = 'Inter'; taglineFontWeight = 400; wordmarkLetterSpacing = 0; taglineLetterSpacing = 0"
              />
            </div>
          </template>
        </UCollapsible>

        <USeparator />

        <!-- Colors -->
        <UCollapsible class="group">
          <UButton
            variant="ghost"
            block
            class="justify-start"
            color="neutral"
            icon="i-lucide-palette"
            label="Colors"
            trailing-icon="i-lucide-chevron-down"
            :ui="{ trailingIcon: 'transition-transform group-data-[state=open]:rotate-180' }"
          />
          <template #content>
            <div class="flex flex-wrap gap-2 px-2 pt-3 pb-6">
              <ColorPalette
                v-model="primaryColor"
                label="Primary"
              />
              <ColorPalette
                v-model="accentColor"
                label="Accent"
              />
              <ColorPalette
                v-model="bgColor"
                label="Background"
              />
            </div>
          </template>
        </UCollapsible>

        <USeparator />

        <!-- Layout -->
        <UCollapsible class="group">
          <UButton
            variant="ghost"
            block
            class="justify-start"
            color="neutral"
            icon="i-lucide-layout-grid"
            label="Layout"
            trailing-icon="i-lucide-chevron-down"
            :ui="{ trailingIcon: 'transition-transform group-data-[state=open]:rotate-180' }"
          />
          <template #content>
            <div class="flex gap-2 px-2 pt-3 pb-6">
              <UButton
                label="Horizontal"
                :variant="layout === 'horizontal' ? 'solid' : 'outline'"
                color="neutral"
                size="sm"
                @click="layout = 'horizontal'"
              />
              <UButton
                label="Stacked"
                :variant="layout === 'stacked' ? 'solid' : 'outline'"
                color="neutral"
                size="sm"
                @click="layout = 'stacked'"
              />
              <UButton
                label="Mark Only"
                :variant="layout === 'mark-only' ? 'solid' : 'outline'"
                color="neutral"
                size="sm"
                @click="layout = 'mark-only'"
              />
            </div>
          </template>
        </UCollapsible>

        <USeparator />

        <!-- Scale -->
        <UCollapsible class="group">
          <UButton
            variant="ghost"
            block
            class="justify-start"
            color="neutral"
            icon="i-lucide-maximize-2"
            label="Proportions"
            trailing-icon="i-lucide-chevron-down"
            :ui="{ trailingIcon: 'transition-transform group-data-[state=open]:rotate-180' }"
          />
          <template #content>
            <div class="space-y-4 px-2 pt-3 pb-6">
              <UFormField label="Logo Scale">
                <USlider
                  v-model="logoScale"
                  color="neutral"
                  :min="0.5"
                  :max="3"
                  :step="0.1"
                />
              </UFormField>
              <UFormField label="Wordmark Scale">
                <USlider
                  v-model="wordmarkScale"
                  color="neutral"
                  :min="0.5"
                  :max="3"
                  :step="0.1"
                />
              </UFormField>
              <UFormField label="Tagline Scale">
                <USlider
                  v-model="taglineScale"
                  color="neutral"
                  :min="0.5"
                  :max="3"
                  :step="0.1"
                />
              </UFormField>
              <UFormField label="Logo Gap">
                <USlider
                  v-model="logoGap"
                  color="neutral"
                  :min="0.25"
                  :max="3"
                  :step="0.25"
                />
              </UFormField>
              <UFormField label="Tagline Gap">
                <USlider
                  v-model="taglineGap"
                  color="neutral"
                  :min="0.25"
                  :max="3"
                  :step="0.25"
                />
              </UFormField>
              <UFormField label="Logo Offset X">
                <USlider
                  v-model="logoOffsetX"
                  color="neutral"
                  :min="-3"
                  :max="3"
                  :step="0.125"
                />
              </UFormField>
              <UFormField label="Logo Offset Y">
                <USlider
                  v-model="logoOffsetY"
                  color="neutral"
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
        </UCollapsible>

      </div>

      <div class="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <ShareLink :config="config" />
      </div>
    </UDashboardPanel>

    <!-- Right panel: fixed preview -->
    <UDashboardPanel id="preview">
      <div
        class="flex h-full flex-col items-center justify-center transition-colors duration-300"
        :style="bgStyle"
      >
        <BrandPreview
          :logomark-svg="previewLogomark"
          :wordmark-svg="wordmark || undefined"
          :tagline-svg="taglineSvg || undefined"
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
          :brand-name="brandName || undefined"
          :tagline-text="taglineText || undefined"
          :logo-gap="logoGap"
          :tagline-gap="taglineGap"
          :wordmark-letter-spacing="wordmarkLetterSpacing"
          :tagline-letter-spacing="taglineLetterSpacing"
          :logo-offset-x="logoOffsetX"
          :logo-offset-y="logoOffsetY"
        />

        <!-- Mini previews of all logomarks -->
        <div
          v-if="logomarks.filter(l => l.svg).length > 1"
          class="mt-12 flex flex-wrap justify-center gap-6"
        >
          <div
            v-for="(mark, origIndex) in logomarks.map((m, idx) => ({ ...m, _idx: idx })).filter(l => l.svg)"
            :key="origIndex"
            class="flex cursor-pointer flex-col items-center gap-2"
            @click="previewIndex = mark._idx"
          >
            <p
              class="text-xs font-medium"
              :style="{ color: primaryColor }"
            >
              {{ mark.label }}
            </p>
            <div
              class="flex h-32 w-40 items-center justify-center overflow-hidden rounded-lg border-2 p-3 transition-colors"
              :style="{ borderColor: previewIndex === mark._idx ? primaryColor : primaryColor + '33' }"
            >
              <div class="scale-[0.35] transform">
                <BrandPreview
                  :logomark-svg="mark.svg!"
                  :wordmark-svg="wordmark || undefined"
                  :tagline-svg="taglineSvg || undefined"
                  :primary-color="primaryColor"
                  :accent-color="accentColor"
                  :wordmark-font="wordmarkFont"
                  :tagline-font="taglineFont"
                  :layout="layout"
                  :logo-scale="logoScale"
                  :wordmark-scale="wordmarkScale"
                  :tagline-scale="taglineScale"
                  :brand-name="brandName || undefined"
                  :tagline-text="taglineText || undefined"
                  :logo-gap="logoGap"
                  :tagline-gap="taglineGap"
                  :wordmark-letter-spacing="wordmarkLetterSpacing"
                  :tagline-letter-spacing="taglineLetterSpacing"
                  :logo-offset-x="logoOffsetX"
                  :logo-offset-y="logoOffsetY"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </UDashboardPanel>
    <!-- Preload fonts -->
    <div class="sr-only" aria-hidden="true">
      <span
        v-for="font in selectedFonts"
        :key="font"
        :style="{ fontFamily: font }"
      >.</span>
    </div>
    <!-- Rename Modal -->
    <UModal v-model:open="renameModalOpen">
      <template #header>
        <h3 class="text-lg font-semibold">
          Rename Logomark
        </h3>
      </template>
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="submitRename"
        >
          <UInput
            v-model="renameLabel"
            placeholder="Option name"
            autofocus
          />
          <UButton
            type="submit"
            label="Save"
            block
            :disabled="!renameLabel.trim()"
          />
        </form>
      </template>
    </UModal>
  </UDashboardGroup>
</template>
