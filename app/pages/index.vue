<script setup lang="ts">
import type { EditorState, PreviewConfig } from '~/types';
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

const previewableLogomarks = computed(() =>
  logomarks.value
    .map((mark, index) => ({ ...mark, _idx: index }))
    .filter((mark): mark is { label: string; svg: string; _idx: number } => !!mark.svg),
);

const previewLogomark = computed(() => {
  const selected = logomarks.value[previewIndex.value];
  if (selected?.svg) return selected.svg;
  const first = logomarks.value.find(l => l.svg);
  return first?.svg || undefined;
});

const bgStyle = useBgStyle(bgColor);

/**
 * Sessions. The editor holds everything in memory, so a refresh used to throw
 * the work away; the active session is written back as it changes and reopened
 * on load, and the logo menu switches between the recent ones.
 */
const { sessions, activeId, load, save, startNew, open, remove } = useEditorSessions();

const editorState = computed<EditorState>(() => ({
  logomarks: logomarks.value,
  wordmark: wordmark.value,
  taglineSvg: taglineSvg.value,
  brandName: brandName.value,
  taglineText: taglineText.value,
  selectedFonts: selectedFonts.value,
  wordmarkFont: wordmarkFont.value,
  wordmarkFontWeight: wordmarkFontWeight.value,
  taglineFont: taglineFont.value,
  taglineFontWeight: taglineFontWeight.value,
  primaryColor: primaryColor.value,
  accentColor: accentColor.value,
  bgColor: bgColor.value,
  layout: layout.value,
  logoScale: logoScale.value,
  wordmarkScale: wordmarkScale.value,
  taglineScale: taglineScale.value,
  logoGap: logoGap.value,
  taglineGap: taglineGap.value,
  logoOffsetX: logoOffsetX.value,
  logoOffsetY: logoOffsetY.value,
  wordmarkLetterSpacing: wordmarkLetterSpacing.value,
  taglineLetterSpacing: taglineLetterSpacing.value,
}));

function restore(state: EditorState) {
  logomarks.value = state.logomarks;
  wordmark.value = state.wordmark;
  taglineSvg.value = state.taglineSvg;
  brandName.value = state.brandName;
  taglineText.value = state.taglineText;
  selectedFonts.value = state.selectedFonts;
  wordmarkFont.value = state.wordmarkFont;
  wordmarkFontWeight.value = state.wordmarkFontWeight;
  taglineFont.value = state.taglineFont;
  taglineFontWeight.value = state.taglineFontWeight;
  primaryColor.value = state.primaryColor;
  accentColor.value = state.accentColor;
  bgColor.value = state.bgColor;
  layout.value = state.layout;
  logoScale.value = state.logoScale;
  wordmarkScale.value = state.wordmarkScale;
  taglineScale.value = state.taglineScale;
  logoGap.value = state.logoGap;
  taglineGap.value = state.taglineGap;
  logoOffsetX.value = state.logoOffsetX;
  logoOffsetY.value = state.logoOffsetY;
  wordmarkLetterSpacing.value = state.wordmarkLetterSpacing;
  taglineLetterSpacing.value = state.taglineLetterSpacing;
  previewIndex.value = 0;
}

// Held off until mounted so the first render doesn't wait on storage, and so a
// restore doesn't immediately look like an edit worth saving.
const restored = ref(false);
onMounted(() => {
  const session = load();
  if (session) restore(session.state);
  restored.value = true;
});

let saveTimer: ReturnType<typeof setTimeout> | undefined;
watch(editorState, (state) => {
  if (!restored.value) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => save(state), 500);
}, { deep: true });
onUnmounted(() => clearTimeout(saveTimer));

