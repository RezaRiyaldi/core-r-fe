<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { navigation } from '@/config/navigation'
import { useNotificationsStore } from '@/modules/notifications/store'
import { api } from '@/api'
import type { AuditEventItem } from '@/api/generated/models'

const auth = useAuthStore()
const { t } = useI18n()
const notificationsStore = useNotificationsStore()
const statisticsLoading = ref(false)
const usersCount = ref<number | null>(null)
const rolesCount = ref<number | null>(null)
const permissionsCount = ref<number | null>(null)
const auditEvents = ref<AuditEventItem[]>([])

function readTotal(response: unknown): number | null {
  const outer = response as { data?: unknown }
  const collection = outer.data as { data?: unknown; meta?: { total?: number | null } } | unknown[] | undefined
  if (Array.isArray(collection)) return collection.length
  if (collection && typeof collection === 'object') {
    const total = collection.meta?.total
    if (typeof total === 'number') return total
    if (Array.isArray(collection.data) && !('per_page' in collection)) return collection.data.length
  }
  return null
}

onMounted(async () => {
  statisticsLoading.value = true
  const requests: Promise<unknown>[] = []
  if (auth.hasPermission('users.view')) requests.push(api.listUsers({ page: 1, per_page: 1, with_total: true }).then((response) => { usersCount.value = readTotal(response.data) }))
  if (auth.hasPermission('roles.view')) requests.push(api.listRoles({ page: 1, per_page: 1, with_total: true }).then((response) => { rolesCount.value = readTotal(response.data) }))
  if (auth.hasPermission('permissions.view')) requests.push(api.listPermissions({ page: 1, per_page: 1, with_total: true }).then((response) => { permissionsCount.value = readTotal(response.data) }))
  if (auth.hasPermission('notifications.view')) requests.push(notificationsStore.fetchUnreadCount())
  if (auth.hasPermission('audit.view')) requests.push(api.listAuditEvents({ per_page: 100 }).then((response) => { auditEvents.value = response.data.data.data }))
  await Promise.allSettled(requests)
  statisticsLoading.value = false
})

const shortcuts = computed(() =>
  navigation.filter((item) => item.key !== 'dashboard' && item.key !== 'profile' && item.key !== 'tokens' && (!item.permission || auth.hasPermission(item.permission))),
)
const primaryShortcut = computed(() => shortcuts.value[0])
const statistics = computed(() => [
  ...(auth.hasPermission('users.view') ? [{ label: t('nav.users'), value: usersCount.value, icon: 'pi pi-users' }] : []),
  ...(auth.hasPermission('roles.view') ? [{ label: t('nav.roles'), value: rolesCount.value, icon: 'pi pi-shield' }] : []),
  ...(auth.hasPermission('permissions.view') ? [{ label: t('nav.permissions'), value: permissionsCount.value, icon: 'pi pi-lock' }] : []),
  ...(auth.hasPermission('notifications.view') ? [{ label: t('dashboard.unreadNotifications'), value: notificationsStore.unreadCount, icon: 'pi pi-bell' }] : []),
])
const activityChart = computed(() => {
  const currentHour = new Date()
  currentHour.setMinutes(0, 0, 0)
  const firstHour = new Date(currentHour)
  firstHour.setHours(firstHour.getHours() - 23)
  return Array.from({ length: 24 }, (_, index) => {
    const date = new Date(firstHour)
    date.setHours(firstHour.getHours() + index)
    const key = date.getTime()
    const count = auditEvents.value.filter((event) => {
      const eventDate = new Date(event.created_at)
      eventDate.setMinutes(0, 0, 0)
      return eventDate.getTime() === key
    }).length
    return {
      key,
      count,
      label: index % 3 === 0 || index === 23 ? `${String(date.getHours()).padStart(2, '0')}:00` : '',
    }
  })
})
const activityMax = computed(() => Math.max(1, ...activityChart.value.map((day) => day.count)))
const activityPoints = computed(() => activityChart.value.map((day, index) => ({
  ...day,
  x: 42 + (index * 616) / (activityChart.value.length - 1),
  y: 186 - (day.count / activityMax.value) * 142,
})))
const activityLinePath = computed(() => activityPoints.value.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' '))
const activityAreaPath = computed(() => `${activityLinePath.value} L 658 186 L 42 186 Z`)
const hasRecentActivity = computed(() => activityChart.value.some((day) => day.count > 0))
</script>

