import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'

// Mock api module
vi.mock('@/api', () => ({
  api: {
    login: vi.fn(),
    logout: vi.fn(),
    currentUser: vi.fn(),
  },
}))

import { api } from '@/api'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('initializes unauthenticated', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
    expect(auth.token).toBeNull()
  })

  it('login sets token and user', async () => {
    const mockUser = { id: 1, name: 'Alice', email: 'alice@test.com', roles: ['admin'], permissions: ['users.view'], status: 'active' }
    vi.mocked(api.login).mockResolvedValueOnce({
      data: { data: { token: 'tok123', user: mockUser } },
    } as never)

    const auth = useAuthStore()
    await auth.login('alice@test.com', 'secret')

    expect(auth.token).toBe('tok123')
    expect(auth.user?.name).toBe('Alice')
    expect(auth.isAuthenticated).toBe(true)
    expect(localStorage.getItem('auth_token')).toBe('tok123')
  })

  it('hasPermission returns true when permission present', async () => {
    vi.mocked(api.login).mockResolvedValueOnce({
      data: { data: { token: 'tok', user: { id: 1, name: 'Bob', email: 'bob@test.com', roles: [], permissions: ['users.view', 'roles.view'], status: 'active' } } },
    } as never)

    const auth = useAuthStore()
    await auth.login('bob@test.com', 'pw')

    expect(auth.hasPermission('users.view')).toBe(true)
    expect(auth.hasPermission('settings.view')).toBe(false)
  })

  it('logout clears auth and localStorage', async () => {
    vi.mocked(api.login).mockResolvedValueOnce({
      data: { data: { token: 'tok', user: { id: 1, name: 'C', email: 'c@test.com', roles: [], permissions: [], status: 'active' } } },
    } as never)
    vi.mocked(api.logout).mockResolvedValueOnce({} as never)

    const auth = useAuthStore()
    await auth.login('c@test.com', 'pw')
    await auth.logout()

    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('fetchCurrentUser clears auth on error', async () => {
    localStorage.setItem('auth_token', 'expired')
    vi.mocked(api.currentUser).mockRejectedValueOnce(new Error('401'))

    const auth = useAuthStore()
    // manually set token to simulate restored session
    auth.token = 'expired'
    await auth.fetchCurrentUser()

    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()
  })
})