function relativeTime(epoch: number): string {
  const minutes = Math.round((Date.now() - epoch) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function deleteActiveSession() {
  if (!activeId.value) return;
  remove(activeId.value);
  // What was on screen is gone, so hand back a blank slate rather than leave it
  // editable but no longer saved anywhere.
  restore(startNew());
}

const sessionMenu = computed(() => [
  [
    {
      label: 'New session',
      icon: 'i-lucide-plus',
      onSelect: () => restore(startNew()),
    },
    // Deleting acts on the session in front of you: a per-row submenu would
    // turn each row into a submenu trigger and stop it opening on click.
    ...(activeId.value
      ? [{
          label: 'Delete this session',
          icon: 'i-lucide-trash-2',
          color: 'error' as const,
          onSelect: () => deleteActiveSession(),
        }]
      : []),
  ],
  sessions.value.map(session => ({
    label: session.name,
    // The active one is already on screen, so mark it rather than reopen it.
    icon: session.id === activeId.value ? 'i-lucide-check' : 'i-lucide-clock',
    kbds: [relativeTime(session.updatedAt)],
    onSelect: () => {
      const state = open(session.id);
      if (state) restore(state);
    },
  })),
]);

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
    <!-- Left controls: inline panel on desktop, slideover menu on mobile -->
    <UDashboardSidebar
      id="editor"
      :default-size="25"
      :min-size="20"
      :max-size="35"
      resizable
      :ui="{ body: 'gap-0 p-4', footer: 'border-t border-default p-4' }"
    >
      <template #header>
        <!-- The logo doubles as the session menu: new session, or reopen a recent one. -->
        <UDropdownMenu
          :items="sessionMenu"
          :ui="{ content: 'w-60' }"
        >
          <UButton
            variant="ghost"
            color="neutral"
            class="-ms-1.5 gap-2 px-1.5"
            aria-label="Sessions"
          >
            <span class="flex items-center justify-center rounded-lg bg-primary p-1.5">
              <UIcon
                name="i-lucide-scan-eye"
                class="size-5 text-(--ui-bg)"
              />
            </span>
            <span class="text-lg font-bold">Lookit</span>
            <UIcon
              name="i-lucide-chevron-down"
              class="size-4 text-dimmed"
            />
          </UButton>
        </UDropdownMenu>
      </template>

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
                value-key="value"
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

      <template #footer>
        <ShareLink
          :config="config"
          class="w-full"
        />
      </template>
    </UDashboardSidebar>

    <!-- Right panel: fixed preview -->
    <UDashboardPanel id="preview">
      <!-- Mobile only: desktop has the controls inline, so it needs no bar -->
      <UDashboardNavbar
        title="Lookit"
        class="lg:hidden"
      />

      <div
        class="flex flex-1 flex-col transition-colors duration-300"
        :style="bgStyle"
      >
        <div class="flex min-h-0 flex-1 items-center justify-center p-4">
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
        </div>

        <!--
          Logomark options as a filmstrip rather than a wrapping grid: it costs
          the same band of height whether there are three marks or thirty, so
          the lockup above keeps the rest. Each tile is the real lockup at a
          smaller rung, not a scaled-down copy, so it sits in its tile the way
          the big one sits on the page.
        -->
        <div
          v-if="previewableLogomarks.length > 1"
          class="shrink-0 snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div class="flex w-max items-stretch gap-3 px-4 pb-4">
            <div
              v-for="mark in previewableLogomarks"
              :key="mark._idx"
              class="flex shrink-0 cursor-pointer snap-center flex-col items-center gap-1.5"
              @click="previewIndex = mark._idx"
            >
              <span
                class="text-xs font-medium"
                :style="{ color: primaryColor }"
              >{{ mark.label }}</span>
              <div
                class="flex min-w-20 flex-1 items-center justify-center rounded-lg border-2 px-3 py-2 transition-colors"
                :style="{ borderColor: previewIndex === mark._idx ? primaryColor : primaryColor + '33' }"
              >
                <BrandPreview
                  :logomark-svg="mark.svg"
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
                  :size="THUMBNAIL_SIZE"
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
