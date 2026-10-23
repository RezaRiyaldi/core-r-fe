import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import type { ApiToken, ProfileRequestLocale } from '@/api/generated/models'

export const useProfileStore = defineStore('profile', () => {
  const saving = ref(false)
  const changingPassword = ref(false)
  const error = ref<unknown>(null)

  const tokens = ref<ApiToken[]>([])
  const loadingTokens = ref(false)

  async function updateProfile(name: string, locale?: ProfileRequestLocale) {
    saving.value = true
    error.value = null
    try {
      const res = await api.updateProfile({ name, locale })
      const auth = useAuthStore()
      if (auth.user) {
        auth.user.name = res.data.data.name
      }
    } finally {
      saving.value = false
    }
  }

  async function changePassword(current_password: string, password: string, password_confirmation: string) {
    changingPassword.value = true
    error.value = null
    try {
      await api.changePassword({ current_password, password, password_confirmation })
    } finally {
      changingPassword.value = false
    }
  }

  async function fetchTokens() {
    loadingTokens.value = true
    try {
      const res = await api.listTokens()
      tokens.value = res.data.data
    } finally {
      loadingTokens.value = false
    }
  }

  async function revokeToken(id: number) {
    await api.revokeToken(id)
    tokens.value = tokens.value.filter((t) => t.id !== id)
  }

  async function revokeAll() {
    await api.logoutAll()
    tokens.value = []
  }

  return {
    saving,
    changingPassword,
    error,
    tokens,
    loadingTokens,
    updateProfile,
    changePassword,
    fetchTokens,
    revokeToken,
    revokeAll,
  }
})
