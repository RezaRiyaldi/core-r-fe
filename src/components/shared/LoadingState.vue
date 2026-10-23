<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="flex items-center justify-center py-16 text-surface-400">
    <ProgressSpinner style="width: 2rem; height: 2rem" />
    <span class="ml-3 text-sm">{{ t('common.loading') }}</span>
  </div>
</template>
