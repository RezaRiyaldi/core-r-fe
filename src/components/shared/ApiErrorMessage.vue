<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  error: unknown
}>()

const { t } = useI18n()

const message = computed(() => {
  const err = props.error as { response?: { data?: { message?: string }; status?: number } }
  if (err?.response?.data?.message) return err.response.data.message
  if (err?.response?.status === 403) return t('error.forbidden')
  if (err?.response?.status === 404) return t('error.notFound')
  return t('common.error')
})
</script>

<template>
  <Message severity="error" :closable="false">{{ message }}</Message>
</template>
