import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresGuest?: boolean
    permission?: string
    breadcrumb?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth routes — pakai AuthLayout
    {
      path: '/login',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/modules/auth/views/LoginView.vue'),
          meta: { requiresGuest: true },
        },
      ],
    },
    // Dashboard routes — pakai DashboardLayout
    {
      path: '/',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/modules/dashboard/views/DashboardView.vue'),
          meta: { requiresAuth: true, breadcrumb: 'Dashboard' },
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/modules/users/views/UsersListView.vue'),
          meta: { requiresAuth: true, permission: 'users.view', breadcrumb: 'Users' },
        },
        {
          path: 'users/:id',
          name: 'user-detail',
          component: () => import('@/modules/users/views/UserDetailView.vue'),
          meta: { requiresAuth: true, permission: 'users.view', breadcrumb: 'User Detail' },
        },
        {
          path: 'roles',
          name: 'roles',
          component: () => import('@/modules/roles/views/RolesListView.vue'),
          meta: { requiresAuth: true, permission: 'roles.view', breadcrumb: 'Roles' },
        },
        {
          path: 'permissions',
          name: 'permissions',
          component: () => import('@/modules/permissions/views/PermissionsListView.vue'),
          meta: { requiresAuth: true, permission: 'permissions.view', breadcrumb: 'Permissions' },
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/modules/settings/views/SettingsView.vue'),
          meta: { requiresAuth: true, permission: 'settings.view', breadcrumb: 'Settings' },
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('@/modules/notifications/views/NotificationsListView.vue'),
          meta: { requiresAuth: true, breadcrumb: 'Notifications' },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/modules/profile/views/ProfileView.vue'),
          meta: { requiresAuth: true, breadcrumb: 'Profile' },
        },
        {
          path: 'tokens',
          name: 'tokens',
          component: () => import('@/modules/tokens/views/TokensView.vue'),
          meta: { requiresAuth: true, breadcrumb: 'Tokens' },
        },
        {
          path: 'audit',
          name: 'audit',
          component: () => import('@/modules/audit/views/AuditListView.vue'),
          meta: { requiresAuth: true, permission: 'audit.view', breadcrumb: 'Audit' },
        },
      ],
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

