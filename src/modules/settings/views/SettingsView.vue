<script setup lang="ts">
import { onMounted, ref } from 'vue'
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

onMounted(async () => {
  await store.fetchMetadata()
  // Populate form dari metadata
  store.metadata.forEach((item) => {
    if (item.key && item.editable) {
      form.value[item.key] = item.value ?? item.default ?? null
    }
  })
})

function onInput() {
  isDirty.value = true
}

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
  <div>
    <PageHeader :title="t('settings.title')" :description="t('settings.description')">
      <template #actions>
        <Button
          :label="t('common.save')"
          icon="pi pi-check"
          :loading="store.saving"
          :disabled="!isDirty"
          @click="save"
        />
      </template>
    </PageHeader>

    <LoadingState v-if="store.loading" />

    <ApiErrorMessage v-else-if="store.error" :error="store.error" />

    <div v-else class="max-w-2xl flex flex-col gap-6">
      <template v-for="item in store.metadata" :key="item.key">
        <div v-if="item.editable && item.key" class="flex flex-col gap-1">
          <label class="text-sm font-medium text-surface-700">
            {{ item.key }}
            <span v-if="item.description" class="ml-1 text-xs text-surface-400 font-normal">
              — {{ item.description }}
            </span>
          </label>

          <!-- Boolean toggle -->
          <ToggleSwitch
            v-if="item.type === 'boolean'"
            v-model="(form as Record<string, boolean>)[item.key]"
            @change="onInput"
          />

          <!-- Number input -->
          <InputNumber
            v-else-if="item.type === 'integer' || item.type === 'number'"
            v-model="(form as Record<string, number>)[item.key]"
            class="w-48"
            @input="onInput"
          />

          <!-- Default: string input -->
          <InputText
            v-else
            v-model="(form as Record<string, string>)[item.key]"
            class="w-full"
            @input="onInput"
          />
        </div>
      </template>

      <div v-if="!store.metadata.some((m) => m.editable)" class="py-8 text-center text-surface-500">
        {{ t('common.empty') }}
      </div>
    </div>
  </div>
</template>
