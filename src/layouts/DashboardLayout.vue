<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/modules/notifications/store'
import { navigation } from '@/config/navigation'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const notificationsStore = useNotificationsStore()
const { t, locale } = useI18n()

const sidebarOpen = ref(true)
const isMobile = ref(false)
const visibleNav = computed(() =>
  navigation.filter((item) => !item.permission || auth.hasPermission(item.permission)),
)
const breadcrumbs = computed(() =>
  route.matched
    .filter((record) => record.meta?.breadcrumb)
    .map((record) => ({ label: record.meta.breadcrumb as string })),
)
const currentPage = computed(() => breadcrumbs.value.at(-1)?.label ?? t('nav.dashboard'))

function switchLocale() {
  locale.value = locale.value === 'id' ? 'en' : 'id'
}

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}

function updateViewport() {
  isMobile.value = window.matchMedia('(max-width: 900px)').matches
  sidebarOpen.value = !isMobile.value
}

function closeMobileNav() {
  if (isMobile.value) sidebarOpen.value = false
}

onMounted(() => {
  updateViewport()
  window.addEventListener('resize', updateViewport)
  notificationsStore.fetchUnreadCount()
})

onUnmounted(() => window.removeEventListener('resize', updateViewport))
</script>

<template>
  <div class="admin-shell flex h-screen overflow-hidden">
    <aside :class="['admin-sidebar flex shrink-0 flex-col', sidebarOpen ? 'w-64 mobile-nav-open' : 'w-[76px] mobile-nav-closed']">
      <RouterLink to="/" class="brand-lockup flex h-[84px] items-center gap-3 px-5" @click="closeMobileNav">
        <span class="brand-mark grid h-10 w-10 shrink-0 place-items-center rounded-xl">
          <i class="pi pi-bolt text-lg" />
        </span>
        <span v-if="sidebarOpen" class="min-w-0">
          <span class="block truncate text-sm font-bold tracking-wide text-white">{{ t('app.name') }}</span>
          <span class="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200/60">Control center</span>
        </span>
      </RouterLink>

      <div v-if="sidebarOpen" class="px-5 pb-2 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200/45">
        Workspace
      </div>
      <nav class="sidebar-nav flex-1 overflow-y-auto px-3 py-2">
        <RouterLink
          v-for="item in visibleNav"
          :key="item.key"
          :to="item.to"
          @click="closeMobileNav"
          :title="!sidebarOpen ? t(item.labelKey) : undefined"
          :class="['sidebar-link group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all', { 'sidebar-link-active': route.path === item.to }]"
        >
          <span :class="[item.icon, 'grid h-5 w-5 shrink-0 place-items-center text-[15px]']" />
          <span v-if="sidebarOpen" class="min-w-0 flex-1 truncate">{{ t(item.labelKey) }}</span>
          <span v-if="sidebarOpen && item.key === 'notifications' && notificationsStore.unreadCount > 0" class="nav-count">
            {{ notificationsStore.unreadCount > 9 ? '9+' : notificationsStore.unreadCount }}
          </span>
        </RouterLink>
      </nav>

      <div class="sidebar-bottom p-3">
        <div v-if="sidebarOpen" class="account-card mb-3 flex items-center gap-3 rounded-xl p-3">
          <Avatar :label="auth.user?.name?.charAt(0).toUpperCase()" shape="circle" class="account-avatar shrink-0" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs font-semibold text-white">{{ auth.user?.name }}</p>
            <p class="mt-0.5 truncate text-[10px] text-blue-100/55">{{ auth.user?.email }}</p>
          </div>
        </div>
        <Button
          :icon="sidebarOpen ? 'pi pi-sign-out' : 'pi pi-sign-out'"
          :label="sidebarOpen ? t('auth.logout') : undefined"
          text
          class="sidebar-logout w-full justify-start"
          @click="handleLogout"
        />
      </div>
    </aside>
    <button v-if="isMobile && sidebarOpen" class="mobile-nav-backdrop" type="button" aria-label="Close navigation" @click="sidebarOpen = false" />

    <div class="admin-main flex min-w-0 flex-1 flex-col overflow-hidden">
      <header class="admin-topbar flex h-[76px] shrink-0 items-center gap-4 px-5 sm:px-8">
        <Button
          icon="pi pi-bars"
          text
          rounded
          class="!text-slate-500 hover:!bg-blue-50 hover:!text-blue-700"
          @click="sidebarOpen = !sidebarOpen"
          aria-label="Toggle sidebar"
        />
        <div class="min-w-0 flex-1">
          <Breadcrumb v-if="breadcrumbs.length" :model="breadcrumbs" class="topbar-breadcrumb border-none bg-transparent p-0" />
          <span v-else class="text-sm font-semibold text-slate-700">{{ currentPage }}</span>
        </div>
        <div class="hidden items-center gap-2 text-xs text-slate-400 md:flex">
          <span class="h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-50" />
          {{ locale === 'id' ? 'Sistem siap' : 'All systems ready' }}
        </div>
        <span class="topbar-divider mx-1 hidden h-8 w-px sm:block" />
        <RouterLink :to="{ name: 'notifications' }" class="relative inline-flex">
          <Button icon="pi pi-bell" text rounded class="!text-slate-500 hover:!bg-blue-50 hover:!text-blue-700" :aria-label="t('nav.notifications')" />
          <Badge v-if="notificationsStore.unreadCount > 0" :value="notificationsStore.unreadCount > 99 ? '99+' : String(notificationsStore.unreadCount)" severity="danger" class="absolute right-0 top-0 !min-w-4 !h-4 !text-[10px] pointer-events-none" />
        </RouterLink>
        <Button :label="locale === 'id' ? 'EN' : 'ID'" text rounded class="!text-xs !font-bold !text-slate-500 hover:!bg-blue-50 hover:!text-blue-700" @click="switchLocale" :aria-label="locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'" />
        <Avatar :label="auth.user?.name?.charAt(0).toUpperCase()" shape="circle" class="topbar-avatar cursor-default" />
      </header>

      <main class="admin-content flex-1 overflow-y-auto px-5 py-7 sm:px-8 sm:py-9">
        <div class="mx-auto w-full max-w-[1440px]"><RouterView /></div>
      </main>
    </div>
  </div>
</template>
