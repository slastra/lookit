<script setup lang="ts">
import type { PreviewConfig } from '~/types';

const props = defineProps<{
  config: PreviewConfig;
}>();

const shareUrl = ref('');
const loading = ref(false);
const toast = useToast();

async function createLink() {
  loading.value = true;
  try {
    const { id } = await $fetch<{ id: string; url: string }>('/api/previews', {
      method: 'POST',
      body: props.config,
    });
    shareUrl.value = `${window.location.origin}/p/${id}`;
    toast.add({ title: 'Share link created!', color: 'success' });
  }
  catch (err) {
    console.error('Share link error:', err);
    toast.add({ title: 'Failed to create share link', color: 'error' });
  }
  finally {
    loading.value = false;
  }
}

async function copyUrl() {
  await navigator.clipboard.writeText(shareUrl.value);
  toast.add({ title: 'Link copied to clipboard', color: 'success' });
}
</script>

<template>
  <div class="space-y-3">
    <UButton
      icon="i-lucide-share-2"
      label="Create share link"
      block
      :loading="loading"
      @click="createLink"
    />

    <div
      v-if="shareUrl"
      class="flex cursor-pointer items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
      @click="copyUrl"
    >
      <span class="min-w-0 flex-1 truncate">{{ shareUrl }}</span>
      <UIcon
        name="i-lucide-copy"
        class="size-4 shrink-0"
      />
    </div>
  </div>
</template>
