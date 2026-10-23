<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  message?: string
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-surface-400">
    <span class="pi pi-inbox text-4xl mb-4" />
    <p class="text-sm">{{ message ?? t('common.empty') }}</p>
  </div>
</template>
