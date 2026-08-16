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
    class="flex flex-col"
  >
    <div class="flex shrink-0 items-center justify-between px-4 pt-3 pb-2">
      <h3 class="text-sm font-semibold">
        Saved Selections
      </h3>
      <span class="text-xs text-zinc-500">{{ selections.length }}</span>
    </div>

    <!--
      Exactly one row tall, so the panel costs the lockup as little height as it
      can while still showing a whole selection. Rows are a fixed height and
      snap, so scrolling lands on one rather than between two.
    -->
    <div class="h-32 snap-y snap-mandatory divide-y divide-zinc-200 overflow-y-auto dark:divide-zinc-800">
      <div
        v-for="sel in selections"
        :key="sel.id"
        class="grid h-32 cursor-pointer snap-start items-center gap-3 px-4"
        style="grid-template-columns: auto 1fr;"
        @click="emit('select', sel)"
      >
        <!-- Mini preview -->
        <div
          class="flex size-24 items-center justify-center overflow-hidden rounded-lg"
          :style="{ backgroundColor: sel.lockup.backgroundColor }"
        >
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
            :size="THUMBNAIL_SIZE"
          />
        </div>

        <!-- Details -->
        <div class="min-w-0">
          <div class="flex items-baseline justify-between gap-2">
            <span class="truncate font-medium">{{ sel.name }}</span>
            <span class="shrink-0 text-xs text-zinc-500">{{ formatDate(sel.created_at) }}</span>
          </div>
          <div class="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
            <span>{{ config.logomarks[sel.lockup.logomarkIndex]?.label || 'Logomark' }}</span>
            <span class="mx-1">&middot;</span>
            <span>{{ sel.lockup.wordmarkFont }}</span>
            <span class="mx-1">&middot;</span>
            <span class="capitalize">{{ sel.lockup.layout }}</span>
          </div>
          <p
            v-if="sel.message"
            class="mt-1 line-clamp-2 text-sm text-zinc-500 italic"
          >
            "{{ sel.message }}"
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
