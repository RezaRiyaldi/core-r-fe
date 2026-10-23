<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const auth = useAuthStore()
const { t } = useI18n()
</script>

<template>
  <div>
    <h1 class="mb-2 text-2xl font-semibold text-surface-900">{{ t('nav.dashboard') }}</h1>
    <p class="text-surface-500">{{ t('common.welcome', { name: auth.user?.name }) }}</p>
  </div>
</template>
