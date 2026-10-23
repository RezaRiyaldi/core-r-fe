import { apiClient } from './client'
import { getCoreRAPI } from './generated/core-r'

// Single instance — semua modul pakai ini, bukan membuat instance sendiri
export const api = getCoreRAPI(apiClient)
