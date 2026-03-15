<script setup lang="ts">
defineProps<{
  modelValue: string | null;
  label?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | null];
}>();

const file = ref<File | null>(null);

watch(file, (f) => {
  if (!f) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result;
    if (typeof text === 'string') {
      emit('update:modelValue', text);
    }
  };
  reader.readAsText(f);
});

function clear() {
  file.value = null;
  emit('update:modelValue', null);
}
</script>

<template>
  <div>
    <label
      v-if="label"
      class="text-sm font-medium text-zinc-700 dark:text-zinc-300"
    >{{ label }}</label>

    <div
      v-if="modelValue"
      :class="label ? 'mt-1' : ''"
    >
      <div class="relative rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700">
        <div
          v-dompurify-html="modelValue"
          class="mx-auto h-16 w-16 [&>svg]:h-full [&>svg]:w-full"
        />
        <UButton
          icon="i-lucide-x"
          size="xs"
          color="neutral"
          variant="ghost"
          class="absolute top-1 right-1"
          @click="clear"
        />
      </div>
    </div>

    <UFileUpload
      v-else
      v-slot="{ open, dragging }"
      v-model="file"
      :class="label ? 'mt-1' : ''"
      accept=".svg,image/svg+xml"
    >
      <div
        class="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-6 transition-colors"
        :class="dragging ? 'border-primary bg-primary/10' : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-600'"
        @click="open()"
      >
        <UIcon
          name="i-lucide-upload"
          class="size-6 text-zinc-400"
        />
        <p class="text-sm text-zinc-600 dark:text-zinc-400">
          Drop SVG here or <span class="font-medium text-primary">browse</span>
        </p>
      </div>
    </UFileUpload>
  </div>
</template>
