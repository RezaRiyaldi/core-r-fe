import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'
import { useCursorPagination } from '@/composables/useCursorPagination'
import type { AuditEventItem, ListAuditEventsParams } from '@/api/generated/models'

export const useAuditStore = defineStore('audit', () => {
  const events = ref<AuditEventItem[]>([])
  const loading = ref(false)
  const error = ref<unknown>(null)
  const pagination = useCursorPagination(20)
  let activeFilters: Partial<ListAuditEventsParams> = {}

  async function fetchEvents(params?: Partial<ListAuditEventsParams>) {
    if (params && !params.cursor) activeFilters = params
    loading.value = true
    error.value = null
    try {
      const res = await api.listAuditEvents({
        per_page: pagination.perPage.value,
        ...params,
      })
      const body = res.data as {
        success: boolean
        data: {
          data: AuditEventItem[]
          next_cursor: string | null
          prev_cursor: string | null
        }
      }
      events.value = body.data.data
      pagination.syncCursors(body.data)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  function loadNext() {
    if (pagination.nextCursor.value) fetchEvents({ ...activeFilters, cursor: pagination.nextCursor.value })
  }

  function loadPrev() {
    if (pagination.prevCursor.value) fetchEvents({ ...activeFilters, cursor: pagination.prevCursor.value })
  }

  return { events, loading, error, pagination, fetchEvents, loadNext, loadPrev }
})
