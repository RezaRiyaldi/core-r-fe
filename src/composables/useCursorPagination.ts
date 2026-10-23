import { ref, computed } from 'vue'

export function useCursorPagination(defaultPerPage = 20) {
  const nextCursor = ref<string | null>(null)
  const prevCursor = ref<string | null>(null)
  const perPage = ref(defaultPerPage)

  const queryParams = computed(() => ({
    per_page: perPage.value,
    cursor: undefined as string | undefined,
  }))

  function syncCursors(data: {
    next_cursor?: string | null
    prev_cursor?: string | null
  }) {
    nextCursor.value = data.next_cursor ?? null
    prevCursor.value = data.prev_cursor ?? null
  }

  function reset() {
    nextCursor.value = null
    prevCursor.value = null
  }

  const nextParams = computed(() => ({
    per_page: perPage.value,
    cursor: nextCursor.value ?? undefined,
  }))

  const prevParams = computed(() => ({
    per_page: perPage.value,
    cursor: prevCursor.value ?? undefined,
  }))

  return {
    nextCursor,
    prevCursor,
    perPage,
    queryParams,
    nextParams,
    prevParams,
    syncCursors,
    reset,
  }
}
