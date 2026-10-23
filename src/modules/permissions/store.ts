import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'
import { useOffsetPagination } from '@/composables/useOffsetPagination'
import type { PermissionItem, OffsetPaginationMeta, ListPermissionsParams } from '@/api/generated/models'

export const usePermissionsStore = defineStore('permissions', () => {
  const permissions = ref<PermissionItem[]>([])
  const loading = ref(false)
  const error = ref<unknown>(null)
  const pagination = useOffsetPagination(20)

  async function fetchPermissions(params?: Partial<ListPermissionsParams>) {
    loading.value = true
    error.value = null
    try {
      const res = await api.listPermissions({
        ...pagination.queryParams.value,
        ...params,
      })
      const body = res.data as {
        success: boolean
        data: { data: PermissionItem[]; meta: OffsetPaginationMeta } | PermissionItem[]
      }
      if (Array.isArray(body.data)) {
        permissions.value = body.data
        pagination.total.value = body.data.length
      } else {
        permissions.value = body.data.data
        pagination.syncMeta(body.data.meta)
      }
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  return { permissions, loading, error, pagination, fetchPermissions }
})
