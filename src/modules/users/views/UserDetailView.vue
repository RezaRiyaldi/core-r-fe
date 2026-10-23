<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingState from '@/components/shared/LoadingState.vue'
import ApiErrorMessage from '@/components/shared/ApiErrorMessage.vue'
import type { AuditEventItem, UserDetail } from '@/api/generated/models'
import { formatDate } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()
const userId = Number(route.params.id)
const user = ref<UserDetail | null>(null)
const events = ref<AuditEventItem[]>([])
const loading = ref(false)
const auditLoading = ref(false)
const error = ref<unknown>(null)
const auditError = ref<unknown>(null)

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.showUser(userId)
    user.value = response.data.data
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }

  if (auth.hasPermission('audit.view')) {
    auditLoading.value = true
    try {
      const response = await api.listAuditEvents({ 'filter[actor_id][eq]': userId, per_page: 10 })
      events.value = response.data.data.data
    } catch (err) {
      auditError.value = err
    } finally {
      auditLoading.value = false
    }
  }
})
</script>

<template>
  <div>
    <PageHeader :title="t('users.detailTitle')" :description="user?.email ?? ''">
      <template #actions>
        <Button :label="t('common.back')" icon="pi pi-arrow-left" text severity="secondary" @click="router.push({ name: 'users' })" />
        <Button v-if="user" :label="t('users.editUser')" icon="pi pi-pencil" @click="router.push({ name: 'user-edit', params: { id: user.id } })" />
      </template>
    </PageHeader>

    <LoadingState v-if="loading" />
    <ApiErrorMessage v-else-if="error" :error="error" />

    <div v-else-if="user" class="user-detail-page">
      <section class="user-detail-banner">
        <Avatar :label="user.name.charAt(0).toUpperCase()" shape="circle" class="user-detail-avatar" />
        <div class="min-w-0 flex-1">
          <p class="user-detail-kicker">{{ t('users.info') }}</p>
          <h2>{{ user.name }}</h2>
          <p>{{ user.email }}</p>
        </div>
        <Tag :value="user.status === 'active' ? t('users.statusActive') : t('users.statusSuspended')" :severity="user.status === 'active' ? 'success' : 'warn'" />
      </section>

      <div class="grid gap-5 lg:grid-cols-2">
        <section class="user-detail-card">
          <header><span class="user-detail-card-icon"><i class="pi pi-id-card" /></span><h3>{{ t('users.info') }}</h3></header>
          <dl class="user-detail-list">
            <div><dt>{{ t('common.name') }}</dt><dd>{{ user.name }}</dd></div>
            <div><dt>{{ t('common.email') }}</dt><dd>{{ user.email }}</dd></div>
            <div><dt>{{ t('users.activeTokens') }}</dt><dd>{{ user.active_tokens }}</dd></div>
            <div><dt>{{ t('users.lastLogin') }}</dt><dd>{{ user.last_login_at ? formatDate(user.last_login_at, true) : '—' }}</dd></div>
            <div><dt>{{ t('common.createdAt') }}</dt><dd>{{ user.created_at ? formatDate(user.created_at) : '—' }}</dd></div>
          </dl>
        </section>

        <section class="user-detail-card">
          <header><span class="user-detail-card-icon"><i class="pi pi-shield" /></span><h3>{{ t('common.roles') }}</h3></header>
          <div class="user-detail-tags">
            <Tag v-for="role in user.roles" :key="role.id" :value="role.name" severity="secondary" />
            <span v-if="!user.roles.length" class="text-sm text-slate-400">{{ t('users.noRoles') }}</span>
          </div>
        </section>

        <section class="user-detail-card lg:col-span-2">
          <header><span class="user-detail-card-icon"><i class="pi pi-lock" /></span><h3>{{ t('common.permissions') }}</h3><span class="user-detail-card-count">{{ user.permissions.length }}</span></header>
          <div class="user-detail-tags">
            <Tag v-for="permission in user.permissions" :key="permission" :value="permission" severity="info" />
            <span v-if="!user.permissions.length" class="text-sm text-slate-400">{{ t('users.noPermissions') }}</span>
          </div>
        </section>
      </div>

      <section v-if="auth.hasPermission('audit.view')" class="user-detail-card user-audit-card">
        <header><span class="user-detail-card-icon"><i class="pi pi-history" /></span><div><h3>{{ t('users.activityTitle') }}</h3><p>{{ t('users.activityDescription') }}</p></div><RouterLink :to="{ name: 'audit', query: { actor_id: user.id } }" class="user-audit-link">{{ t('users.viewAllActivity') }} <i class="pi pi-arrow-up-right" /></RouterLink></header>
        <LoadingState v-if="auditLoading" />
        <ApiErrorMessage v-else-if="auditError" :error="auditError" />
        <div v-else-if="events.length" class="user-audit-list">
          <article v-for="event in events" :key="event.id" class="user-audit-event">
            <span class="audit-event-mark"><i class="pi pi-bolt" /></span>
            <div class="min-w-0 flex-1"><p class="audit-event-name">{{ event.event }}</p><p v-if="event.subject_type" class="audit-event-subject">{{ event.subject_type }}<span v-if="event.subject_id"> #{{ event.subject_id }}</span></p></div>
            <span class="audit-event-date">{{ formatDate(event.created_at, true) }}</span>
          </article>
        </div>
        <div v-else class="user-audit-empty"><i class="pi pi-check-circle" /><span>{{ t('users.noActivity') }}</span></div>
      </section>
    </div>
  </div>
</template>
