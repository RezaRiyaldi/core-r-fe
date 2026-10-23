<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useNotificationsStore } from '../store'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingState from '@/components/shared/LoadingState.vue'
import ApiErrorMessage from '@/components/shared/ApiErrorMessage.vue'
import type { NotificationItem } from '@/api/generated/models'

const { t } = useI18n()
const toast = useToast()
const confirm = useConfirm()
const store = useNotificationsStore()

onMounted(() => {
  store.fetchNotifications()
  store.fetchUnreadCount()
})

function confirmDelete(item: NotificationItem) {
  confirm.require({
    message: t('notifications.confirmDelete'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await store.deleteNotification(item.id)
        toast.add({ severity: 'success', summary: t('notifications.deletedSuccess'), life: 3000 })
      } catch {
        toast.add({ severity: 'error', summary: t('common.error'), life: 4000 })
      }
    },
  })
}
</script>

<template>
  <div>
    <PageHeader :title="t('notifications.title')" :description="t('notifications.description')">
      <template #actions>
        <Button
          :label="t('notifications.markAllRead')"
          icon="pi pi-check-circle"
          severity="secondary"
          text
          :disabled="store.unreadCount === 0"
          @click="store.markAllRead()"
        />
      </template>
    </PageHeader>

    <LoadingState v-if="store.loading && !store.notifications.length" />

    <ApiErrorMessage v-else-if="store.error" :error="store.error" />

    <template v-else>
      <div v-if="!store.notifications.length" class="py-16 text-center text-surface-500">
        {{ t('common.empty') }}
      </div>

      <div v-else class="flex flex-col gap-2">
        <div
          v-for="item in store.notifications"
          :key="item.id"
          class="flex items-start gap-3 rounded-lg border border-surface-200 p-4"
          :class="{ 'bg-surface-50': !item.read_at }"
        >
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ item.title }}</span>
              <Tag v-if="!item.read_at" :value="t('notifications.unread')" severity="info" />
            </div>
            <p class="mt-1 text-sm text-surface-600">{{ item.message }}</p>
            <span class="mt-1 block text-xs text-surface-400">
              {{ new Date(item.created_at).toLocaleString() }}
            </span>
          </div>
          <div class="flex gap-1">
            <Button
              v-if="!item.read_at"
              icon="pi pi-check"
              size="small"
              text
              severity="secondary"
              :title="t('notifications.markRead')"
              @click="store.markRead(item.id)"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              text
              severity="danger"
              @click="confirmDelete(item)"
            />
          </div>
        </div>
      </div>

      <!-- Cursor pagination -->
      <div class="mt-4 flex justify-end gap-2">
        <Button
          icon="pi pi-chevron-left"
          :disabled="!store.pagination.prevCursor"
          text
          severity="secondary"
          @click="store.loadPrev()"
        />
        <Button
          icon="pi pi-chevron-right"
          :disabled="!store.pagination.nextCursor"
          text
          severity="secondary"
          @click="store.loadNext()"
        />
      </div>
    </template>
  </div>
</template>
