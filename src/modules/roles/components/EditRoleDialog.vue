<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useRolesStore } from '../store'
import { api } from '@/api'
import type { RoleItem, PermissionItem } from '@/api/generated/models'

const props = defineProps<{ visible: boolean; role: RoleItem }>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  updated: []
}>()

const { t } = useI18n()
const toast = useToast()
const store = useRolesStore()

const submitting = ref(false)
const serverError = ref('')
const fieldErrors = reactive<Record<string, string>>({})
const allPermissions = ref<PermissionItem[]>([])

const form = reactive({ name: '', permissions: [] as string[] })

onMounted(async () => {
  const res = await api.listPermissions({ per_page: 100 })
  const body = res.data as { data: PermissionItem[] | { data: PermissionItem[] } }
  allPermissions.value = Array.isArray(body.data) ? body.data : (body.data as { data: PermissionItem[] }).data
})

watch(
  () => props.role,
  (role) => {
    form.name = role.name
    form.permissions = role.permissions.map((p) => p.name)
  },
  { immediate: true },
)

function close() {
  serverError.value = ''
  Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
  emit('update:visible', false)
}

async function submit() {
  serverError.value = ''
  Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
  submitting.value = true
  try {
    await store.updateRole(props.role.id, {
      updated_at: props.role.updated_at,
      name: form.name || undefined,
      permissions: form.permissions,
    })
    toast.add({ severity: 'success', summary: t('roles.updatedSuccess'), life: 3000 })
    emit('updated')
  } catch (err: unknown) {
    const axiosErr = err as {
      response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } }
    }
    if (axiosErr.response?.status === 422 && axiosErr.response.data?.errors) {
      Object.entries(axiosErr.response.data.errors).forEach(([field, msgs]) => {
        fieldErrors[field] = msgs[0] ?? ''
      })
    } else {
      serverError.value = axiosErr.response?.data?.message ?? t('common.error')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    :header="t('roles.editTitle')"
    :style="{ width: '36rem' }"
    :modal="true"
    :closable="!submitting"
    @update:visible="close"
  >
    <form @submit.prevent="submit" novalidate class="flex flex-col gap-4">
      <Message v-if="serverError" severity="error" :closable="false">{{ serverError }}</Message>

      <div>
        <label class="mb-1 block text-sm font-medium text-surface-700">{{ t('common.name') }}</label>
        <InputText v-model="form.name" class="w-full" :disabled="submitting" required />
        <small v-if="fieldErrors.name" class="text-red-500">{{ fieldErrors.name }}</small>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-surface-700">{{ t('common.permissions') }}</label>
        <MultiSelect
          v-model="form.permissions"
          :options="allPermissions"
          optionLabel="name"
          optionValue="name"
          :placeholder="t('roles.selectPermissions')"
          class="w-full"
          :disabled="submitting"
          filter
        />
        <small v-if="fieldErrors.permissions" class="text-red-500">{{ fieldErrors.permissions }}</small>
      </div>
    </form>

    <template #footer>
      <Button :label="t('common.cancel')" text severity="secondary" :disabled="submitting" @click="close" />
      <Button :label="t('common.save')" :loading="submitting" @click="submit" />
    </template>
  </Dialog>
</template>
