<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { navigation } from '@/config/navigation'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const { t, locale } = useI18n()

const sidebarOpen = ref(true)

const visibleNav = computed(() =>
  navigation.filter((item) => !item.permission || auth.hasPermission(item.permission)),
)

const breadcrumbs = computed(() => {
  const matched = route.matched.filter((r) => r.meta?.breadcrumb)
  return matched.map((r) => ({ label: r.meta.breadcrumb as string }))
})

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function switchLocale() {
  locale.value = locale.value === 'id' ? 'en' : 'id'
}

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-surface-50">
    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col bg-surface-900 text-surface-0 transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16',
      ]"
    >
      <!-- Logo -->
      <div class="flex h-16 items-center gap-3 px-4 border-b border-surface-700">
        <span class="pi pi-server text-primary-400 text-xl shrink-0" />
        <span v-if="sidebarOpen" class="font-semibold text-sm truncate">
          {{ t('app.name') }}
        </span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-4">
        <RouterLink
          v-for="item in visibleNav"
          :key="item.key"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-700 hover:text-surface-0 transition-colors"
          :class="{ 'bg-surface-700 text-surface-0': route.path === item.to }"
          :title="!sidebarOpen ? t(item.labelKey) : undefined"
        >
          <span :class="[item.icon, 'text-base shrink-0']" />
          <span v-if="sidebarOpen" class="truncate">{{ t(item.labelKey) }}</span>
        </RouterLink>
      </nav>

      <!-- User -->
      <div class="border-t border-surface-700 p-4">
        <div v-if="sidebarOpen" class="mb-3 text-xs text-surface-400 truncate">
          {{ auth.user?.name }}
        </div>
        <Button
          :icon="sidebarOpen ? 'pi pi-sign-out' : 'pi pi-sign-out'"
          :label="sidebarOpen ? t('auth.logout') : undefined"
          severity="secondary"
          text
          size="small"
          class="w-full"
          @click="handleLogout"
        />
      </div>
    </aside>

    <!-- Main -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Header -->
      <header class="flex h-16 items-center gap-4 bg-white px-6 shadow-sm shrink-0">
        <Button
          icon="pi pi-bars"
          text
          severity="secondary"
          @click="toggleSidebar"
          aria-label="Toggle sidebar"
        />

        <!-- Breadcrumb -->
        <Breadcrumb
          v-if="breadcrumbs.length"
          :model="breadcrumbs"
          class="flex-1 border-none p-0 bg-transparent"
        />
        <div v-else class="flex-1" />

        <!-- Locale switcher -->
        <Button
          :label="locale === 'id' ? 'EN' : 'ID'"
          text
          severity="secondary"
          size="small"
          @click="switchLocale"
          :aria-label="locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'"
        />

        <!-- User avatar -->
        <Avatar
          :label="auth.user?.name?.charAt(0).toUpperCase()"
          shape="circle"
          class="bg-primary-100 text-primary-700 cursor-default"
        />
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
