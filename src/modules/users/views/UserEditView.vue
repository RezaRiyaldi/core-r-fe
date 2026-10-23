<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { api } from '@/api'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingState from '@/components/shared/LoadingState.vue'
import ApiErrorMessage from '@/components/shared/ApiErrorMessage.vue'
import type { RoleItem, UserDetail } from '@/api/generated/models'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const toast = useToast()
const confirm = useConfirm()
const userId = Number(route.params.id)
const user = ref<UserDetail | null>(null)
const roles = ref<RoleItem[]>([])
const selectedRoles = ref<string[]>([])
const loading = ref(false)
const savingRoles = ref(false)
const savingStatus = ref(false)
const error = ref<unknown>(null)

onMounted(async () => {
  loading.value = true
  try {
    const [userResponse, rolesResponse] = await Promise.all([
      api.showUser(userId),
      api.listRoles({ per_page: 100 }),
    ])
    user.value = userResponse.data.data
    selectedRoles.value = user.value.roles.map((role) => role.name)
    const data = rolesResponse.data.data
    roles.value = Array.isArray(data) ? data : (data as { data: RoleItem[] }).data
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
    const response = await api.showUser(userId)
    user.value = response.data.data
    selectedRoles.value = user.value.roles.map((role) => role.name)
    toast.add({ severity: 'success', summary: t('users.rolesUpdated'), life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: t('common.error'), life: 4000 })
  } finally {
    savingRoles.value = false
  }
}

function requestStatusChange(shouldActivate: boolean) {
  if (!user.value || savingStatus.value) return
  const nextStatus = shouldActivate ? 'active' : 'suspended'
  confirm.require({
    message: shouldActivate ? t('users.confirmActivate') : t('users.confirmSuspend'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: shouldActivate ? '' : 'p-button-danger',
    accept: async () => {
      savingStatus.value = true
      try {
        await api.updateUserStatus(userId, { status: nextStatus })
        user.value!.status = nextStatus
        toast.add({ severity: 'success', summary: t('users.statusUpdated'), life: 3000 })
      } catch {
        toast.add({ severity: 'error', summary: t('common.error'), life: 4000 })
      } finally {
        savingStatus.value = false
      }
    },
  })
}
</script>

<template>
  <div>
    <PageHeader :title="t('users.editUser')" :description="user?.email ?? ''">
      <template #actions>
        <Button :label="t('common.cancel')" icon="pi pi-arrow-left" text severity="secondary" @click="router.push({ name: 'user-detail', params: { id: userId } })" />
      </template>
    </PageHeader>

    <LoadingState v-if="loading" />
    <ApiErrorMessage v-else-if="error" :error="error" />
    <div v-else-if="user" class="user-edit-layout">
      <section class="user-edit-summary">
        <Avatar :label="user.name.charAt(0).toUpperCase()" shape="circle" class="user-detail-avatar" />
        <div class="min-w-0"><h2>{{ user.name }}</h2><p>{{ user.email }}</p></div>
      </section>

      <section class="user-detail-card user-edit-section">
        <header><span class="user-detail-card-icon"><i class="pi pi-toggle-on" /></span><div><h3>{{ t('users.accountStatus') }}</h3><p>{{ t('users.statusDescription') }}</p></div></header>
        <div class="user-edit-status-row">
          <div><p class="font-semibold text-slate-700">{{ user.status === 'active' ? t('users.statusActive') : t('users.statusSuspended') }}</p><p class="mt-1 text-xs text-slate-400">{{ t('users.statusToggleHint') }}</p></div>
          <ToggleSwitch :model-value="user.status === 'active'" :disabled="savingStatus" @update:model-value="requestStatusChange" />
        </div>
      </section>

      <section class="user-detail-card user-edit-section">
        <header><span class="user-detail-card-icon"><i class="pi pi-shield" /></span><div><h3>{{ t('common.roles') }}</h3><p>{{ t('users.rolesEditDescription') }}</p></div></header>
        <div class="user-edit-roles">
          <MultiSelect v-model="selectedRoles" :options="roles" option-label="name" option-value="name" :placeholder="t('roles.selectPermissions')" class="w-full" filter />
          <div class="flex justify-end"><Button :label="t('common.save')" icon="pi pi-check" :loading="savingRoles" @click="saveRoles" /></div>
        </div>
      </section>
    </div>
  </div>
</template>
