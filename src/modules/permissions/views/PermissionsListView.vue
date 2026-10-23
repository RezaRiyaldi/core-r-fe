<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DataTablePageEvent } from 'primevue/datatable'
import { usePermissionsStore } from '../store'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingState from '@/components/shared/LoadingState.vue'
import ApiErrorMessage from '@/components/shared/ApiErrorMessage.vue'

const { t } = useI18n()
const store = usePermissionsStore()

onMounted(() => store.fetchPermissions())

function onPage(event: DataTablePageEvent) {
  store.pagination.onPage(event)
  store.fetchPermissions()
}
</script>

<template>
  <div>
    <PageHeader :title="t('permissions.title')" :description="t('permissions.description')" />

    <LoadingState v-if="store.loading && !store.permissions.length" />

    <ApiErrorMessage v-else-if="store.error" :error="store.error" />

    <DataTable
      v-else
      :value="store.permissions"
      :loading="store.loading"
      lazy
      paginator
      :rows="store.pagination.perPage"
      :totalRecords="store.pagination.total"
      :rowsPerPageOptions="[10, 20, 50]"
      @page="onPage"
      class="w-full"
    >
      <Column header="#" style="width: 4.5rem">
        <template #body="{ index }">{{ (store.pagination.page - 1) * store.pagination.perPage + index + 1 }}</template>
      </Column>
      <template #empty>
        <div class="py-8 text-center text-surface-500">{{ t('common.empty') }}</div>
      </template>

      <Column field="id" header="ID" style="width: 5rem" />
      <Column field="name" :header="t('common.name')" />
    </DataTable>
  </div>
</template>
