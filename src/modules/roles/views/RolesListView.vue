<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import type { DataTablePageEvent } from 'primevue/datatable'
import { useRolesStore } from '../store'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingState from '@/components/shared/LoadingState.vue'
import ApiErrorMessage from '@/components/shared/ApiErrorMessage.vue'
import CreateRoleDialog from '../components/CreateRoleDialog.vue'
import EditRoleDialog from '../components/EditRoleDialog.vue'
import type { RoleItem } from '@/api/generated/models'

const { t } = useI18n()
const toast = useToast()
const confirm = useConfirm()
const store = useRolesStore()

const showCreateDialog = ref(false)
const editingRole = ref<RoleItem | null>(null)
const search = ref('')
let searchTimer: ReturnType<typeof setTimeout>

onMounted(() => store.fetchRoles())

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    store.pagination.reset()
    store.fetchRoles({ 'filter[name][cont]': search.value || undefined })
  }, 400)
}

function onPage(event: DataTablePageEvent) {
  store.pagination.onPage(event)
  store.fetchRoles({ 'filter[name][cont]': search.value || undefined })
}

function confirmDelete(role: RoleItem) {
  confirm.require({
    message: t('roles.confirmDelete', { name: role.name }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await store.deleteRole(role.id)
        toast.add({ severity: 'success', summary: t('roles.deletedSuccess'), life: 3000 })
      } catch {
        toast.add({ severity: 'error', summary: t('common.error'), life: 4000 })
      }
    },
  })
}

function onCreated() {
  showCreateDialog.value = false
  store.fetchRoles()
}

function onUpdated() {
  editingRole.value = null
  store.fetchRoles()
}
</script>

<template>
  <div>
    <PageHeader :title="t('roles.title')" :description="t('roles.description')">
      <template #actions>
        <Button :label="t('roles.addRole')" icon="pi pi-plus" @click="showCreateDialog = true" />
      </template>
    </PageHeader>

    <div class="mb-4">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="search"
          :placeholder="t('common.search')"
          class="w-full sm:w-80"
          @input="onSearch"
        />
      </IconField>
    </div>

    <LoadingState v-if="store.loading && !store.roles.length" />

    <ApiErrorMessage v-else-if="store.error" :error="store.error" />

    <DataTable
      v-else
      :value="store.roles"
      :loading="store.loading"
      lazy
      paginator
      :rows="store.pagination.perPage"
      :totalRecords="store.pagination.total"
      :rowsPerPageOptions="[10, 20, 50]"
      @page="onPage"
      class="w-full"
    >
      <template #empty>
        <div class="py-8 text-center text-surface-500">{{ t('common.empty') }}</div>
      </template>

      <Column field="name" :header="t('common.name')" />
      <Column field="permissions" :header="t('common.permissions')">
        <template #body="{ data }">
          <span class="text-surface-500 text-sm">
            {{ data.permissions.length }} {{ t('roles.permissionsCount') }}
          </span>
        </template>
      </Column>
      <Column field="created_at" :header="t('common.createdAt')">
        <template #body="{ data }">
          {{ new Date(data.created_at).toLocaleDateString() }}
        </template>
      </Column>
      <Column :header="t('common.actions')" style="width: 10rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              size="small"
              text
              severity="secondary"
              @click="editingRole = data"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              text
              severity="danger"
              @click="confirmDelete(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <CreateRoleDialog v-model:visible="showCreateDialog" @created="onCreated" />
    <EditRoleDialog
      v-if="editingRole"
      :role="editingRole"
      :visible="!!editingRole"
      @update:visible="(v) => { if (!v) editingRole = null }"
      @updated="onUpdated"
    />
  </div>
</template>
