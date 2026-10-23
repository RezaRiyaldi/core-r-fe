import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'
import type { PublicSettingValues, SettingsMetadataResponseDataItem, SettingsRequestSettings } from '@/api/generated/models'

export const useSettingsStore = defineStore('settings', () => {
  const publicSettings = ref<PublicSettingValues | null>(null)
  const metadata = ref<SettingsMetadataResponseDataItem[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<unknown>(null)

  async function fetchPublicSettings() {
    loading.value = true
    error.value = null
    try {
      const res = await api.publicSettings()
      publicSettings.value = res.data.data
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  async function fetchMetadata() {
    loading.value = true
    error.value = null
    try {
      const res = await api.settingsMetadata()
      metadata.value = res.data.data
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  async function saveSettings(settings: Record<string, unknown>) {
    saving.value = true
    try {
      await api.updateSettings({ settings: settings as SettingsRequestSettings })
      await fetchMetadata()
    } finally {
      saving.value = false
    }
  }

  return {
    publicSettings,
    metadata,
    loading,
    saving,
    error,
    fetchPublicSettings,
    fetchMetadata,
    saveSettings,
  }
})
