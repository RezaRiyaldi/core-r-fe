import axios from 'axios'
import { i18n } from '@/i18n'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
})

// Inject Accept-Language and Bearer token before every request
apiClient.interceptors.request.use((config) => {
  config.headers['Accept-Language'] = i18n.global.locale.value

  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Normalize error shape
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // ponytail: token refresh / redirect on 401 — add when auth store exists
    return Promise.reject(error)
  },
)
