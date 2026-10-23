<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { api } from '@/api'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingState from '@/components/shared/LoadingState.vue'
import ApiErrorMessage from '@/components/shared/ApiErrorMessage.vue'
import type { UserDetail } from '@/api/generated/models'
import type { RoleItem } from '@/api/generated/models'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const toast = useToast()

const userId = Number(route.params.id)
const user = ref<UserDetail | null>(null)
const loading = ref(false)
const error = ref<unknown>(null)

const editingRoles = ref(false)
const selectedRoles = ref<string[]>([])
const savingRoles = ref(false)
const allRoles = ref<RoleItem[]>([])

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const [userRes, rolesRes] = await Promise.all([
      api.showUser(userId),
      api.listRoles({ per_page: 100 }),
    ])
    user.value = userRes.data.data
    selectedRoles.value = user.value.roles.map((r) => r.name)
    const d = rolesRes.data.data
    allRoles.value = Array.isArray(d) ? d : (d as { data: RoleItem[] }).data
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
})

async function saveRoles() {
  savingRoles.value = true
  try {
    await api.syncUserRoles(userId, { roles: selectedRoles.value })
    toast.add({ severity: 'success', summary: t('users.rolesUpdated'), life: 3000 })
    editingRoles.value = false
    const res = await api.showUser(userId)
    user.value = res.data.data
  } catch {
    toast.add({ severity: 'error', summary: t('common.error'), life: 4000 })
  } finally {
    savingRoles.value = false
  }
}
</script>
<template>
  <div>
    <PageHeader :title="t('users.detailTitle')" :description="user?.email ?? ''">
      <template #actions>
        <Button :label="t('common.back')" icon="pi pi-arrow-left" text severity="secondary" @click="router.back()" />
      </template>
    </PageHeader>

    <LoadingState v-if="loading" />
    <ApiErrorMessage v-else-if="error" :error="error" />

    <div v-else-if="user" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Info -->
      <div class="rounded-lg border border-surface-200 bg-white p-6">
        <h2 class="mb-4 text-base font-semibold text-surface-800">{{ t('users.info') }}</h2>
        <dl class="flex flex-col gap-3 text-sm">
          <div class="flex justify-between"><dt class="text-surface-500">{{ t('common.name') }}</dt><dd class="font-medium">{{ user.name }}</dd></div>
          <div class="flex justify-between"><dt class="text-surface-500">{{ t('common.email') }}</dt><dd class="font-medium">{{ user.email }}</dd></div>
          <div class="flex justify-between">
            <dt class="text-surface-500">{{ t('common.status') }}</dt>
            <dd><Tag :value="user.status === 'active' ? t('users.statusActive') : t('users.statusSuspended')" :severity="user.status === 'active' ? 'success' : 'warn'" /></dd>
          </div>
          <div class="flex justify-between"><dt class="text-surface-500">{{ t('users.activeTokens') }}</dt><dd class="font-medium">{{ user.active_tokens }}</dd></div>
          <div class="flex justify-between"><dt class="text-surface-500">{{ t('users.lastLogin') }}</dt><dd class="font-medium">{{ user.last_login_at ? new Date(user.last_login_at).toLocaleString() : '-' }}</dd></div>
          <div class="flex justify-between"><dt class="text-surface-500">{{ t('common.createdAt') }}</dt><dd class="font-medium">{{ user.created_at ? new Date(user.created_at).toLocaleDateString() : '-' }}</dd></div>
        </dl>
      </div>

      <!-- Roles -->
      <div class="rounded-lg border border-surface-200 bg-white p-6">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-semibold text-surface-800">{{ t('common.roles') }}</h2>
          <Button v-if="!editingRoles" :label="t('users.editRoles')" icon="pi pi-pencil" size="small" text severity="secondary" @click="editingRoles = true" />
        </div>
        <div v-if="!editingRoles" class="flex flex-wrap gap-2">
          <Tag v-for="role in user.roles" :key="role.id" :value="role.name" severity="secondary" />
          <span v-if="!user.roles.length" class="text-sm text-surface-400">{{ t('users.noRoles') }}</span>
        </div>
        <div v-else class="flex flex-col gap-3">
          <MultiSelect v-model="selectedRoles" :options="allRoles" optionLabel="name" optionValue="name" :placeholder="t('roles.selectPermissions')" class="w-full" filter />
          <div class="flex justify-end gap-2">
            <Button :label="t('common.cancel')" text severity="secondary" :disabled="savingRoles" @click="editingRoles = false; selectedRoles = user!.roles.map(r => r.name)" />
            <Button :label="t('common.save')" :loading="savingRoles" @click="saveRoles" />
          </div>
        </div>
      </div>

      <!-- Permissions -->
      <div class="rounded-lg border border-surface-200 bg-white p-6 lg:col-span-2">
        <h2 class="mb-4 text-base font-semibold text-surface-800">{{ t('common.permissions') }}</h2>
        <div class="flex flex-wrap gap-2">
          <Tag v-for="perm in user.permissions" :key="perm" :value="perm" severity="info" />
          <span v-if="!user.permissions.length" class="text-sm text-surface-400">{{ t('users.noPermissions') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
