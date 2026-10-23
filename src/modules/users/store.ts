import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'
import type { UserProfile, ListUsersParams, AdminCreateUserRequest } from '@/api/generated/models'

export const useUsersStore = defineStore('users', () => {
  const users = ref<UserProfile[]>([])
  const loading = ref(false)
  const error = ref<unknown>(null)
  const nextCursor = ref<string | null>(null)
  const prevCursor = ref<string | null>(null)

  async function fetchUsers(params?: ListUsersParams) {
    loading.value = true
    error.value = null
    try {
      const res = await api.listUsers({ per_page: 20, ...params })
      // API returns UsersCursorResponse | OffsetListResponse — cast ke cursor shape
      const body = res.data as {
        data: {
          data: UserProfile[]
          next_cursor?: string | null
          prev_cursor?: string | null
        }
      }
      users.value = body.data.data
      nextCursor.value = body.data.next_cursor ?? null
      prevCursor.value = body.data.prev_cursor ?? null
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  async function createUser(body: AdminCreateUserRequest) {
    const res = await api.createUser(body)
    return res.data
  }

  async function updateUserStatus(userId: number, status: 'active' | 'suspended') {
    await api.updateUserStatus(userId, { status })
    // Update lokal — hindari refetch penuh
    const user = users.value.find((u) => u.id === userId)
    if (user) user.status = status
  }

  async function syncUserRoles(userId: number, roles: string[]) {
    await api.syncUserRoles(userId, { roles })
    const user = users.value.find((u) => u.id === userId)
    if (user) user.roles = roles
  }

  return {
    users,
    loading,
    error,
    nextCursor,
    prevCursor,
    fetchUsers,
    createUser,
    updateUserStatus,
    syncUserRoles,
  }
})

