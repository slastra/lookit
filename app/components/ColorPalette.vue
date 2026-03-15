<script setup lang="ts">
defineProps<{
  modelValue: string;
  label: string;
  hideLabelMobile?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

function onPickerChange(value: string | undefined) {
  if (value) {
    emit('update:modelValue', value);
  }
}
</script>

<template>
  <UPopover>
    <UButton
      color="neutral"
      variant="outline"
    >
      <template #leading>
        <span
          class="size-3 rounded-full ring-1 ring-zinc-300 dark:ring-zinc-600"
          :style="{ backgroundColor: modelValue }"
        />
      </template>
      <span :class="hideLabelMobile ? 'hidden md:inline' : ''">{{ label }}</span>
    </UButton>

    <template #content>
      <UColorPicker
        :model-value="modelValue"
        class="p-2"
        @update:model-value="onPickerChange"
      />
    </template>
  </UPopover>
</template>
