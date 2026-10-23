<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useSettingsStore } from '../store'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingState from '@/components/shared/LoadingState.vue'
import ApiErrorMessage from '@/components/shared/ApiErrorMessage.vue'

const { t } = useI18n()
const toast = useToast()
const store = useSettingsStore()
const form = ref<Record<string, unknown>>({})
const isDirty = ref(false)

const editableSettings = computed(() => store.metadata.filter((item) => item.editable && item.key))
const longTextKeys = computed(() => new Set(store.metadata.filter((item) => {
  const value = (item as { value?: unknown }).value
  return item.editable && item.key && typeof value === 'string' && value.length > 60
}).map((item) => item.key!)))
const settingGroups = computed(() => {
  const groups = new Map<string, typeof editableSettings.value>()
  for (const item of editableSettings.value) {
    const group = item.group || 'general'
    groups.set(group, [...(groups.get(group) ?? []), item])
  }
  return Array.from(groups, ([name, items]) => ({ name, items }))
})

onMounted(async () => {
  await store.fetchMetadata()
  store.metadata.forEach((item) => {
    if (item.key && item.editable) form.value[item.key] = item.value ?? item.default ?? null
  })
})

function onInput() { isDirty.value = true }

async function save() {
  try {
    await store.saveSettings(form.value)
    isDirty.value = false
    toast.add({ severity: 'success', summary: t('settings.savedSuccess'), life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: t('common.error'), life: 4000 })
  }
}
</script>

<template>
  <div class="settings-page">
    <PageHeader :title="t('settings.title')" :description="t('settings.description')">
      <template #actions>
        <Button :label="t('common.save')" icon="pi pi-check" :loading="store.saving" :disabled="!isDirty" @click="save" />
      </template>
    </PageHeader>

    <LoadingState v-if="store.loading" />
    <ApiErrorMessage v-else-if="store.error" :error="store.error" />

    <div v-else-if="editableSettings.length" class="settings-layout">
      <aside class="settings-aside">
        <div class="settings-aside-icon"><i class="pi pi-sliders-h" /></div>
        <h2>{{ t('settings.preferencesTitle') }}</h2>
        <p>{{ t('settings.preferencesDescription') }}</p>
        <div class="settings-aside-note"><i class="pi pi-info-circle" /><span>{{ t('settings.saveHint') }}</span></div>
      </aside>

      <div class="settings-groups">
        <section v-for="group in settingGroups" :key="group.name" class="settings-group">
          <header class="settings-group-header">
            <div class="settings-group-icon"><i class="pi pi-cog" /></div>
            <div><p class="settings-group-kicker">{{ t('settings.groupLabel') }}</p><h2>{{ group.name }}</h2></div>
            <span class="settings-group-count">{{ group.items.length }}</span>
          </header>
          <div class="settings-fields">
            <div v-for="item in group.items" :key="item.key" class="setting-row">
              <div class="setting-copy">
                <label :for="`setting-${item.key}`" class="form-label">{{ item.key }}</label>
                <p v-if="item.description" class="setting-description">{{ item.description }}</p>
                <span class="setting-source"><i class="pi pi-database" /> {{ item.source || item.type }}</span>
              </div>
              <div class="setting-control">
                <div v-if="item.type === 'boolean'" class="setting-switch-wrap">
                  <ToggleSwitch :input-id="`setting-${item.key}`" v-model="(form as Record<string, boolean>)[item.key!]" @change="onInput" />
                  <span class="setting-switch-state">{{ (form as Record<string, boolean>)[item.key!] ? t('common.enabled') : t('common.disabled') }}</span>
                </div>
                <InputNumber
                  v-else-if="item.type === 'integer' || item.type === 'number'"
                  :input-id="`setting-${item.key}`"
                  v-model="(form as Record<string, number>)[item.key!]"
                  class="w-full sm:max-w-[220px]"
                  @input="onInput"
                />
                <Textarea
                  v-else-if="longTextKeys.has(item.key!)"
                  :id="`setting-${item.key}`"
                  v-model="(form as Record<string, string>)[item.key!]"
                  class="w-full sm:max-w-[400px]"
                  auto-resize
                  rows="2"
                  @input="onInput"
                />
                <InputText
                  v-else
                  :id="`setting-${item.key}`"
                  v-model="(form as Record<string, string>)[item.key!]"
                  class="w-full sm:max-w-[340px]"
                  @input="onInput"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
    <div v-else class="settings-empty"><span class="settings-empty-icon"><i class="pi pi-sliders-h" /></span><h2>{{ t('settings.noEditableTitle') }}</h2><p>{{ t('settings.noEditableDescription') }}</p></div>
  </div>
</template>
