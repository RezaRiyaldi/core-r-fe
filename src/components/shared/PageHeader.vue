<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="mb-6">
    <h1 class="text-2xl font-semibold text-surface-900">{{ title }}</h1>
    <p v-if="description" class="mt-1 text-sm text-surface-500">{{ description }}</p>
    <div v-if="$slots.actions" class="mt-4 flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
