import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api'
import type { UserProfile } from '@/api/generated/models'

const TOKEN_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function hasPermission(permission: string): boolean {
    return user.value?.permissions.includes(permission) ?? false
  }

  function hasRole(role: string): boolean {
    return user.value?.roles.includes(role) ?? false
  }

  function hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((p) => hasPermission(p))
  }

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const res = await api.login({
        email,
        password,
        device_name: 'core-r-fe',
      })
      setToken(res.data.data.token)
      user.value = res.data.data.user
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentUser() {
    if (!token.value) return
    loading.value = true
    try {
      const res = await api.currentUser()
      user.value = res.data.data
    } catch {
      clearAuth()
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await api.logout()
    } catch {
      // logout tetap dilanjutkan meski request gagal
    } finally {
      clearAuth()
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    hasPermission,
    hasRole,
    hasAnyPermission,
    login,
    fetchCurrentUser,
    logout,
  }
})
