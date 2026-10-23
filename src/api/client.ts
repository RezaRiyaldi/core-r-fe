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
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      // Hanya redirect jika bukan sudah di /login — hindari loop
      // Gunakan replace agar tidak nambah history entry
      if (!window.location.pathname.startsWith('/login')) {
        window.location.replace('/login')
      }
    }
    return Promise.reject(error)
  },
)
