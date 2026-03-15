<script setup lang="ts">
import type { PreviewConfig, Selection } from '~/types';

defineProps<{
  selections: Selection[];
  config: PreviewConfig;
}>();

const emit = defineEmits<{
  select: [selection: Selection];
}>();

function formatDate(epoch: number): string {
  return new Date(epoch * 1000).toLocaleString();
}
</script>

<template>
  <div
    v-if="selections.length"
    class="space-y-4"
  >
    <h3 class="text-lg font-semibold">
      Saved Selections
    </h3>

    <div
      v-for="sel in selections"
      :key="sel.id"
      class="grid cursor-pointer gap-4"
      style="grid-template-columns: auto 1fr;"
      @click="emit('select', sel)"
    >
      <!-- Mini preview -->
      <div
        class="flex items-center justify-center overflow-hidden rounded-lg"
        style="aspect-ratio: 1; height: 100%;"
        :style="{ backgroundColor: sel.lockup.backgroundColor }"
      >
        <div class="scale-[0.25] transform">
          <BrandPreview
            v-if="config.logomarks[sel.lockup.logomarkIndex]"
            :logomark-svg="config.logomarks[sel.lockup.logomarkIndex]!.svg"
            :wordmark-svg="config.wordmark"
            :tagline-svg="config.tagline"
            :primary-color="sel.lockup.primaryColor"
            :accent-color="sel.lockup.accentColor"
            :wordmark-font="sel.lockup.wordmarkFont"
            :wordmark-font-weight="sel.lockup.wordmarkFontWeight"
            :tagline-font="sel.lockup.taglineFont"
            :tagline-font-weight="sel.lockup.taglineFontWeight"
            :layout="sel.lockup.layout"
            :logo-scale="sel.lockup.logoScale"
            :wordmark-scale="sel.lockup.wordmarkScale"
            :tagline-scale="sel.lockup.taglineScale"
            :brand-name="config.brandName"
            :tagline-text="config.taglineText"
            :logo-gap="sel.lockup.logoGap"
            :tagline-gap="sel.lockup.taglineGap"
            :wordmark-letter-spacing="sel.lockup.wordmarkLetterSpacing"
            :tagline-letter-spacing="sel.lockup.taglineLetterSpacing"
            :logo-offset-x="sel.lockup.logoOffsetX"
            :logo-offset-y="sel.lockup.logoOffsetY"
          />
        </div>
      </div>

      <!-- Details card -->
      <UCard class="min-w-0 flex-1 transition-shadow hover:shadow-md">
        <div class="relative">
          <span class="absolute top-0 right-0 text-xs text-zinc-500">{{ formatDate(sel.created_at) }}</span>
          <span class="font-medium">{{ sel.name }}</span>
          <div class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span>{{ config.logomarks[sel.lockup.logomarkIndex]?.label || 'Logomark' }}</span>
            <span class="mx-1">&middot;</span>
            <span>{{ sel.lockup.wordmarkFont }}</span>
            <span class="mx-1">&middot;</span>
            <span class="capitalize">{{ sel.lockup.layout }}</span>
          </div>
          <p
            v-if="sel.message"
            class="mt-2 text-sm text-zinc-500 italic"
          >
            "{{ sel.message }}"
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>