<template>
  <div class="dashboard-page">
    <section class="welcome-banner relative overflow-hidden rounded-[28px] px-7 py-8 text-white sm:px-10 sm:py-10">
      <div class="banner-orb banner-orb-one" />
      <div class="banner-orb banner-orb-two" />
      <div class="relative z-10 max-w-2xl">
        <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-blue-50 backdrop-blur">
          <i class="pi pi-sparkles text-[10px]" />
          {{ t('nav.dashboard') }}
        </div>
        <h1 class="text-3xl font-bold tracking-tight sm:text-[38px]">{{ t('common.welcome', { name: auth.user?.name }) }}</h1>
        <p class="mt-3 max-w-xl text-sm leading-6 text-blue-100/80 sm:text-[15px]">
          {{ t('dashboard.subtitle') }}
        </p>
        <RouterLink v-if="primaryShortcut" :to="primaryShortcut.to" class="banner-action mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-50">
          {{ t(primaryShortcut.labelKey) }}
          <i class="pi pi-arrow-up-right text-xs" />
        </RouterLink>
      </div>
      <div class="banner-illustration" aria-hidden="true">
        <div class="illustration-ring ring-one" />
        <div class="illustration-ring ring-two" />
        <div class="illustration-card"><i class="pi pi-chart-bar" /></div>
        <div class="illustration-dot dot-one" /><div class="illustration-dot dot-two" />
      </div>
    </section>

    <section v-if="statistics.length" class="dashboard-kpis mt-6">
      <article v-for="(stat, index) in statistics" :key="`kpi-${stat.label}`" :class="['dashboard-kpi-card', `dashboard-kpi-${index % 4}`]">
        <span class="dashboard-kpi-icon"><i :class="stat.icon" /></span>
        <div class="min-w-0"><p>{{ stat.label }}</p><strong>{{ statisticsLoading ? '—' : (stat.value ?? '—') }}</strong></div>
        <span class="dashboard-kpi-decoration"><i :class="stat.icon" /></span>
      </article>
    </section>

    <section v-if="auth.hasPermission('audit.view')" class="activity-panel mt-5">
      <header class="activity-heading">
        <div><p class="section-eyebrow">{{ t('dashboard.activityEyebrow') }}</p><h2>{{ t('dashboard.activityTitle') }}</h2><p>{{ t('dashboard.activityCaption') }}</p></div>
        <RouterLink :to="{ name: 'audit' }" class="activity-all-link">{{ t('dashboard.viewAudit') }} <i class="pi pi-arrow-up-right" /></RouterLink>
      </header>
      <div v-if="statisticsLoading" class="statistics-loading"><i class="pi pi-spin pi-spinner" /> {{ t('common.loading') }}</div>
      <div v-else-if="!hasRecentActivity" class="activity-empty"><i class="pi pi-chart-line" /><span>{{ t('dashboard.noActivityData') }}</span></div>
      <div v-else class="activity-chart">
        <svg class="activity-svg" viewBox="0 0 700 220" preserveAspectRatio="none" role="img" :aria-label="t('dashboard.activityTitle')">
          <defs><linearGradient id="activity-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#4f91e8" stop-opacity=".24" /><stop offset="100%" stop-color="#4f91e8" stop-opacity="0" /></linearGradient></defs>
          <line v-for="line in [{ y: 44, value: activityMax }, { y: 115, value: Math.ceil(activityMax / 2) }, { y: 186, value: 0 }]" :key="line.y" x1="42" :y1="line.y" x2="658" :y2="line.y" class="activity-gridline" />
          <text v-for="line in [{ y: 44, value: activityMax }, { y: 115, value: Math.ceil(activityMax / 2) }, { y: 186, value: 0 }]" :key="`label-${line.y}`" x="30" :y="line.y - 5" class="activity-axis-label" text-anchor="end">{{ line.value }}</text>
          <path :d="activityAreaPath" class="activity-area" />
          <path :d="activityLinePath" class="activity-line" />
          <g v-for="point in activityPoints" :key="point.key">
            <circle :cx="point.x" :cy="point.y" r="5" class="activity-point" />
            <text v-if="point.count" :x="point.x" :y="point.y - 12" class="activity-point-label" text-anchor="middle">{{ point.count }}</text>
          </g>
        </svg>
        <div class="activity-x-labels"><span v-for="day in activityChart" :key="day.key">{{ day.label }}</span></div>
      </div>
      <p class="statistics-footnote"><i class="pi pi-info-circle" /> {{ t('dashboard.activityFootnote') }}</p>
    </section>

    <section class="mt-9">
      <div class="mb-5 flex items-end justify-between gap-4">
        <div>
          <p class="section-eyebrow">{{ t('dashboard.workspaceEyebrow') }}</p>
          <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-800">{{ t('dashboard.workspaceTitle') }}</h2>
        </div>
        <span class="hidden text-xs text-slate-400 sm:block">{{ shortcuts.length }} {{ t('dashboard.availableModules') }}</span>
      </div>

      <div v-if="shortcuts.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <RouterLink v-for="item in shortcuts" :key="item.key" :to="item.to" class="module-card group flex items-center gap-4 rounded-2xl p-5">
          <span class="module-icon grid h-12 w-12 shrink-0 place-items-center rounded-[15px] text-lg">
            <i :class="item.icon" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-bold text-slate-800">{{ t(item.labelKey) }}</span>
            <span class="mt-1 block text-xs text-slate-400">{{ t('dashboard.openModule') }}</span>
          </span>
          <i class="pi pi-arrow-up-right module-arrow text-xs text-slate-300 transition" />
        </RouterLink>
      </div>
      <div v-else class="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
        {{ t('dashboard.noModules') }}
      </div>
    </section>

    <section class="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div class="info-panel rounded-2xl p-6 sm:p-7">
        <div class="flex items-start gap-4">
          <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><i class="pi pi-shield" /></span>
          <div>
            <h3 class="text-sm font-bold text-slate-800">{{ t('dashboard.accessTitle') }}</h3>
            <p class="mt-1.5 max-w-xl text-xs leading-5 text-slate-500">{{ t('dashboard.accessDescription') }}</p>
          </div>
        </div>
      </div>
      <div class="profile-panel flex items-center gap-4 rounded-2xl p-6">
        <Avatar :label="auth.user?.name?.charAt(0).toUpperCase()" shape="circle" class="dashboard-avatar shrink-0" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-bold text-slate-800">{{ auth.user?.name }}</p>
          <p class="mt-1 truncate text-xs text-slate-400">{{ auth.user?.email }}</p>
        </div>
        <RouterLink to="/profile" class="profile-link grid h-9 w-9 shrink-0 place-items-center rounded-lg text-blue-600 transition hover:bg-blue-50" :aria-label="t('nav.profile')"><i class="pi pi-arrow-up-right text-xs" /></RouterLink>
      </div>
    </section>
  </div>
</template>
