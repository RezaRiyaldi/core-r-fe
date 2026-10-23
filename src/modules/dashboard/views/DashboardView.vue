<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const auth = useAuthStore()
const { t } = useI18n()
</script>

<template>
  <div class="p-8">
    <h1 class="mb-4 text-2xl font-semibold">{{ t('app.name') }}</h1>
    <p class="mb-4 text-surface-600">
      {{ t('common.welcome', { name: auth.user?.name }) }}
    </p>
    <Button :label="t('auth.logout')" severity="secondary" @click="auth.logout()" />
  </div>
</template>
