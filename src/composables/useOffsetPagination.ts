import { ref, computed } from 'vue'
import type { DataTablePageEvent } from 'primevue/datatable'
import type { OffsetPaginationMeta } from '@/api/generated/models'

export function useOffsetPagination(defaultPerPage = 20) {
  const page = ref(1)
  const perPage = ref(defaultPerPage)
  const total = ref(0)

  const queryParams = computed(() => ({
    page: page.value,
    per_page: perPage.value,
    with_total: true as const,
  }))

  function onPage(event: DataTablePageEvent) {
    page.value = event.page + 1 // PrimeVue is 0-based
    perPage.value = event.rows
  }

  function syncMeta(meta: OffsetPaginationMeta) {
    page.value = meta.current_page
    perPage.value = meta.per_page
    total.value = meta.total ?? 0
  }

  function reset() {
    page.value = 1
    total.value = 0
  }

  return { page, perPage, total, queryParams, onPage, syncMeta, reset }
}
