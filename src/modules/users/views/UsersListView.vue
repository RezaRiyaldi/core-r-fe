<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import type { DataTablePageEvent } from 'primevue/datatable'
import { useUsersStore } from '../store'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingState from '@/components/shared/LoadingState.vue'
import ApiErrorMessage from '@/components/shared/ApiErrorMessage.vue'
import CreateUserDialog from '../components/CreateUserDialog.vue'
import type { UserListItem } from '@/api/generated/models'

const { t } = useI18n()
const toast = useToast()
const confirm = useConfirm()
const router = useRouter()
const store = useUsersStore()

const showCreateDialog = ref(false)
const search = ref('')
let searchTimer: ReturnType<typeof setTimeout>

onMounted(() => store.fetchUsers())

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    store.pagination.reset()
    store.fetchUsers({ search: search.value || undefined })
  }, 400)
}

function onPage(event: DataTablePageEvent) {
  store.pagination.onPage(event)
  store.fetchUsers({ search: search.value || undefined })
}

function confirmToggleStatus(user: UserListItem, shouldActivate: boolean) {
  confirm.require({
    message: shouldActivate ? t('users.confirmActivate') : t('users.confirmSuspend'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: shouldActivate ? '' : 'p-button-danger',
    accept: async () => {
      try {
        await store.updateUserStatus(user.id, shouldActivate ? 'active' : 'suspended')
        toast.add({ severity: 'success', summary: t('users.statusUpdated'), life: 3000 })
      } catch {
        toast.add({ severity: 'error', summary: t('common.error'), life: 4000 })
      }
    },
  })
}

function onUserCreated() {
  showCreateDialog.value = false
  store.fetchUsers()
}
</script>

<template>
  <div>
    <PageHeader :title="t('users.title')" :description="t('users.description')">
      <template #actions>
        <Button
          :label="t('users.addUser')"
          icon="pi pi-plus"
          @click="showCreateDialog = true"
        />
      </template>
    </PageHeader>

    <div class="table-toolbar">
      <IconField class="table-search">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="search"
          :placeholder="t('common.search')"
          class="w-full"
          @input="onSearch"
        />
      </IconField>
    </div>

    <LoadingState v-if="store.loading && !store.users.length" />

    <ApiErrorMessage v-else-if="store.error" :error="store.error" />

    <DataTable
      v-else
      :value="store.users"
      :loading="store.loading"
      lazy
      paginator
      :rows="store.pagination.perPage"
      :totalRecords="store.pagination.total"
      :rowsPerPageOptions="[10, 20, 50]"
      @page="onPage"
      class="w-full"
    >
      <Column header="#" style="width: 4.5rem">
        <template #body="{ index }">{{ (store.pagination.page - 1) * store.pagination.perPage + index + 1 }}</template>
      </Column>
      <template #empty>
        <div class="py-8 text-center text-surface-500">{{ t('common.empty') }}</div>
      </template>

      <Column field="name" :header="t('common.name')" />
      <Column field="email" :header="t('common.email')" />
      <Column field="roles" :header="t('common.roles')">
        <template #body="{ data }">
          <Tag
            v-for="role in data.roles"
            :key="role.id"
            :value="role.name"
            severity="secondary"
            class="mr-1"
          />
        </template>
      </Column>
      <Column field="status" :header="t('common.status')">
        <template #body="{ data }">
          <div class="flex items-center gap-3">
            <ToggleSwitch
              :model-value="data.status === 'active'"
              :aria-label="data.status === 'active' ? t('users.statusActive') : t('users.statusSuspended')"
              @update:model-value="(value) => confirmToggleStatus(data, value)"
            />
            <span :class="['text-xs font-semibold', data.status === 'active' ? 'text-emerald-700' : 'text-slate-400']">
              {{ data.status === 'active' ? t('users.statusActive') : t('users.statusSuspended') }}
            </span>
          </div>
        </template>
      </Column>
      <Column :header="t('common.actions')">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-1">
            <Button :label="t('common.detail')" icon="pi pi-eye" size="small" text severity="secondary" @click="router.push({ name: 'user-detail', params: { id: data.id } })" />
            <Button :label="t('common.edit')" icon="pi pi-pencil" size="small" text severity="secondary" @click="router.push({ name: 'user-edit', params: { id: data.id } })" />
          </div>
        </template>
      </Column>
    </DataTable>

    <CreateUserDialog
      v-model:visible="showCreateDialog"
      @created="onUserCreated"
    />
  </div>
</template>
