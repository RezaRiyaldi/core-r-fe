import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'
import { useCursorPagination } from '@/composables/useCursorPagination'
import type { NotificationItem, ListNotificationsParams } from '@/api/generated/models'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<NotificationItem[]>([])
  const loading = ref(false)
  const error = ref<unknown>(null)
  const unreadCount = ref(0)
  const pagination = useCursorPagination(20)

  async function fetchNotifications(params?: Partial<ListNotificationsParams>) {
    loading.value = true
    error.value = null
    try {
      const res = await api.listNotifications({
        per_page: pagination.perPage.value,
        ...params,
      })
      const body = res.data as {
        success: boolean
        data: {
          data: NotificationItem[]
          next_cursor: string | null
          prev_cursor: string | null
        }
      }
      notifications.value = body.data.data
      pagination.syncCursors(body.data)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  async function fetchUnreadCount() {
    try {
      const res = await api.notificationUnreadCount()
      const body = res.data as { data: { count: number } }
      unreadCount.value = body.data?.count ?? 0
    } catch {
      // non-critical
    }
  }

  async function markRead(id: string) {
    await api.readNotification(id)
    const n = notifications.value.find((item) => item.id === id)
    if (n) n.read_at = new Date().toISOString()
    if (unreadCount.value > 0) unreadCount.value--
  }

  async function markAllRead() {
    await api.readAllNotifications()
    notifications.value.forEach((n) => {
      if (!n.read_at) n.read_at = new Date().toISOString()
    })
    unreadCount.value = 0
  }

  async function deleteNotification(id: string) {
    await api.deleteNotification(id)
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  function loadNext() {
    if (pagination.nextCursor.value) {
      fetchNotifications({ cursor: pagination.nextCursor.value })
    }
  }

  function loadPrev() {
    if (pagination.prevCursor.value) {
      fetchNotifications({ cursor: pagination.prevCursor.value })
    }
  }

  return {
    notifications,
    loading,
    error,
    unreadCount,
    pagination,
    fetchNotifications,
    fetchUnreadCount,
    markRead,
    markAllRead,
    deleteNotification,
    loadNext,
    loadPrev,
  }
})
