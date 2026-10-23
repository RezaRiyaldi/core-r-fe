import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'
import { useOffsetPagination } from '@/composables/useOffsetPagination'
import type { UserListItem, AdminCreateUserRequest, ListUsersParams, OffsetPaginationMeta } from '@/api/generated/models'

export const useUsersStore = defineStore('users', () => {
  const users = ref<UserListItem[]>([])
  const loading = ref(false)
  const error = ref<unknown>(null)
  const pagination = useOffsetPagination(20)

  async function fetchUsers(params?: Partial<ListUsersParams>) {
    loading.value = true
    error.value = null
    try {
      const res = await api.listUsers({
        ...pagination.queryParams.value,
        ...params,
      })
      const body = res.data as {
        success: boolean
        data: { data: UserListItem[]; meta: OffsetPaginationMeta }
      }
      users.value = body.data.data
      pagination.syncMeta(body.data.meta)
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
    const user = users.value.find((u) => u.id === userId)
    if (user) user.status = status as UserListItem['status']
  }

  async function syncUserRoles(userId: number, roles: string[]) {
    await api.syncUserRoles(userId, { roles })
    // roles sekarang UserRoleAssignment[] — refetch untuk dapat data terbaru
    await fetchUsers()
  }

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    createUser,
    updateUserStatus,
    syncUserRoles,
  }
})

