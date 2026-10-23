<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useProfileStore } from '@/modules/profile/store'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingState from '@/components/shared/LoadingState.vue'

const { t } = useI18n()
const toast = useToast()
const confirm = useConfirm()
const store = useProfileStore()

onMounted(() => store.fetchTokens())

function confirmRevoke(id: number, name: string) {
  confirm.require({
    message: t('tokens.confirmRevoke', { name }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await store.revokeToken(id)
        toast.add({ severity: 'success', summary: t('tokens.revokedSuccess'), life: 3000 })
      } catch {
        toast.add({ severity: 'error', summary: t('common.error'), life: 4000 })
      }
    },
  })
}

function confirmRevokeAll() {
  confirm.require({
    message: t('tokens.confirmRevokeAll'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await store.revokeAll()
        toast.add({ severity: 'success', summary: t('tokens.revokedAllSuccess'), life: 3000 })
      } catch {
        toast.add({ severity: 'error', summary: t('common.error'), life: 4000 })
      }
    },
  })
}
</script>

<template>
  <div>
    <PageHeader :title="t('tokens.title')" :description="t('tokens.description')">
      <template #actions>
        <Button
          :label="t('tokens.revokeAll')"
          icon="pi pi-times"
          severity="danger"
          outlined
          :disabled="!store.tokens.length"
          @click="confirmRevokeAll"
        />
      </template>
    </PageHeader>

    <LoadingState v-if="store.loadingTokens" />

    <DataTable v-else :value="store.tokens" class="w-full">
      <template #empty>
        <div class="py-8 text-center text-surface-500">{{ t('common.empty') }}</div>
      </template>

      <Column field="name" :header="t('common.name')" />
      <Column field="last_used_at" :header="t('tokens.lastUsed')">
        <template #body="{ data }">
          {{ data.last_used_at ? new Date(data.last_used_at).toLocaleString() : '-' }}
        </template>
      </Column>
      <Column field="expires_at" :header="t('tokens.expiresAt')">
        <template #body="{ data }">
          {{ data.expires_at ? new Date(data.expires_at).toLocaleString() : '-' }}
        </template>
      </Column>
      <Column field="is_current" :header="t('tokens.current')">
        <template #body="{ data }">
          <Tag v-if="data.is_current" :value="t('tokens.current')" severity="info" />
        </template>
      </Column>
      <Column :header="t('common.actions')">
        <template #body="{ data }">
          <Button
            :label="t('tokens.revoke')"
            size="small"
            text
            severity="danger"
            :disabled="data.is_current"
            @click="confirmRevoke(data.id, data.name)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
