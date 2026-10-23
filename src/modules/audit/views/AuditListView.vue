<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuditStore } from '../store'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingState from '@/components/shared/LoadingState.vue'
import ApiErrorMessage from '@/components/shared/ApiErrorMessage.vue'
import { formatDate } from '@/utils/date'

const { t } = useI18n()
const store = useAuditStore()
const route = useRoute()
const actorId = Number(route.query.actor_id) || undefined

const filterEvent = ref('')
let filterTimer: ReturnType<typeof setTimeout>

onMounted(() => store.fetchEvents({ 'filter[actor_id][eq]': actorId }))

function onFilterEvent() {
  clearTimeout(filterTimer)
  filterTimer = setTimeout(() => {
    store.pagination.reset()
    store.fetchEvents({ 'filter[event][eq]': filterEvent.value || undefined, 'filter[actor_id][eq]': actorId })
  }, 400)
}
</script>

<template>
  <div>
    <PageHeader :title="t('audit.title')" :description="actorId ? t('audit.filteredActor', { id: actorId }) : t('audit.description')" />

    <div class="table-toolbar">
      <IconField class="table-search">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="filterEvent"
          :placeholder="t('audit.filterEvent')"
          class="w-full"
          @input="onFilterEvent"
        />
      </IconField>
    </div>

    <LoadingState v-if="store.loading && !store.events.length" />

    <ApiErrorMessage v-else-if="store.error" :error="store.error" />

    <template v-else>
      <div v-if="!store.events.length" class="py-16 text-center text-surface-500">
        {{ t('common.empty') }}
      </div>

      <DataTable v-else :value="store.events" :loading="store.loading" class="w-full">
        <Column header="#" style="width: 4.5rem">
          <template #body="{ index }">{{ index + 1 }}</template>
        </Column>
        <Column field="event" :header="t('audit.event')" />
        <Column field="actor_id" :header="t('audit.actor')">
          <template #body="{ data }">
            {{ data.actor_id ?? '-' }}
          </template>
        </Column>
        <Column field="subject_type" :header="t('audit.subject')">
          <template #body="{ data }">
            <span v-if="data.subject_type">
              {{ data.subject_type }} #{{ data.subject_id }}
            </span>
            <span v-else class="text-surface-400">-</span>
          </template>
        </Column>
        <Column field="ip_address" :header="t('audit.ip')">
          <template #body="{ data }">{{ data.ip_address ?? '-' }}</template>
        </Column>
        <Column field="created_at" :header="t('common.createdAt')">
          <template #body="{ data }">
            {{ formatDate(data.created_at, true) }}
          </template>
        </Column>
      </DataTable>

      <!-- Cursor pagination -->
      <div class="mt-4 flex justify-end gap-2">
        <Button
          icon="pi pi-chevron-left"
          :disabled="!store.pagination.prevCursor"
          text
          severity="secondary"
          @click="store.loadPrev()"
        />
        <Button
          icon="pi pi-chevron-right"
          :disabled="!store.pagination.nextCursor"
          text
          severity="secondary"
          @click="store.loadNext()"
        />
      </div>
    </template>
  </div>
</template>
