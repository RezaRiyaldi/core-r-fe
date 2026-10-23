<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useUsersStore } from '../store'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingState from '@/components/shared/LoadingState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import ApiErrorMessage from '@/components/shared/ApiErrorMessage.vue'
import CreateUserDialog from '../components/CreateUserDialog.vue'
import type { UserProfile } from '@/api/generated/models'

const { t } = useI18n()
const toast = useToast()
const confirm = useConfirm()
const store = useUsersStore()

const showCreateDialog = ref(false)
const search = ref('')
let searchTimer: ReturnType<typeof setTimeout>

onMounted(() => store.fetchUsers())

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    store.fetchUsers({ search: search.value || undefined })
  }, 400)
}

function loadNext() {
  if (store.nextCursor) store.fetchUsers({ cursor: store.nextCursor })
}

function loadPrev() {
  if (store.prevCursor) store.fetchUsers({ cursor: store.prevCursor })
}

function confirmToggleStatus(user: UserProfile) {
  const isSuspended = user.status === 'suspended'
  confirm.require({
    message: isSuspended ? t('users.confirmActivate') : t('users.confirmSuspend'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: isSuspended ? '' : 'p-button-danger',
    accept: async () => {
      try {
        await store.updateUserStatus(user.id, isSuspended ? 'active' : 'suspended')
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

    <!-- Search -->
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

    <LoadingState v-if="store.loading" />

    <ApiErrorMessage v-else-if="store.error" :error="store.error" />

    <template v-else>
      <EmptyState v-if="!store.users.length" />

      <div v-else>
        <DataTable :value="store.users" class="w-full">
          <Column field="name" :header="t('common.name')" />
          <Column field="email" :header="t('common.email')" />
          <Column field="roles" :header="t('common.roles')">
            <template #body="{ data }">
              <Tag
                v-for="role in data.roles"
                :key="role"
                :value="role"
                severity="secondary"
                class="mr-1"
              />
            </template>
          </Column>
          <Column field="status" :header="t('common.status')">
            <template #body="{ data }">
              <Tag
                :value="data.status === 'active' ? t('users.statusActive') : t('users.statusSuspended')"
                :severity="data.status === 'active' ? 'success' : 'warn'"
              />
            </template>
          </Column>
          <Column :header="t('common.actions')">
            <template #body="{ data }">
              <Button
                :label="t('users.editStatus')"
                size="small"
                text
                severity="secondary"
                @click="confirmToggleStatus(data)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- Cursor pagination -->
        <div class="mt-4 flex justify-end gap-2">
          <Button
            icon="pi pi-chevron-left"
            :disabled="!store.prevCursor"
            text
            severity="secondary"
            @click="loadPrev"
          />
          <Button
            icon="pi pi-chevron-right"
            :disabled="!store.nextCursor"
            text
            severity="secondary"
            @click="loadNext"
          />
        </div>
      </div>
    </template>

    <CreateUserDialog
      v-model:visible="showCreateDialog"
      @created="onUserCreated"
    />
  </div>
</template>
