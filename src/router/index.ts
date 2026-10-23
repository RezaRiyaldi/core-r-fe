import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresGuest?: boolean
    permission?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/modules/auth/views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/modules/dashboard/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Session restore — satu kali saat navigasi pertama
let sessionRestored = false

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!sessionRestored) {
    sessionRestored = true
    if (auth.token && !auth.user) {
      await auth.fetchCurrentUser()
    }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresGuest && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  if (to.meta.permission && !auth.hasPermission(to.meta.permission)) {
    return { name: 'dashboard' }
  }
})

export default router

