<script setup lang="ts">
const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'submit': [name: string];
}>();

const name = ref('');

function handleSubmit() {
  const trimmed = name.value.trim();
  if (!trimmed) return;
  localStorage.setItem('lookit-client-name', trimmed);
  emit('submit', trimmed);
  emit('update:open', false);
}
</script>

<template>
  <UModal
    :open="props.open"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <h3 class="text-lg font-semibold">
        What's your name?
      </h3>
    </template>

    <template #body>
      <form
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <UInput
          v-model="name"
          placeholder="Your name"
          autofocus
        />
        <UButton
          type="submit"
          label="Continue"
          block
          :disabled="!name.trim()"
        />
      </form>
    </template>
  </UModal>
</template>
