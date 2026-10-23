import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'
import { useOffsetPagination } from '@/composables/useOffsetPagination'
import type { RoleItem, OffsetPaginationMeta, ListRolesParams, RoleRequest, RoleUpdateRequest } from '@/api/generated/models'

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<RoleItem[]>([])
  const loading = ref(false)
  const error = ref<unknown>(null)
  const pagination = useOffsetPagination(20)

  async function fetchRoles(params?: Partial<ListRolesParams>) {
    loading.value = true
    error.value = null
    try {
      const res = await api.listRoles({
        ...pagination.queryParams.value,
        ...params,
      })
      const body = res.data as {
        success: boolean
        data: { data: RoleItem[]; meta: OffsetPaginationMeta } | RoleItem[]
      }
      // Support both offset shape and flat array shape
      if (Array.isArray(body.data)) {
        roles.value = body.data
        pagination.total.value = body.data.length
      } else {
        roles.value = body.data.data
        pagination.syncMeta(body.data.meta)
      }
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  async function createRole(body: RoleRequest) {
    const res = await api.createRole(body)
    return res.data
  }

  async function updateRole(roleId: number, body: RoleUpdateRequest) {
    const res = await api.updateRole(roleId, body)
    return res.data
  }

  async function deleteRole(roleId: number) {
    await api.deleteRole(roleId)
    roles.value = roles.value.filter((r) => r.id !== roleId)
  }

  return {
    roles,
    loading,
    error,
    pagination,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  }
})
