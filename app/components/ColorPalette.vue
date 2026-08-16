<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  label: string;
  hideLabelMobile?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

function normalizeHex(raw: string): string | null {
  const match = raw.trim().match(HEX_RE);
  if (!match) return null;
  const digits = match[1]!;
  const full = digits.length === 3
    ? digits.split('').map(c => c + c).join('')
    : digits;
  return `#${full.toUpperCase()}`;
}

const hexInput = ref(props.modelValue);

watch(() => props.modelValue, (value) => {
  hexInput.value = value;
});

const isValidHex = computed(() => normalizeHex(hexInput.value) !== null);

function commitHex() {
  const hex = normalizeHex(hexInput.value);
  if (hex) {
    hexInput.value = hex;
    emit('update:modelValue', hex);
  }
  else {
    hexInput.value = props.modelValue;
  }
}

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
      <div class="flex flex-col gap-2 p-2">
        <UColorPicker
          :model-value="modelValue"
          @update:model-value="onPickerChange"
        />
        <UInput
          v-model="hexInput"
          size="sm"
          :color="isValidHex ? 'neutral' : 'error'"
          placeholder="#000000"
          autocomplete="off"
          spellcheck="false"
          class="font-mono"
          aria-label="Hex color"
          @blur="commitHex"
          @keydown.enter.prevent="commitHex"
        >
          <template #leading>
            <span
              class="size-3 rounded-full ring-1 ring-zinc-300 dark:ring-zinc-600"
              :style="{ backgroundColor: modelValue }"
            />
          </template>
        </UInput>
      </div>
    </template>
  </UPopover>
</template>
